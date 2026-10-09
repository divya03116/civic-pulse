import {
  Complaint,
  AnalyticsSummary,
  AIAnalysisResult,
  DepartmentType,
  PriorityLevel,
  ChatMessage
} from '../types';

const API_BASE = '/api';

export const api = {
  // Fetch complaints with filters
  async getComplaints(filters?: {
    department?: string;
    priority?: string;
    status?: string;
    ward?: string;
    search?: string;
  }): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ward) params.append('ward', filters.ward);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch complaints');
    return json.data;
  },

  // Get complaint by ID
  async getComplaintById(id: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Complaint not found');
    return json.data;
  },

  // Create new complaint
  async createComplaint(data: {
    title: string;
    description: string;
    location: {
      address: string;
      landmark?: string;
      ward?: string;
      zone?: string;
      lat: number;
      lng: number;
    };
    citizen: {
      name: string;
      phone: string;
      email: string;
      isAnonymous?: boolean;
    };
    images?: {
      before: string[];
    };
    userDepartmentOverride?: string;
  }): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to file grievance');
    return json.data;
  },

  // Upvote complaint
  async upvoteComplaint(id: string, voterId?: string): Promise<{ complaint: Complaint; isFirstVote: boolean }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to vote');
    return { complaint: json.data, isFirstVote: json.isFirstVote };
  },

  // Submit feedback
  async submitFeedback(id: string, rating: number, comment: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to submit feedback');
    return json.data;
  },

  // Update status (Admin / Officer)
  async updateStatus(
    id: string,
    updates: {
      status?: string;
      assignedOfficerName?: string;
      assignedOfficerRole?: string;
      assignedOfficerPhone?: string;
      resolutionNotes?: string;
      afterImages?: string[];
      actorName?: string;
      actorRole?: string;
    }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to update complaint status');
    return json.data;
  },

  // Reopen a resolved complaint
  async reopenComplaint(id: string, reason: string, citizenName?: string): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/reopen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, citizenName })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to reopen complaint');
    return json.data;
  },

  // Real-time AI classification
  async classifyText(
    title: string,
    description: string,
    location?: { lat?: number; lng?: number; address?: string }
  ): Promise<{
    department: DepartmentType;
    subCategory: string;
    priority: PriorityLevel;
    estimatedSlaHours: number;
    aiAnalysis: AIAnalysisResult;
  }> {
    const res = await fetch(`${API_BASE}/ai/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, location })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Classification failed');
    return json.data;
  },

  // Real-time Vision inspection
  async inspectImage(imageUrl: string, context?: string): Promise<{
    tags: string[];
    confidence: number;
    issueDetected: string;
    severityLabel: string;
    isAuthenticCivicPhoto: boolean;
  }> {
    const res = await fetch(`${API_BASE}/ai/vision-inspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, context })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Vision inspection failed');
    return json.data;
  },

  // Real-time duplicate checking
  async checkDuplicates(
    lat: number,
    lng: number,
    department: string,
    title: string,
    description: string
  ): Promise<{
    hasDuplicate: boolean;
    duplicateComplaints: Array<{
      complaint: Complaint;
      distanceMeters: number;
      similarityScore: number;
      reason: string;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/ai/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, department, title, description })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Duplicate check failed');
    return json.data;
  },

  // CivicBot Chat
  async chatWithBot(message: string, history: ChatMessage[] = []): Promise<{
    reply: string;
    suggestedActions?: { label: string; action: string; payload?: any }[];
    ticketPreview?: Partial<Complaint>;
  }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Chat service unavailable');
    return json.data;
  },

  // Get Analytics Summary
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch analytics');
    return json.data;
  }
};
