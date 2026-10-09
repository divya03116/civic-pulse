export type DepartmentType =
  | 'Roads & Infrastructure'
  | 'Solid Waste & Sanitation'
  | 'Water Supply & Sewerage'
  | 'Electricity & Power'
  | 'Public Health & Sanitation'
  | 'Urban Planning & Encroachment'
  | 'Parks & Recreation'
  | 'Traffic & Transport';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI_Triaged'
  | 'Assigned'
  | 'In_Progress'
  | 'Resolved'
  | 'Rejected';

export interface LocationInfo {
  address: string;
  landmark: string;
  ward: string;
  zone: string;
  lat: number;
  lng: number;
}

export interface CitizenInfo {
  name: string;
  phone: string;
  email: string;
  isAnonymous: boolean;
}

export interface AIAnalysisResult {
  detectedObjects: string[];
  severityAssessment: string;
  suggestedAction: string;
  confidence: number;
  sentiment: 'Urgent/Hazardous' | 'High Impact' | 'Moderate' | 'Minor';
  summary: string;
  routingRationale: string;
  hazardKeywords: string[];
}

export interface OfficerAssignment {
  officerName: string;
  officerRole: string;
  department: string;
  phone: string;
  assignedAt: string;
  badgeNumber?: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  role: string;
  images?: string[];
  notes?: string;
}

export interface CitizenFeedback {
  rating: number; // 1-5
  comment: string;
  isSatisfied: boolean;
  submittedAt: string;
}

export interface Complaint {
  id: string; // e.g. "CIVIC-2026-9042"
  title: string;
  description: string;
  department: DepartmentType;
  subCategory: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  location: LocationInfo;
  citizen: CitizenInfo;
  images: {
    before: string[];
    after?: string[];
  };
  aiAnalysis: AIAnalysisResult;
  assignedTo?: OfficerAssignment;
  timeline: TimelineEvent[];
  estimatedSlaHours: number;
  slaDeadline: string; // ISO
  isSlaBreached: boolean;
  upvotes: number;
  upvoters: string[];
  commentsCount?: number;
  feedback?: CitizenFeedback;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface DepartmentMetric {
  name: DepartmentType;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionTimeHours: number;
  slaComplianceRate: number; // e.g. 92.5%
  satisfactionScore: number; // 1-5
  activeOfficers: number;
}

export interface WardMetric {
  ward: string;
  zone: string;
  totalComplaints: number;
  criticalComplaints: number;
  resolvedComplaints: number;
  topCategory: string;
  lat: number;
  lng: number;
}

export interface AnalyticsSummary {
  totalGrievances: number;
  resolvedCount: number;
  inProgressCount: number;
  pendingCount: number;
  avgTurnaroundHours: number;
  slaComplianceRate: number;
  citizenSatisfactionRate: number;
  duplicatePreventedCount: number;
  departments: DepartmentMetric[];
  wards: WardMetric[];
  priorityDistribution: { name: PriorityLevel; count: number; color: string }[];
  categoryDistribution: { name: string; count: number }[];
  monthlyTrends: { month: string; submitted: number; resolved: number }[];
  aiExecutiveSummary: {
    keyInsights: string[];
    criticalHotspots: string[];
    recommendedActions: string[];
    lastUpdated: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: any }[];
  ticketPreview?: Partial<Complaint>;
}
