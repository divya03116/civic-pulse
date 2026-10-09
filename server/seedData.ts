import { Complaint, WardMetric } from '../src/types';

// Demo data written to Firestore the first time the server connects to an empty
// project. After that Firestore is the source of truth and this file is not read again.

export interface AnalyticsBaseline {
  baseTotal: number;
  baseResolved: number;
  basePending: number;
  slaComplianceRate: number;
  citizenSatisfactionRate: number;
  duplicatePreventedCount: number;
  wards: WardMetric[];
  monthlyTrends: { month: string; submitted: number; resolved: number }[];
  aiExecutiveSummary: {
    keyInsights: string[];
    criticalHotspots: string[];
    recommendedActions: string[];
  };
}

// Initial Realistic Seed Dataset for a vibrant Smart City
export const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "CIVIC-2026-1001",
    title: "Major Pothole & Road Caving Near Metro Station Entrance",
    description: "A deep 2-foot crater has formed on the main westbound carriageway right next to Metro Pillar 48. Motorcyclists are swerving dangerously and 3 minor accidents have already occurred in the last 24 hours.",
    department: "Roads & Infrastructure",
    subCategory: "Potholes & Road Surface Damage",
    priority: "Critical",
    status: "In_Progress",
    location: {
      address: "Paud Road, Near Vanaz Metro Station Gate 2, Kothrud",
      landmark: "Near Metro Pillar 48",
      ward: "Ward 03 - Kothrud - Karve Road",
      zone: "West Zone",
      lat: 18.5074,
      lng: 73.8077
    },
    citizen: {
      name: "Aditya Verma",
      phone: "+91 98201 44521",
      email: "aditya.verma@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["deep-pothole", "asphalt-fracture", "active-traffic-risk", "standing-water"],
      severityAssessment: "Severe road hazard causing immediate structural danger and traffic disruption.",
      suggestedAction: "Dispatch asphalt patch crew with emergency road cones immediately.",
      confidence: 0.96,
      sentiment: "Urgent/Hazardous",
      summary: "High-risk pothole at heavy transit node with reported accidents.",
      routingRationale: "Categorized to Roads & Infrastructure based on terms 'crater', 'asphalt', 'road caving', 'pillar 48'.",
      hazardKeywords: ["accidents", "crater", "dangerous", "metro", "pothole"]
    },
    assignedTo: {
      officerName: "Eng. Suresh Patil",
      officerRole: "Senior Executive Engineer (Roads)",
      department: "Roads & Infrastructure",
      phone: "+91 98200 11223",
      assignedAt: "2026-08-20T10:30:00.000Z",
      badgeNumber: "PWD-RD-884"
    },
    timeline: [
      {
        id: "tl-1",
        status: "Submitted",
        title: "Complaint Filed by Citizen",
        description: "Complaint registered with geo-tagging and high-resolution photo evidence.",
        timestamp: "2026-08-20T09:15:00.000Z",
        actor: "Aditya Verma",
        role: "Citizen"
      },
      {
        id: "tl-2",
        status: "AI_Triaged",
        title: "AI NLP & Vision Classification",
        description: "AI triaged severity to 'Critical' (Confidence: 96%). Assigned SLA: 12 Hours.",
        timestamp: "2026-08-20T09:15:05.000Z",
        actor: "CivicPulse AI Engine",
        role: "Automated System"
      },
      {
        id: "tl-3",
        status: "Assigned",
        title: "Assigned to Ward Engineer",
        description: "Dispatched to Executive Engineer Suresh Patil (Ward 12). Rapid response crew notified.",
        timestamp: "2026-08-20T10:30:00.000Z",
        actor: "Central Triage Portal",
        role: "Municipal Administrator"
      },
      {
        id: "tl-4",
        status: "In_Progress",
        title: "Field Crew On-Site",
        description: "Barricades erected. Cold mix asphalt compaction and leveling underway.",
        timestamp: "2026-08-21T07:45:00.000Z",
        actor: "Eng. Suresh Patil",
        role: "Field Officer"
      }
    ],
    estimatedSlaHours: 12,
    slaDeadline: "2026-08-20T21:15:00.000Z",
    isSlaBreached: false,
    upvotes: 38,
    upvoters: ["ip-1", "ip-2", "ip-3"],
    createdAt: "2026-08-20T09:15:00.000Z",
    updatedAt: "2026-08-21T07:45:00.000Z"
  },
  {
    id: "CIVIC-2026-1002",
    title: "Burst Main Water Pipeline Flooding Residential Society",
    description: "Major 18-inch water main has burst outside Sunshine Apartments. Hundreds of liters of potable water are gushing onto the road every minute, causing basement waterlogging and cutting drinking supply to 400 flats.",
    department: "Water Supply & Sewerage",
    subCategory: "Pipeline Burst & Clean Water Leakage",
    priority: "Critical",
    status: "Resolved",
    location: {
      address: "Clover Park, Lane 4, Viman Nagar",
      landmark: "Near Phoenix Marketcity North Gate",
      ward: "Ward 06 - Nagar Road (Vadgaon Sheri)",
      zone: "North-East Zone",
      lat: 18.5679,
      lng: 73.9143
    },
    citizen: {
      name: "Pooja Hegde",
      phone: "+91 98450 78120",
      email: "pooja.hegde@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80"
      ],
      after: [
        "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["burst-pipe", "high-pressure-water-jet", "flooded-street", "submerged-drain"],
      severityAssessment: "Critical infrastructure failure leading to massive resource loss and property flooding.",
      suggestedAction: "Immediately isolate feeder valve V-104 and dispatch welding/pipe replacement team.",
      confidence: 0.98,
      sentiment: "Urgent/Hazardous",
      summary: "High volume potable water line rupture affecting 400+ residences.",
      routingRationale: "Matched Water Supply & Sewerage from 'pipeline burst', 'drinking water supply', 'flooding'.",
      hazardKeywords: ["burst", "waterlogging", "drinking supply", "flooding", "potable water"]
    },
    assignedTo: {
      officerName: "Vinod Joshi",
      officerRole: "Chief Water Inspector",
      department: "Water Supply & Sewerage",
      phone: "+91 98333 44556",
      assignedAt: "2026-08-19T08:15:00.000Z",
      badgeNumber: "WTR-042"
    },
    timeline: [
      {
        id: "tl-201",
        status: "Submitted",
        title: "Complaint Registered",
        description: "Grievance submitted by resident welfare association representative.",
        timestamp: "2026-08-19T07:30:00.000Z",
        actor: "Pooja Hegde",
        role: "Citizen"
      },
      {
        id: "tl-202",
        status: "AI_Triaged",
        title: "Emergency AI Triage",
        description: "Critical urgency detected. Feeder valve isolation alert triggered automatically.",
        timestamp: "2026-08-19T07:30:04.000Z",
        actor: "CivicPulse AI Engine",
        role: "Automated System"
      },
      {
        id: "tl-203",
        status: "In_Progress",
        title: "Valve Shut & Trenching Complete",
        description: "Sluice valve closed. Damaged cast-iron collar replaced with heavy-duty ductile iron clamp.",
        timestamp: "2026-08-19T11:00:00.000Z",
        actor: "Vinod Joshi",
        role: "Chief Water Inspector"
      },
      {
        id: "tl-204",
        status: "Resolved",
        title: "Pipe Replaced & Supply Restored",
        description: "Pressure test passed. Drinking water supply restored to Sunshine Enclave. Road dry and cleared.",
        timestamp: "2026-08-19T15:30:00.000Z",
        actor: "Vinod Joshi",
        role: "Chief Water Inspector"
      }
    ],
    estimatedSlaHours: 8,
    slaDeadline: "2026-08-19T15:30:00.000Z",
    isSlaBreached: false,
    upvotes: 64,
    upvoters: ["ip-10", "ip-11", "ip-12"],
    feedback: {
      rating: 5,
      comment: "Superb and fast resolution by the water board team! Repaired in under 8 hours.",
      isSatisfied: true,
      submittedAt: "2026-08-19T17:00:00.000Z"
    },
    createdAt: "2026-08-19T07:30:00.000Z",
    updatedAt: "2026-08-19T15:30:00.000Z",
    resolvedAt: "2026-08-19T15:30:00.000Z",
    resolutionNotes: "Replaced 3-meter section of 18-inch DI pipe. Verified zero leakage under 6 bar operational pressure."
  },
  {
    id: "CIVIC-2026-1003",
    title: "Overflowing Garbage Dump & Stray Animal Menace at Market",
    description: "The municipal community bin outside Weekly Vegetable Market has not been cleared for 4 days. Waste has spilled over 50 meters, attracting stray cattle and creating severe foul odor and health hazard.",
    department: "Solid Waste & Sanitation",
    subCategory: "Garbage Overflow & Waste Clearance",
    priority: "High",
    status: "Assigned",
    location: {
      address: "Hadapsar Mandai Road, Sector 3, Gadital",
      landmark: "Near Vegetable Market North Gate",
      ward: "Ward 13 - Hadapsar",
      zone: "East Zone",
      lat: 18.5089,
      lng: 73.9259
    },
    citizen: {
      name: "Rameshwar Rao",
      phone: "+91 97665 12098",
      email: "r.rao.trader@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["overflowing-dumpster", "organic-waste-spill", "unsegregated-plastic", "pest-vector-risk"],
      severityAssessment: "High sanitation risk with potential for vector-borne diseases in a crowded market zone.",
      suggestedAction: "Deploy hydraulic compactor truck and apply bleaching powder disinfectant.",
      confidence: 0.94,
      sentiment: "High Impact",
      summary: "Accumulated commercial and organic market refuse causing environmental nuisance.",
      routingRationale: "Directly assigned to Solid Waste & Sanitation based on 'garbage', 'foul odor', 'waste clearance'.",
      hazardKeywords: ["garbage", "foul odor", "health hazard", "overflowing", "sanitation"]
    },
    assignedTo: {
      officerName: "Mohd. Tariq",
      officerRole: "Sanitation Supervisor",
      department: "Solid Waste & Sanitation",
      phone: "+91 98211 99001",
      assignedAt: "2026-08-21T09:00:00.000Z",
      badgeNumber: "SWM-SUP-14"
    },
    timeline: [
      {
        id: "tl-301",
        status: "Submitted",
        title: "Complaint Registered",
        description: "Complaint filed by Market Traders Association representative.",
        timestamp: "2026-08-21T08:10:00.000Z",
        actor: "Rameshwar Rao",
        role: "Citizen"
      },
      {
        id: "tl-302",
        status: "AI_Triaged",
        title: "AI Priority High Assigned",
        description: "Sanitation index threshold exceeded. Auto-escalated to Sanitary Inspector Tariq.",
        timestamp: "2026-08-21T08:10:04.000Z",
        actor: "CivicPulse AI Engine",
        role: "Automated System"
      },
      {
        id: "tl-303",
        status: "Assigned",
        title: "Compactor Truck Route Scheduled",
        description: "Vehicle MH-01-CV-4491 assigned for pickup during 11:00 AM sanitation slot.",
        timestamp: "2026-08-21T09:00:00.000Z",
        actor: "Mohd. Tariq",
        role: "Sanitation Supervisor"
      }
    ],
    estimatedSlaHours: 24,
    slaDeadline: "2026-08-22T08:10:00.000Z",
    isSlaBreached: false,
    upvotes: 21,
    upvoters: ["ip-20"],
    createdAt: "2026-08-21T08:10:00.000Z",
    updatedAt: "2026-08-21T09:00:00.000Z"
  },
  {
    id: "CIVIC-2026-1004",
    title: "Broken Streetlights Creating Dark Hazard Zone near Girls High School",
    description: "A stretch of 6 consecutive LED streetlights has been dark for over a week along Old Post Office Road. Students and women commuting in the evening feel unsafe.",
    department: "Electricity & Power",
    subCategory: "Streetlights & Public Lighting Defect",
    priority: "High",
    status: "In_Progress",
    location: {
      address: "JM Road, Near Modern High School & College",
      landmark: "Opposite Modern College Main Gate",
      ward: "Ward 02 - Ghole Road",
      zone: "Central Zone",
      lat: 18.5284,
      lng: 73.8415
    },
    citizen: {
      name: "Sneha Sen",
      phone: "+91 98112 33445",
      email: "sneha.sen@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["defective-pole-lamp", "dark-street-corridor", "feeder-box-short"],
      severityAssessment: "High public safety concern due to nighttime pedestrian activity near educational institution.",
      suggestedAction: "Inspect phase feeder pillar FP-09 and replace faulty photocells/LED drivers.",
      confidence: 0.95,
      sentiment: "Urgent/Hazardous",
      summary: "Multiple street lamps non-functional along sensitive school zone.",
      routingRationale: "Keywords 'streetlights', 'LED', 'dark corridor' routed to Electricity & Power.",
      hazardKeywords: ["unsafe", "dark", "broken streetlights", "school", "women safety"]
    },
    assignedTo: {
      officerName: "K. R. Nair",
      officerRole: "Junior Electrical Engineer",
      department: "Electricity & Power",
      phone: "+91 98400 66778",
      assignedAt: "2026-08-20T14:00:00.000Z",
      badgeNumber: "ELEC-LT-09"
    },
    timeline: [
      {
        id: "tl-401",
        status: "Submitted",
        title: "Grievance Logged",
        description: "Submitted via CivicPulse AI Web App.",
        timestamp: "2026-08-20T13:15:00.000Z",
        actor: "Sneha Sen",
        role: "Citizen"
      },
      {
        id: "tl-402",
        status: "AI_Triaged",
        title: "Safety Escalation by AI",
        description: "Proximity to educational institution triggered automated safety priority bump to High.",
        timestamp: "2026-08-20T13:15:04.000Z",
        actor: "CivicPulse AI Engine",
        role: "Automated System"
      },
      {
        id: "tl-403",
        status: "In_Progress",
        title: "Cherry Picker Van Dispatched",
        description: "Underground cable line traced. Feeder pillar circuit breaker replacement in progress.",
        timestamp: "2026-08-21T06:30:00.000Z",
        actor: "K. R. Nair",
        role: "Junior Electrical Engineer"
      }
    ],
    estimatedSlaHours: 24,
    slaDeadline: "2026-08-21T13:15:00.000Z",
    isSlaBreached: false,
    upvotes: 49,
    upvoters: ["ip-31", "ip-32"],
    createdAt: "2026-08-20T13:15:00.000Z",
    updatedAt: "2026-08-21T06:30:00.000Z"
  },
  {
    id: "CIVIC-2026-1005",
    title: "Exposed High-Voltage Live Cable Hanging from Electric Pole",
    description: "During heavy winds last evening, a high-voltage wire snapped from transformer pole TR-22 and is dangling 4 feet above the pedestrian walkway. Sparks were observed earlier today.",
    department: "Electricity & Power",
    subCategory: "Hazardous Live Wire & Transformer Spark",
    priority: "Critical",
    status: "AI_Triaged",
    location: {
      address: "Baner High Street, Near Balewadi Phata",
      landmark: "Transformer TR-22 near Balewadi Chowk",
      ward: "Ward 01 - Aundh",
      zone: "North-West Zone",
      lat: 18.5580,
      lng: 73.8075
    },
    citizen: {
      name: "Karan Johar",
      phone: "+91 98222 55667",
      email: "karan.j@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["dangling-live-cable", "sparks", "pedestrian-sidewalk", "high-voltage-transformer"],
      severityAssessment: "Extreme electrocution and fire hazard to general public. Immediate grid trip required.",
      suggestedAction: "Auto-trigger sub-station emergency shutdown and dispatch rapid emergency squad.",
      confidence: 0.99,
      sentiment: "Urgent/Hazardous",
      summary: "CRITICAL: Live high-voltage wire in pedestrian path with active sparking.",
      routingRationale: "Detected emergency electrical hazard terms 'live cable', 'sparks', 'transformer'.",
      hazardKeywords: ["sparks", "live cable", "high voltage", "dangling", "electrocution risk"]
    },
    timeline: [
      {
        id: "tl-501",
        status: "Submitted",
        title: "SOS Citizen Alert Filed",
        description: "Direct citizen emergency upload with live camera capture.",
        timestamp: "2026-08-21T10:00:00.000Z",
        actor: "Karan Johar",
        role: "Citizen"
      },
      {
        id: "tl-502",
        status: "AI_Triaged",
        title: "AI Emergency Trigger Activated",
        description: "Confidence 99% - Emergency alert dispatched to Zone 1 Substation Control Room.",
        timestamp: "2026-08-21T10:00:02.000Z",
        actor: "CivicPulse AI Engine",
        role: "Automated System"
      }
    ],
    estimatedSlaHours: 4,
    slaDeadline: "2026-08-21T14:00:00.000Z",
    isSlaBreached: false,
    upvotes: 77,
    upvoters: ["ip-51"],
    createdAt: "2026-08-21T10:00:00.000Z",
    updatedAt: "2026-08-21T10:00:02.000Z"
  },
  {
    id: "CIVIC-2026-1006",
    title: "Blocked Stormwater Drain Causing Road Submersion",
    description: "Drainage culvert under highway flyover is completely choked with construction debris and plastic. Even a brief shower causes knee-deep water on the road.",
    department: "Water Supply & Sewerage",
    subCategory: "Drainage & Sewerage Blockage",
    priority: "High",
    status: "Resolved",
    location: {
      address: "Jedhe Chowk Underpass, Swargate Flyover",
      landmark: "Under Flyover Pillar 12 near ST Stand",
      ward: "Ward 10 - Tilak Road",
      zone: "South-Central Zone",
      lat: 18.5040,
      lng: 73.8510
    },
    citizen: {
      name: "Anita Deshmukh",
      phone: "+91 98670 99881",
      email: "anita.d@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80"
      ],
      after: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["blocked-culvert", "plastic-silt-accumulation", "waterlogging"],
      severityAssessment: "High urban flood risk during monsoon season.",
      suggestedAction: "Deploy suction jetting machine and de-silt culvert box.",
      confidence: 0.93,
      sentiment: "High Impact",
      summary: "Debris and silt blockage in primary storm drain.",
      routingRationale: "Routed to Water Supply & Sewerage for 'drainage', 'culvert', 'sewerage'.",
      hazardKeywords: ["drainage", "waterlogging", "blocked", "culvert"]
    },
    assignedTo: {
      officerName: "Mahesh Shinde",
      officerRole: "Drainage Superintendent",
      department: "Water Supply & Sewerage",
      phone: "+91 98205 77661",
      assignedAt: "2026-08-18T10:00:00.000Z",
      badgeNumber: "DRN-SUP-22"
    },
    timeline: [
      {
        id: "tl-601",
        status: "Submitted",
        title: "Complaint Logged",
        description: "Registered by local commuter.",
        timestamp: "2026-08-18T08:30:00.000Z",
        actor: "Anita Deshmukh",
        role: "Citizen"
      },
      {
        id: "tl-602",
        status: "Assigned",
        title: "Jetting Super-Sucker Assigned",
        description: "Assigned to Ward 15 Drainage Wing.",
        timestamp: "2026-08-18T10:00:00.000Z",
        actor: "Municipal Admin",
        role: "Administrator"
      },
      {
        id: "tl-603",
        status: "Resolved",
        title: "De-silting Completed & Water Flow Restored",
        description: "Removed 4.5 tons of construction silt and waste. Culvert flow completely unobstructed.",
        timestamp: "2026-08-18T18:00:00.000Z",
        actor: "Mahesh Shinde",
        role: "Drainage Superintendent"
      }
    ],
    estimatedSlaHours: 24,
    slaDeadline: "2026-08-19T08:30:00.000Z",
    isSlaBreached: false,
    upvotes: 42,
    upvoters: [],
    feedback: {
      rating: 5,
      comment: "Super quick de-silting before the rains started! Great job team.",
      isSatisfied: true,
      submittedAt: "2026-08-18T19:30:00.000Z"
    },
    createdAt: "2026-08-18T08:30:00.000Z",
    updatedAt: "2026-08-18T18:00:00.000Z",
    resolvedAt: "2026-08-18T18:00:00.000Z",
    resolutionNotes: "Completed jetting and manual desilting of 45-meter box culvert."
  },
  {
    id: "CIVIC-2026-1007",
    title: "Illegal Encroachment on Pedestrian Footpath by Commercial Stalls",
    description: "Temporary iron sheds and stalls have blocked the entire 200m sidewalk outside Metro Gate 1, forcing pedestrians to walk on the high-speed roadway.",
    department: "Urban Planning & Encroachment",
    subCategory: "Footpath Encroachment & Unauthorized Structure",
    priority: "Medium",
    status: "Submitted",
    location: {
      address: "FC Road, Pedestrian Promenade",
      landmark: "Outside Ferguson College Gate 1",
      ward: "Ward 09 - Kasba - Vishrambaug",
      zone: "Central Zone",
      lat: 18.5185,
      lng: 73.8553
    },
    citizen: {
      name: "Rohit Bhatt",
      phone: "+91 99887 66554",
      email: "rohit.b@example.com",
      isAnonymous: false
    },
    images: {
      before: [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"
      ]
    },
    aiAnalysis: {
      detectedObjects: ["unauthorized-shed", "blocked-walkway", "pedestrian-hazard"],
      severityAssessment: "Pedestrian right-of-way violation causing safety hazard.",
      suggestedAction: "Issue 24-hour notice to remove structures or deploy anti-encroachment squad.",
      confidence: 0.91,
      sentiment: "Moderate",
      summary: "Footpath obstruction near high-density commuter node.",
      routingRationale: "Keywords 'encroachment', 'unauthorized structure', 'footpath' mapped to Urban Planning & Encroachment.",
      hazardKeywords: ["encroachment", "pedestrian", "blocked", "sidewalk"]
    },
    timeline: [
      {
        id: "tl-701",
        status: "Submitted",
        title: "Complaint Received",
        description: "Filed via citizen portal.",
        timestamp: "2026-08-21T09:40:00.000Z",
        actor: "Rohit Bhatt",
        role: "Citizen"
      }
    ],
    estimatedSlaHours: 48,
    slaDeadline: "2026-08-23T09:40:00.000Z",
    isSlaBreached: false,
    upvotes: 15,
    upvoters: [],
    createdAt: "2026-08-21T09:40:00.000Z",
    updatedAt: "2026-08-21T09:40:00.000Z"
  }
];

