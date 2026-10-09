import {
  Bytes,
  Unsubscribe,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocsFromServer,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db, emulatorHost, firebaseConfig } from './firebase';
import { Complaint, AnalyticsSummary, DepartmentType } from '../src/types';
import { SEED_COMPLAINTS, ANALYTICS_BASELINE, AnalyticsBaseline } from './seedData';

// Firestore layout:
//   complaints/{ticketId}   one document per grievance
//   images/{autoId}         uploaded photos, referenced from complaints as /api/images/{autoId}
//   analytics/baseline      ward, trend and KPI baseline shown on the analytics pages
//   meta/seed               marker so demo data is only written once
const complaintsCol = collection(db, 'complaints');
const imagesCol = collection(db, 'images');
const baselineRef = doc(db, 'analytics', 'baseline');
const seedMarkerRef = doc(db, 'meta', 'seed');

const RETRY_MS = 15000;
const REQUEST_TIMEOUT_MS = 20000;
// Firestore caps a document at 1 MiB; leave headroom for the other image fields.
const MAX_IMAGE_BYTES = 1_000_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EMPTY_BASELINE: AnalyticsBaseline = {
  baseTotal: 0,
  baseResolved: 0,
  basePending: 0,
  slaComplianceRate: 0,
  citizenSatisfactionRate: 0,
  duplicatePreventedCount: 0,
  wards: [],
  monthlyTrends: [],
  aiExecutiveSummary: { keyInsights: [], criticalHotspots: [], recommendedActions: [] }
};

// Writes only settle once the server acknowledges them, so an unreachable backend would
// otherwise leave the HTTP request hanging.
function withTimeout<T>(promise: Promise<T>, ms: number = REQUEST_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for Firestore')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

// The SDK reports "no database" and "rules deny access" with the same permission-denied
// code; the REST API tells them apart.
async function databaseExists(): Promise<boolean> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/meta/seed?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) return true;
    const body: any = await res.json();
    const serviceDisabled = body?.error?.details?.some((d: any) => d.reason === 'SERVICE_DISABLED');
    const missingDatabase = /database .* does not exist/i.test(body?.error?.message || '');
    return !serviceDisabled && !missingDatabase;
  } catch {
    return true;
  }
}

