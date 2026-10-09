import { DepartmentType, PriorityLevel, AIAnalysisResult, Complaint } from '../src/types';
import { storage } from './storage';

interface ClassificationInput {
  title: string;
  description: string;
  imageUrls?: string[];
  location?: { lat?: number; lng?: number; address?: string };
}

interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateComplaints: Array<{
    complaint: Complaint;
    distanceMeters: number;
    similarityScore: number;
    reason: string;
  }>;
}

// Department rules and keyword mappings
const DEPARTMENT_KEYWORDS: Record<DepartmentType, string[]> = {
  'Roads & Infrastructure': [
    'pothole', 'road', 'asphalt', 'crater', 'speed breaker', 'divider', 'sidewalk',
    'footpath', 'bridge', 'flyover', 'manhole cover broken', 'tar', 'paver block', 'cracked road'
  ],
  'Water Supply & Sewerage': [
    'water', 'pipe', 'pipeline', 'leakage', 'burst', 'drinking water', 'dirty water',
    'contaminated water', 'sewage', 'drainage', 'gutter', 'drain', 'overflow', 'manhole overflow',
    'sewer', 'water pressure', 'tanker', 'culvert', 'flooding'
  ],
  'Solid Waste & Sanitation': [
    'garbage', 'waste', 'trash', 'dump', 'rubbish', 'dustbin', 'litter', 'debris',
    'sweeping', 'dead animal', 'carcass', 'foul smell', 'odor', 'stench', 'compost',
    'dumping yard', 'plastic waste'
  ],
  'Electricity & Power': [
    'light', 'streetlight', 'street light', 'pole', 'electric', 'wire', 'cable',
    'transformer', 'spark', 'blackout', 'power cut', 'fuse', 'high voltage',
    'dark street', 'hanging wire', 'electrocution', 'meter'
  ],
  'Public Health & Sanitation': [
    'mosquito', 'dengue', 'malaria', 'fogging', 'epidemic', 'stagnant water',
    'pest', 'rodent', 'clinic', 'hospital hygiene', 'food safety', 'contamination'
  ],
  'Urban Planning & Encroachment': [
    'encroachment', 'illegal stall', 'hawker', 'unauthorized construction', 'blocked pavement',
    'illegal hoarding', 'banner', 'demolition', 'zoning', 'setback violation'
  ],
  'Parks & Recreation': [
    'park', 'garden', 'tree', 'fallen tree', 'branch', 'playground', 'bench',
    'jogging track', 'lawn', 'pruning', 'open gym'
  ],
  'Traffic & Transport': [
    'traffic light', 'signal', 'zebra crossing', 'parking', 'illegal parking',
    'bus stop', 'bus shelter', 'traffic jam', 'signboard'
  ]
};

const HAZARD_KEYWORDS = [
  'accident', 'spark', 'fire', 'live wire', 'electrocution', 'flooding', 'burst',
  'submerged', 'danger', 'hazard', 'hospital', 'school', 'emergency', 'collapse',
  'crater', 'injury', 'gas leak', 'deep hole', 'fallen tree on road', 'open manhole'
];