// Official baseline from PMC Smart City Volume I (585 received, 408 resolved, 177 pending)
export const ANALYTICS_BASELINE: AnalyticsBaseline = {
  baseTotal: 585,
  baseResolved: 408,
  basePending: 177,
  slaComplianceRate: 93.4,
  citizenSatisfactionRate: 94.8,
  duplicatePreventedCount: 142,

  // Official 15 PMC Administrative Wards from Smart City Volume I (Pages 9 & 15)
  // Distributed based on official 585 received complaints (408 resolved, 177 pending)
  wards: [
    { ward: 'Ward 01 - Aundh', zone: 'North-West Zone', totalComplaints: 40, criticalComplaints: 5, resolvedComplaints: 28, topCategory: 'Roads & Infrastructure', lat: 18.5580, lng: 73.8075 },
    { ward: 'Ward 02 - Ghole Road', zone: 'Central Zone', totalComplaints: 36, criticalComplaints: 4, resolvedComplaints: 25, topCategory: 'Roads & Infrastructure', lat: 18.5284, lng: 73.8415 },
    { ward: 'Ward 03 - Kothrud - Karve Road', zone: 'West Zone', totalComplaints: 55, criticalComplaints: 7, resolvedComplaints: 39, topCategory: 'Roads & Infrastructure', lat: 18.5074, lng: 73.8077 },
    { ward: 'Ward 04 - Warje - Karvenagar', zone: 'South-West Zone', totalComplaints: 49, criticalComplaints: 6, resolvedComplaints: 34, topCategory: 'Water Supply & Sewerage', lat: 18.4820, lng: 73.8010 },
    { ward: 'Ward 05 - Dholepatil Road', zone: 'Central Zone', totalComplaints: 35, criticalComplaints: 4, resolvedComplaints: 24, topCategory: 'Solid Waste & Sanitation', lat: 18.5362, lng: 73.8795 },
    { ward: 'Ward 06 - Nagar Road (Vadgaon Sheri)', zone: 'North-East Zone', totalComplaints: 44, criticalComplaints: 5, resolvedComplaints: 31, topCategory: 'Water Supply & Sewerage', lat: 18.5520, lng: 73.9180 },
    { ward: 'Ward 07 - Sangamwadi', zone: 'Central-North Zone', totalComplaints: 28, criticalComplaints: 3, resolvedComplaints: 20, topCategory: 'Traffic & Transport', lat: 18.5375, lng: 73.8680 },
    { ward: 'Ward 08 - Bhawani Peth', zone: 'Central Zone', totalComplaints: 39, criticalComplaints: 5, resolvedComplaints: 27, topCategory: 'Solid Waste & Sanitation', lat: 18.5110, lng: 73.8690 },
    { ward: 'Ward 09 - Kasba - Vishrambaug', zone: 'Central Zone', totalComplaints: 42, criticalComplaints: 6, resolvedComplaints: 29, topCategory: 'Water Supply & Sewerage', lat: 18.5185, lng: 73.8553 },
    { ward: 'Ward 10 - Tilak Road', zone: 'South-Central Zone', totalComplaints: 31, criticalComplaints: 4, resolvedComplaints: 22, topCategory: 'Electricity & Power', lat: 18.5040, lng: 73.8510 },
    { ward: 'Ward 11 - Sahakarnagar', zone: 'South Zone', totalComplaints: 30, criticalComplaints: 3, resolvedComplaints: 21, topCategory: 'Roads & Infrastructure', lat: 18.4870, lng: 73.8520 },
    { ward: 'Ward 12 - Bibewadi', zone: 'South Zone', totalComplaints: 32, criticalComplaints: 4, resolvedComplaints: 22, topCategory: 'Solid Waste & Sanitation', lat: 18.4760, lng: 73.8640 },
    { ward: 'Ward 13 - Hadapsar', zone: 'East Zone', totalComplaints: 64, criticalComplaints: 8, resolvedComplaints: 45, topCategory: 'Solid Waste & Sanitation', lat: 18.5089, lng: 73.9259 },
    { ward: 'Ward 14 - Dhankawadi', zone: 'South Zone', totalComplaints: 23, criticalComplaints: 2, resolvedComplaints: 16, topCategory: 'Water Supply & Sewerage', lat: 18.4610, lng: 73.8520 },
    { ward: 'Ward 15 - Kondhwa - Wanorie', zone: 'South-East Zone', totalComplaints: 37, criticalComplaints: 5, resolvedComplaints: 25, topCategory: 'Roads & Infrastructure', lat: 18.4780, lng: 73.8910 }
  ],

  monthlyTrends: [
    { month: 'Apr', submitted: 140, resolved: 132 },
    { month: 'May', submitted: 185, resolved: 170 },
    { month: 'Jun', submitted: 260, resolved: 235 },
    { month: 'Jul', submitted: 310, resolved: 290 },
    { month: 'Aug', submitted: 280, resolved: 265 }
  ],

  aiExecutiveSummary: {
    keyInsights: [
      "Pune Municipal Corporation (PMC) Smart City Stage 1 Scorecard achieved 95/100 points across all urban benchmark criteria.",
      "Online Public Grievance Redressal (PGR) active across all 15 official administrative wards and 76 prabhags.",
      "Statutory service delivery timelines enforced under Maharashtra Right to Public Services Act (RTSA 2015) with compensatory penalties of ₹500 to ₹5,000 for delays.",
      "Baseline public grievance compliance established at 70% resolution (408 of 585 applications complied) and advancing towards 93.4% SLA target."
    ],
    criticalHotspots: [
      "Ward 13 (Hadapsar): High volume of solid waste management and commercial market refuse during trading hours.",
      "Ward 03 (Kothrud - Karve Road): Road surface and transit corridor wear along Paud Road and metro lines.",
      "Ward 04 (Warje - Karvenagar) & Ward 09 (Kasba - Vishrambaug): Water supply pressure and storm drainage line maintenance."
    ],
    recommendedActions: [
      "Deploy additional hydraulic compactor trucks for night collection in Ward 13 (Hadapsar) and Ward 08 (Bhawani Peth).",
      "Enforce 15-day statutory SLA for drinking water and drainage lines under RTSA guidelines across all 15 ward offices.",
      "Schedule pre-monsoon culvert and storm drain de-silting along Mula and Mutha river catchment stretches."
    ]
  }
};