async function describeFirestoreError(err: any): Promise<string> {
  const detail = err?.message || String(err);
  if (emulatorHost) {
    return `Firestore emulator at ${emulatorHost} is not reachable (${detail}).`;
  }
  const consoleUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`;
  const noDatabase = `No Firestore database exists in Firebase project "${firebaseConfig.projectId}" yet. Create one at ${consoleUrl}`;
  if (err?.code === 'not-found') return noDatabase;
  if (err?.code === 'permission-denied') {
    if (!(await databaseExists())) return noDatabase;
    return `Firestore security rules are blocking this server. Allow read and write in the Rules tab at ${consoleUrl}`;
  }
  return `Cannot reach Firestore (${detail}).`;
}

export class ImageRejectedError extends Error {}

class StorageManager {
  // In-memory mirror of Firestore, kept current by snapshot listeners so reads stay synchronous.
  private complaints: Complaint[] = [];
  private baseline: AnalyticsBaseline = EMPTY_BASELINE;

  private ready = false;
  private connecting = false;
  private seedChecked = false;
  private statusMessage = 'Connecting to Firestore...';
  private unsubscribers: Unsubscribe[] = [];

  public isReady(): boolean {
    return this.ready;
  }

  public getStatusMessage(): string {
    return this.statusMessage;
  }

  // Connects in the background and keeps retrying, so the server recovers on its own once
  // the database is created or its rules are fixed.
  public connect(): void {
    if (this.connecting || this.ready) return;
    this.connecting = true;
    this.init()
      .then(() => {
        this.ready = true;
        this.statusMessage = 'Connected to Firestore';
        const target = emulatorHost ? `emulator ${emulatorHost}` : `project ${firebaseConfig.projectId}`;
        console.log(`🔥 Firestore connected (${target}): ${this.complaints.length} complaints loaded`);
      })
      .catch((err) => this.scheduleReconnect(err))
      .finally(() => {
        this.connecting = false;
      });
  }

  // One-shot load used on serverless hosts instead of connect().
  public async refresh(): Promise<void> {
    try {
      if (!this.seedChecked) {
        await this.seedIfEmpty();
        this.seedChecked = true;
      }
      const [complaints, baseline] = await withTimeout(Promise.all([
        getDocsFromServer(complaintsCol),
        getDocFromServer(baselineRef)
      ]));
      this.complaints = complaints.docs.map((d) => d.data() as Complaint);
      this.baseline = { ...EMPTY_BASELINE, ...(baseline.data() as Partial<AnalyticsBaseline> | undefined) };
      this.ready = true;
      this.statusMessage = 'Connected to Firestore';
    } catch (err) {
      this.ready = false;
      this.statusMessage = await describeFirestoreError(err);
      throw err;
    }
  }

  private async scheduleReconnect(err: any): Promise<void> {
    this.ready = false;
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];

    const message = await describeFirestoreError(err);
    if (message !== this.statusMessage) {
      console.error(`\n⚠️  Firestore unavailable: ${message}\n   Retrying every ${RETRY_MS / 1000}s...\n`);
    }
    this.statusMessage = message;
    setTimeout(() => this.connect(), RETRY_MS);
  }

  private async init(): Promise<void> {
    await this.seedIfEmpty();
    await withTimeout(Promise.all([this.watchComplaints(), this.watchBaseline()]));
  }

  private async seedIfEmpty(): Promise<void> {
    const marker = await withTimeout(getDocFromServer(seedMarkerRef));
    if (marker.exists()) return;

    const batch = writeBatch(db);
    for (const complaint of SEED_COMPLAINTS) {
      batch.set(doc(complaintsCol, complaint.id), complaint);
    }
    batch.set(baselineRef, ANALYTICS_BASELINE);
    batch.set(seedMarkerRef, { seededAt: new Date().toISOString(), complaints: SEED_COMPLAINTS.length });
    await withTimeout(batch.commit());
    console.log(`🌱 Seeded Firestore with ${SEED_COMPLAINTS.length} demo complaints and the analytics baseline`);
  }

  // Resolves once the first server-confirmed snapshot has arrived.
  private watchComplaints(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.unsubscribers.push(onSnapshot(
        complaintsCol,
        { includeMetadataChanges: true },
        (snap) => {
          this.complaints = snap.docs.map((d) => d.data() as Complaint);
          if (!snap.metadata.fromCache) resolve();
        },
        (err) => {
          reject(err);
          this.onListenerLost(err);
        }
      ));
    });
  }

  private watchBaseline(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.unsubscribers.push(onSnapshot(
        baselineRef,
        { includeMetadataChanges: true },
        (snap) => {
          this.baseline = { ...EMPTY_BASELINE, ...(snap.data() as Partial<AnalyticsBaseline> | undefined) };
          if (!snap.metadata.fromCache) resolve();
        },
        (err) => {
          reject(err);
          this.onListenerLost(err);
        }
      ));
    });
  }

  // A listener that fails after startup (rules changed, database deleted) is dead for good.
  private onListenerLost(err: any): void {
    if (this.ready) this.scheduleReconnect(err);
  }

  private upsertLocal(complaint: Complaint): void {
    const idx = this.complaints.findIndex(c => c.id === complaint.id);
    if (idx === -1) {
      this.complaints.unshift(complaint);
    } else {
      this.complaints[idx] = complaint;
    }
  }

  public getAllComplaints(filters?: {
    department?: string;
    priority?: string;
    status?: string;
    ward?: string;
    search?: string;
  }): Complaint[] {
    let list = [...this.complaints];

    if (filters) {
      if (filters.department && filters.department !== 'ALL') {
        list = list.filter(c => c.department.toLowerCase() === filters.department?.toLowerCase());
      }
      if (filters.priority && filters.priority !== 'ALL') {
        list = list.filter(c => c.priority.toLowerCase() === filters.priority?.toLowerCase());
      }
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter(c => c.status.toLowerCase() === filters.status?.toLowerCase());
      }
      if (filters.ward && filters.ward !== 'ALL') {
        list = list.filter(c => c.location.ward.toLowerCase().includes(filters.ward?.toLowerCase() || ''));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(c =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.address.toLowerCase().includes(q) ||
          c.location.landmark.toLowerCase().includes(q)
        );
      }
    }

    // Sort by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public hasComplaintId(id: string): boolean {
    return this.complaints.some(c => c.id === id);
  }

  public getComplaintById(id: string): Complaint | undefined {
    if (!id) return undefined;
    const clean = id.trim().toUpperCase().replace(/^#/, '');

    // 1. Direct exact match
    const direct = this.complaints.find(c => c.id.toUpperCase() === clean);
    if (direct) return direct;

    // 2. Exact match with year/civic prefix variations
    const withPrefix = this.complaints.find(c =>
      c.id.toUpperCase() === `CIVIC-2026-${clean}` ||
      c.id.toUpperCase() === `CIVIC-${clean}` ||
      c.id.toUpperCase().endsWith(`-${clean}`)
    );
    if (withPrefix) return withPrefix;

    // 3. Match by number suffix (e.g. searching '1001' or '3702')
    const bySuffix = this.complaints.find(c => {
      const parts = c.id.split('-');
      const lastPart = parts[parts.length - 1];
      return lastPart && lastPart.toUpperCase() === clean;
    });
    if (bySuffix) return bySuffix;

    // 4. Fallback: contains match
    return this.complaints.find(c => c.id.toUpperCase().includes(clean));
  }

  public async addComplaint(complaint: Complaint): Promise<Complaint> {
    await withTimeout(setDoc(doc(complaintsCol, complaint.id), complaint));
    this.upsertLocal(complaint);
    return complaint;
  }

  public async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | undefined> {
    const existing = this.getComplaintById(id);
    if (!existing) return undefined;

    const changes = { ...updates, updatedAt: new Date().toISOString() };
    await withTimeout(updateDoc(doc(complaintsCol, existing.id), changes));

    const updated: Complaint = { ...existing, ...changes };
    this.upsertLocal(updated);
    return updated;
  }

  public async upvoteComplaint(id: string, voterId: string = 'anon'): Promise<{ complaint: Complaint; isFirstVote: boolean } | undefined> {
    const item = this.getComplaintById(id);
    if (!item) return undefined;

    const alreadyVoted = item.upvoters.includes(voterId);
    const complaint = await this.updateComplaint(item.id, alreadyVoted
      ? { upvotes: Math.max(0, item.upvotes - 1), upvoters: item.upvoters.filter(v => v !== voterId) }
      : { upvotes: item.upvotes + 1, upvoters: [...item.upvoters, voterId] });
    if (!complaint) return undefined;

    return { complaint, isFirstVote: !alreadyVoted };
  }

  public async submitFeedback(id: string, rating: number, comment: string): Promise<Complaint | undefined> {
    const item = this.getComplaintById(id);
    if (!item) return undefined;

    const feedback = {
      rating,
      comment,
      isSatisfied: rating >= 3,
      submittedAt: new Date().toISOString()
    };

    return this.updateComplaint(id, { feedback });
  }

  // Stores an uploaded photo (sent by the browser as a base64 data URL) as its own
  // document and returns the URL the complaint should reference.
  public async saveImage(dataUrl: string, meta: { complaintId: string; kind: 'before' | 'after' }): Promise<string> {
    const comma = dataUrl.indexOf(',');
    const header = comma === -1 ? '' : dataUrl.slice(0, comma);
    const contentType = header.slice('data:'.length).split(';')[0].toLowerCase();
    if (!header.endsWith(';base64') || !IMAGE_TYPES.includes(contentType)) {
      throw new ImageRejectedError('Photo must be a JPEG, PNG, WebP or GIF image.');
    }

    let data: Bytes;
    try {
      data = Bytes.fromBase64String(dataUrl.slice(comma + 1));
    } catch {
      throw new ImageRejectedError('Photo data is corrupted. Please upload it again.');
    }
    if (data.toUint8Array().length > MAX_IMAGE_BYTES) {
      throw new ImageRejectedError('Photo is too large. Please upload an image under 1 MB.');
    }

    const ref = await withTimeout(addDoc(imagesCol, {
      complaintId: meta.complaintId,
      kind: meta.kind,
      contentType,
      data,
      createdAt: new Date().toISOString()
    }));
    return `/api/images/${ref.id}`;
  }

  // Moves any freshly uploaded photos in the list into Firestore; plain URLs pass through.
  public persistImages(urls: string[], meta: { complaintId: string; kind: 'before' | 'after' }): Promise<string[]> {
    return Promise.all(urls.map(url => (url.startsWith('data:') ? this.saveImage(url, meta) : url)));
  }

  public async getImage(id: string): Promise<{ contentType: string; data: Buffer } | undefined> {
    const snap = await withTimeout(getDoc(doc(imagesCol, id)));
    if (!snap.exists()) return undefined;
    const { contentType, data } = snap.data() as { contentType: string; data: Bytes };
    return { contentType, data: Buffer.from(data.toUint8Array()) };
  }

  public getAnalyticsSummary(): AnalyticsSummary {
    const all = this.complaints;
    const base = this.baseline;
    const totalGrievances = base.baseTotal + all.length;
    const resolvedCount = base.baseResolved + all.filter(c => c.status === 'Resolved').length;
    const inProgressCount = all.filter(c => c.status === 'In_Progress' || c.status === 'Assigned').length;
    const pendingCount = base.basePending + all.filter(c => c.status === 'Submitted' || c.status === 'AI_Triaged').length;

    // Calculate avg turnaround time
    const resolvedWithTime = all.filter(c => c.status === 'Resolved' && c.resolvedAt);
    let avgTurnaroundHours = 18.5; // fallback
    if (resolvedWithTime.length > 0) {
      const totalHours = resolvedWithTime.reduce((sum, c) => {
        const diffMs = new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime();
        return sum + diffMs / (1000 * 60 * 60);
      }, 0);
      avgTurnaroundHours = Number((totalHours / resolvedWithTime.length).toFixed(1));
    }

    const deptMap: Record<DepartmentType, { total: number; resolved: number; pending: number }> = {
      'Roads & Infrastructure': { total: 0, resolved: 0, pending: 0 },
      'Solid Waste & Sanitation': { total: 0, resolved: 0, pending: 0 },
      'Water Supply & Sewerage': { total: 0, resolved: 0, pending: 0 },
      'Electricity & Power': { total: 0, resolved: 0, pending: 0 },
      'Public Health & Sanitation': { total: 0, resolved: 0, pending: 0 },
      'Urban Planning & Encroachment': { total: 0, resolved: 0, pending: 0 },
      'Parks & Recreation': { total: 0, resolved: 0, pending: 0 },
      'Traffic & Transport': { total: 0, resolved: 0, pending: 0 }
    };

    all.forEach(c => {
      if (!deptMap[c.department]) {
        deptMap[c.department] = { total: 0, resolved: 0, pending: 0 };
      }
      deptMap[c.department].total += 1;
      if (c.status === 'Resolved') {
        deptMap[c.department].resolved += 1;
      } else {
        deptMap[c.department].pending += 1;
      }
    });

    const departments = Object.keys(deptMap).map((dName) => {
      const d = deptMap[dName as DepartmentType];
      const resRate = d.total > 0 ? (d.resolved / d.total) * 100 : 85;
      return {
        name: dName as DepartmentType,
        totalComplaints: d.total,
        resolvedComplaints: d.resolved,
        pendingComplaints: d.pending,
        avgResolutionTimeHours: dName.includes('Electricity') ? 6.2 : dName.includes('Water') ? 14.5 : 28.0,
        slaComplianceRate: Number(Math.min(99.2, Math.max(78, resRate + 15)).toFixed(1)),
        satisfactionScore: 4.6,
        activeOfficers: 12
      };
    });

    const priorityDistribution = [
      { name: 'Critical' as const, count: all.filter(c => c.priority === 'Critical').length, color: '#e11d48' },
      { name: 'High' as const, count: all.filter(c => c.priority === 'High').length, color: '#f97316' },
      { name: 'Medium' as const, count: all.filter(c => c.priority === 'Medium').length, color: '#0284c7' },
      { name: 'Low' as const, count: all.filter(c => c.priority === 'Low').length, color: '#10b981' }
    ];

    const categoryDistribution = Object.keys(deptMap).map(k => ({
      name: k.replace('&', '+').replace('Infrastructure', 'Infra').replace('Sanitation', 'Waste'),
      count: deptMap[k as DepartmentType].total
    })).filter(c => c.count > 0);

    return {
      totalGrievances,
      resolvedCount,
      inProgressCount,
      pendingCount,
      avgTurnaroundHours,
      slaComplianceRate: base.slaComplianceRate,
      citizenSatisfactionRate: base.citizenSatisfactionRate,
      duplicatePreventedCount: base.duplicatePreventedCount,
      departments,
      wards: base.wards,
      priorityDistribution,
      categoryDistribution,
      monthlyTrends: base.monthlyTrends,
      aiExecutiveSummary: {
        ...base.aiExecutiveSummary,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export const storage = new StorageManager();