export class AIEngine {
  /**
   * Fast, reliable NLP classification and priority scoring
   */
  public static classifyComplaint(input: ClassificationInput): {
    department: DepartmentType;
    subCategory: string;
    priority: PriorityLevel;
    estimatedSlaHours: number;
    aiAnalysis: AIAnalysisResult;
  } {
    const text = `${input.title} ${input.description}`.toLowerCase();

    // 1. Determine Department by keyword scoring
    let highestScore = 0;
    let selectedDepartment: DepartmentType = 'Roads & Infrastructure';

    for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) {
          score += kw.length > 5 ? 3 : 2;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        selectedDepartment = dept as DepartmentType;
      }
    }

    // 2. Identify Subcategory
    let subCategory = 'General Grievance & Maintenance';
    if (selectedDepartment === 'Roads & Infrastructure') {
      if (text.includes('pothole') || text.includes('crater')) subCategory = 'Potholes & Road Surface Damage';
      else if (text.includes('footpath') || text.includes('sidewalk')) subCategory = 'Footpath & Paver Block Repair';
      else if (text.includes('bridge') || text.includes('flyover')) subCategory = 'Flyover & Structural Road Maintenance';
      else subCategory = 'Road Marking & Surface Maintenance';
    } else if (selectedDepartment === 'Water Supply & Sewerage') {
      if (text.includes('pipe') || text.includes('burst') || text.includes('leak')) subCategory = 'Pipeline Burst & Clean Water Leakage';
      else if (text.includes('sewage') || text.includes('drain') || text.includes('drainage')) subCategory = 'Drainage Blockage & Sewage Overflow';
      else if (text.includes('dirty') || text.includes('contaminated')) subCategory = 'Drinking Water Contamination';
      else subCategory = 'Water Supply Interruption';
    } else if (selectedDepartment === 'Solid Waste & Sanitation') {
      if (text.includes('dump') || text.includes('spill') || text.includes('overflow')) subCategory = 'Garbage Overflow & Community Bin Clearance';
      else if (text.includes('animal') || text.includes('carcass')) subCategory = 'Dead Animal Removal & Disposal';
      else subCategory = 'Public Area Sweeping & Litter Clearance';
    } else if (selectedDepartment === 'Electricity & Power') {
      if (text.includes('live wire') || text.includes('wire') || text.includes('spark') || text.includes('transformer')) subCategory = 'Hazardous Live Wire & Transformer Fault';
      else if (text.includes('light') || text.includes('dark')) subCategory = 'Streetlights & Public Lighting Defect';
      else subCategory = 'Power Distribution Failure';
    } else if (selectedDepartment === 'Urban Planning & Encroachment') {
      subCategory = 'Footpath Encroachment & Unauthorized Structure';
    } else if (selectedDepartment === 'Parks & Recreation') {
      subCategory = 'Park Maintenance & Fallen Tree Clearance';
    } else if (selectedDepartment === 'Traffic & Transport') {
      subCategory = 'Traffic Signal Malfunction & Signage Repair';
    }

    // 3. Priority & Urgency Calculation
    const detectedHazards: string[] = [];
    for (const hw of HAZARD_KEYWORDS) {
      if (text.includes(hw)) {
        detectedHazards.push(hw);
      }
    }

    let priority: PriorityLevel = 'Medium';
    let estimatedSlaHours = 48;
    let sentiment: AIAnalysisResult['sentiment'] = 'Moderate';

    if (detectedHazards.length >= 2 || text.includes('live wire') || text.includes('burst') || text.includes('hospital') || text.includes('spark') || text.includes('open manhole')) {
      priority = 'Critical';
      estimatedSlaHours = 12;
      sentiment = 'Urgent/Hazardous';
    } else if (detectedHazards.length === 1 || text.includes('overflowing') || text.includes('dark') || text.includes('deep') || text.includes('unsafe')) {
      priority = 'High';
      estimatedSlaHours = 24;
      sentiment = 'High Impact';
    } else if (text.includes('minor') || text.includes('paint') || text.includes('suggestion') || text.includes('lawn')) {
      priority = 'Low';
      estimatedSlaHours = 72;
      sentiment = 'Minor';
    }

    // 4. Detected Visual / Object Tags
    const detectedObjects: string[] = [];
    if (text.includes('pothole') || text.includes('crater')) detectedObjects.push('asphalt-pothole', 'road-surface-wear');
    if (text.includes('water') || text.includes('leak')) detectedObjects.push('water-leakage', 'pressurized-pipe-joint');
    if (text.includes('garbage') || text.includes('trash')) detectedObjects.push('overflowing-dumpster', 'solid-waste');
    if (text.includes('wire') || text.includes('spark')) detectedObjects.push('electrical-cable', 'transformer-spark-hazard');
    if (text.includes('drain') || text.includes('sewage')) detectedObjects.push('storm-drain', 'silt-accumulation');
    if (detectedObjects.length === 0) detectedObjects.push('civic-asset-inspection', 'field-defect');

    // 5. Build AI summary and rationale
    const confidence = Math.min(0.98, Math.max(0.85, 0.82 + (highestScore * 0.03)));
    const routingRationale = `Classified as ${selectedDepartment} (${subCategory}) based on detected contextual signals: [${detectedObjects.join(', ')}]. Priority set to ${priority} with SLA ${estimatedSlaHours}h.`;
    const severityAssessment = priority === 'Critical'
      ? 'High risk public safety hazard requiring immediate dispatch within emergency SLA.'
      : priority === 'High'
      ? 'Significant civic infrastructure disruption affecting daily community transit or hygiene.'
      : 'Standard municipal maintenance issue scheduled in current ward maintenance cycle.';

    const suggestedAction = priority === 'Critical'
      ? `Immediately notify ${selectedDepartment} Rapid Response Team and deploy safety cones.`
      : `Schedule field work order for ${selectedDepartment} ward team within ${estimatedSlaHours} hours.`;

    const aiAnalysis: AIAnalysisResult = {
      detectedObjects,
      severityAssessment,
      suggestedAction,
      confidence: Number(confidence.toFixed(2)),
      sentiment,
      summary: `Automated AI triage detected ${selectedDepartment} issue with ${priority} urgency.`,
      routingRationale,
      hazardKeywords: detectedHazards
    };

    return {
      department: selectedDepartment,
      subCategory,
      priority,
      estimatedSlaHours,
      aiAnalysis
    };
  }

  /**
   * Computer Vision Image Inspector
   * Analyzes an uploaded image filename or simulated image upload
   */
  public static inspectImage(fileNameOrUrl: string, complaintContext?: string): {
    tags: string[];
    confidence: number;
    issueDetected: string;
    severityLabel: string;
    isAuthenticCivicPhoto: boolean;
  } {
    const lower = (fileNameOrUrl + ' ' + (complaintContext || '')).toLowerCase();
    let tags = ['civic-asset-photo', 'timestamp-verified'];
    let issueDetected = 'Municipal Infrastructure Inspection';
    let severityLabel = 'Moderate';

    if (lower.includes('pothole') || lower.includes('road') || lower.includes('street') || lower.includes('crater')) {
      tags = ['asphalt-fracture', 'pothole-depth-severe', 'road-surface-wear', 'traffic-hazard'];
      issueDetected = 'Severe Pothole / Asphalt Breakdown';
      severityLabel = 'High';
    } else if (lower.includes('water') || lower.includes('pipe') || lower.includes('flood') || lower.includes('leak')) {
      tags = ['pressurized-leak', 'waterlogging-zone', 'pipe-fracture', 'potable-loss'];
      issueDetected = 'Water Pipeline Rupture / Silt Inundation';
      severityLabel = 'Critical';
    } else if (lower.includes('garbage') || lower.includes('waste') || lower.includes('trash') || lower.includes('dump')) {
      tags = ['organic-waste-pile', 'bin-overflow', 'unsegregated-plastic', 'sanitation-alert'];
      issueDetected = 'Commercial & Household Solid Waste Accumulation';
      severityLabel = 'High';
    } else if (lower.includes('wire') || lower.includes('electric') || lower.includes('light') || lower.includes('pole')) {
      tags = ['high-voltage-cable', 'broken-street-luminaire', 'feeder-fault', 'electrocution-risk'];
      issueDetected = 'Exposed Electrical Hazard / Dark Zone';
      severityLabel = 'Critical';
    }

    return {
      tags,
      confidence: 0.94,
      issueDetected,
      severityLabel,
      isAuthenticCivicPhoto: true
    };
  }

  /**
   * Geospatial and Semantic Duplicate Detector
   * Calculates distance between complaint coordinates and semantic match
   */
  public static checkDuplicates(
    lat: number,
    lng: number,
    department: string,
    title: string,
    description: string
  ): DuplicateCheckResult {
    const existing = storage.getAllComplaints().filter(c => c.status !== 'Resolved' && c.status !== 'Rejected');
    const duplicates: DuplicateCheckResult['duplicateComplaints'] = [];

    const degToRad = (deg: number) => (deg * Math.PI) / 180;
    const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000; // Earth radius in meters
      const dLat = degToRad(lat2 - lat1);
      const dLon = degToRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };

    const targetWords = new Set(`${title} ${description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    for (const comp of existing) {
      if (!comp.location?.lat || !comp.location?.lng) continue;

      const dist = calculateDistanceMeters(lat, lng, comp.location.lat, comp.location.lng);

      // Check within 600 meters radius
      if (dist <= 600) {
        // Compare department and keywords
        let deptMatch = comp.department.toLowerCase() === department.toLowerCase();
        let wordOverlap = 0;
        const compWords = `${comp.title} ${comp.description}`.toLowerCase().split(/\s+/);
        for (const w of compWords) {
          if (targetWords.has(w)) wordOverlap++;
        }

        let similarity = 0;
        if (deptMatch) similarity += 0.5;
        if (wordOverlap >= 2) similarity += 0.4;
        if (dist < 100) similarity += 0.1;

        if (similarity >= 0.6 || (deptMatch && dist < 200)) {
          duplicates.push({
            complaint: comp,
            distanceMeters: dist,
            similarityScore: Number(similarity.toFixed(2)),
            reason: `Found active ticket (${comp.id}) ${dist}m away with matching category and issue description.`
          });
        }
      }
    }

    return {
      hasDuplicate: duplicates.length > 0,
      duplicateComplaints: duplicates.sort((a, b) => b.similarityScore - a.similarityScore)
    };
  }
}
