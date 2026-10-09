import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import {
  Sparkles,
  Camera,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Upload,
  Layers,
  Clock,
  Shield,
  HelpCircle,
  FileCheck,
  Tag,
  Crosshair,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { fileToCompressedDataUrl } from '../utils/image';
import { Complaint, DepartmentType, PriorityLevel, AIAnalysisResult } from '../types';
import { AIClassifierBadge } from '../components/AIClassifierBadge';
import { DuplicateWarningModal } from '../components/DuplicateWarningModal';
import { LeafletMap } from '../components/LeafletMap';

// Preset sample incident templates for quick citizen testing in Pune
const SAMPLE_TEMPLATES = [
  {
    label: '🚧 Deep Pothole',
    title: 'Severe pothole crater on Paud Road near Vanaz Metro',
    description: 'Deep 2-foot crater near the traffic junction. Two two-wheelers skidded today. Risk of serious accidents during peak hours.',
    department: 'Roads & Infrastructure' as DepartmentType,
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    lat: 18.5074,
    lng: 73.8077,
    ward: 'Ward 12 - Kothrud & Paud Road'
  },
  {
    label: '💧 Burst Water Pipeline',
    title: 'High-pressure drinking water pipe burst flooding road',
    description: '18-inch water main has fractured. Massive water leakage flooding the road and cutting potable water supply to residential colony.',
    department: 'Water Supply & Sewerage' as DepartmentType,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
    lat: 18.5679,
    lng: 73.9143,
    ward: 'Ward 03 - Viman Nagar & Kalyani Nagar'
  },
  {
    label: '🗑️ Garbage Overflow',
    title: 'Community waste bin overflowing for 3 days',
    description: 'Garbage dump is spilling across the sidewalk outside vegetable market. Severe foul stench and stray dogs gathering.',
    department: 'Solid Waste & Sanitation' as DepartmentType,
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    lat: 18.5089,
    lng: 73.9259,
    ward: 'Ward 15 - Hadapsar & Magarpatta'
  },
  {
    label: '⚡ Hanging Live Wire',
    title: 'Snapped high voltage electric wire sparking on sidewalk',
    description: 'Live electric cable hanging 4 feet above pedestrian footpath. Visible sparks seen from the transformer pole. Severe electrocution danger!',
    department: 'Electricity & Power' as DepartmentType,
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
    lat: 18.5602,
    lng: 73.8031,
    ward: 'Ward 09 - Aundh & Baner'
  }
];

const WARDS_LIST = [
  'Ward 01 - Aundh',
  'Ward 02 - Ghole Road',
  'Ward 03 - Kothrud - Karve Road',
  'Ward 04 - Warje - Karvenagar',
  'Ward 05 - Dholepatil Road',
  'Ward 06 - Nagar Road (Vadgaon Sheri)',
  'Ward 07 - Sangamwadi',
  'Ward 08 - Bhawani Peth',
  'Ward 09 - Kasba - Vishrambaug',
  'Ward 10 - Tilak Road',
  'Ward 11 - Sahakarnagar',
  'Ward 12 - Bibewadi',
  'Ward 13 - Hadapsar',
  'Ward 14 - Dhankawadi',
  'Ward 15 - Kondhwa - Wanorie'
];

export const FileComplaint: React.FC = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state as { title?: string; description?: string; department?: string } | null;

  // Wizard Step (1: Details & AI, 2: Photo & Vision, 3: Location, 4: Review & Submit)
  const [step, setStep] = useState(1);

  // Form States
  const [title, setTitle] = useState(locationState?.title || '');
  const [description, setDescription] = useState(locationState?.description || '');
  const [departmentOverride, setDepartmentOverride] = useState<string>('');
  
  // Location States (Default Pune PMC)
  const [address, setAddress] = useState('JM Road, Near Deccan Gymkhana, Shivajinagar');
  const [landmark, setLandmark] = useState('Opposite Modern High School & College');
  const [ward, setWard] = useState('Ward 02 - Ghole Road');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 18.5284,
    lng: 73.8415
  });

  // Citizen Contact
  const [citizenName, setCitizenName] = useState('Priya Sharma');
  const [citizenPhone, setCitizenPhone] = useState('+91 98201 55667');
  const [citizenEmail, setCitizenEmail] = useState('priya.sharma@example.com');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Images & Vision
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
  );
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when clicking File Grievance in navbar
  useEffect(() => {
    const handleReset = () => {
      setSubmittedTicket(null);
      setStep(1);
      setTitle('');
      setDescription('');
      setDepartmentOverride('');
    };
    window.addEventListener('civicpulse:reset-file-form', handleReset);
    return () => window.removeEventListener('civicpulse:reset-file-form', handleReset);
  }, []);

  // Sync state if arrived with pre-filled state from CivicBot
  useEffect(() => {
    if (locationState) {
      if (locationState.title) setTitle(locationState.title);
      if (locationState.description) setDescription(locationState.description);
      if (locationState.department) setDepartmentOverride(locationState.department);
    }
  }, [locationState]);

  // Real-time AI Classification Result
  const [aiResult, setAiResult] = useState<{
    department: DepartmentType;
    subCategory: string;
    priority: PriorityLevel;
    estimatedSlaHours: number;
    aiAnalysis: AIAnalysisResult;
  } | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Duplicates State & Modal
  const [duplicateCheck, setDuplicateCheck] = useState<{
    hasDuplicate: boolean;
    duplicateComplaints: any[];
  } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Submission Finished State
  const [submittedTicket, setSubmittedTicket] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced Real-Time AI NLP Classification
  useEffect(() => {
    if (!title && !description) return;

    const timer = setTimeout(async () => {
      setIsClassifying(true);
      try {
        const result = await api.classifyText(title, description, selectedCoords);
        setAiResult(result);
      } catch (err) {
        console.error('Classification error:', err);
      } finally {
        setIsClassifying(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, description, selectedCoords]);

  // Real-Time Computer Vision Analysis when photo changes
  useEffect(() => {
    if (!imageUrl) return;

    const analyzeImage = async () => {
      try {
        const res = await api.inspectImage(imageUrl, `${title} ${description}`);
        setVisionAnalysis(res);
      } catch (err) {
        console.error('Vision inspection error:', err);
      }
    };
    analyzeImage();
  }, [imageUrl, title, description]);

  const applyTemplate = (tpl: typeof SAMPLE_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setImageUrl(tpl.image);
    setSelectedCoords({ lat: tpl.lat, lng: tpl.lng });
    setWard(tpl.ward);
  };

  const handleLocationPick = (loc: { lat: number; lng: number; address?: string }) => {
    setSelectedCoords({ lat: loc.lat, lng: loc.lng });
    if (loc.address) {
      setAddress(loc.address);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImageUrl(await fileToCompressedDataUrl(file));
      } catch (err) {
        console.error('Photo upload error:', err);
        alert('Could not read that photo. Please choose a JPG or PNG image.');
      }
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setSelectedCoords({ lat, lng });
        setAddress(`GPS Location Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsDetectingLocation(false);
        alert('Could not retrieve live GPS coordinates. Please click on the map to pin location.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleNextStep = async () => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      alert('Please enter a title and description of the grievance.');
      return;
    }

    if (step === 3) {
      // Check for duplicates before moving to final review
      try {
        const dupRes = await api.checkDuplicates(
          selectedCoords.lat,
          selectedCoords.lng,
          departmentOverride || aiResult?.department || 'Roads & Infrastructure',
          title,
          description
        );
        setDuplicateCheck(dupRes);

        if (dupRes.hasDuplicate && dupRes.duplicateComplaints.length > 0) {
          setShowDuplicateModal(true);
          return;
        }
      } catch (err) {
        console.error('Duplicate check failed:', err);
      }
    }

    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        location: {
          address,
          landmark,
          ward,
          zone: 'Central Zone',
          lat: selectedCoords.lat,
          lng: selectedCoords.lng
        },
        citizen: {
          name: citizenName,
          phone: citizenPhone,
          email: citizenEmail,
          isAnonymous
        },
        images: {
          before: [imageUrl]
        },
        userDepartmentOverride: departmentOverride || undefined
      };

      const result = await api.createComplaint(payload);
      setSubmittedTicket(result);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(err.message || 'Failed to file grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedTicket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Grievance Successfully Registered & AI Triaged
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Ticket ID: {submittedTicket.id}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your grievance has been auto-routed to{' '}
              <strong className="text-slate-900">{submittedTicket.department}</strong> with{' '}
              <strong className="text-rose-600">{submittedTicket.priority} Priority</strong>.
            </p>
          </div>

          {/* Ticket Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Issue Title</span>
                <p className="font-bold text-slate-900 text-sm">{submittedTicket.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Department</span>
                  <p className="font-semibold text-slate-800">{submittedTicket.department}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Mandatory SLA</span>
                  <p className="font-bold text-blue-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {submittedTicket.estimatedSlaHours} Hours
                  </p>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Location</span>
                <p className="text-slate-700 truncate">{submittedTicket.location.address}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 text-center">
              <QRCodeSVG
                value={`${window.location.origin}/track/${submittedTicket.id}`}
                size={96}
                level="M"
              />
              <span className="text-[10px] font-bold text-slate-500 mt-2">Scan to Track Live</span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/track/${submittedTicket.id}`)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Track Live Resolution Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSubmittedTicket(null);
                setStep(1);
                setTitle('');
                setDescription('');
              }}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              File Another Grievance
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Page Title & Quick Templates */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Submit Citizen Grievance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              AI automatically classifies department, assesses hazard level, and schedules field dispatch.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Auto-Triage Active
          </span>
        </div>

        {/* Quick Testing Templates */}
        <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Try sample incident template (1-Click Fill):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="px-3 py-1 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        {[
          { num: 1, title: 'Issue Details & AI' },
          { num: 2, title: 'Photo & Vision' },
          { num: 3, title: 'GIS Location' },
          { num: 4, title: 'Review & Submit' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              step === s.num
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : step > s.num
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <div className="text-[10px] uppercase">Step {s.num}</div>
            <div className="truncate hidden sm:block">{s.title}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: ISSUE DETAILS & REAL-TIME AI */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">Step 1: Describe the Problem</h3>
            <p className="text-xs text-slate-500">
              Type naturally. You don't need to specify the department — our AI will route it in real time!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Deep pothole causing accidents near Metro Station..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                placeholder="Describe what happened, any safety hazards, duration of issue, landmark, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all leading-relaxed"
              ></textarea>
            </div>

            {/* REAL-TIME AI PREDICTION CARD */}
            {(title || description) && (
              <div className="pt-2">
                <AIClassifierBadge
                  priority={aiResult?.priority || 'Medium'}
                  department={departmentOverride || aiResult?.department}
                  confidence={aiResult?.aiAnalysis.confidence || 0.94}
                  slaHours={aiResult?.estimatedSlaHours || 24}
                  aiAnalysis={aiResult?.aiAnalysis}
                  showDetailed={true}
                />
              </div>
            )}

            {/* Optional Department Manual Override */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Optional: Manually choose department (Override AI suggestion)
              </label>
              <select
                value={departmentOverride}
                onChange={(e) => setDepartmentOverride(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Let AI Auto-Route (Recommended)</option>
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
                <option value="Solid Waste & Sanitation">Solid Waste & Sanitation</option>
                <option value="Electricity & Power">Electricity & Power</option>
                <option value="Public Health & Sanitation">Public Health & Sanitation</option>
                <option value="Urban Planning & Encroachment">Urban Planning & Encroachment</option>
                <option value="Parks & Recreation">Parks & Recreation</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Continue to Photo Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PHOTO UPLOAD & COMPUTER VISION */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">Step 2: Upload Photographic Evidence</h3>
            <p className="text-xs text-slate-500">
              Our Computer Vision AI analyzes images for defect severity, hazard tags, and authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Image Preview / URL / File Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Incident Photo / Visual Evidence *
                </label>
                <span className="text-[11px] text-blue-600 font-semibold">Camera or File</span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File upload action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Device / Camera</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste an image web URL..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group shadow-inner">
                <img
                  src={imageUrl}
                  alt="Incident Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Click 'Choose Photo' to replace image</span>
                </div>
              </div>
            </div>

            {/* AI Vision Inspection Report Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs border-b border-slate-200 pb-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>AI Computer Vision Inspector</span>
              </div>

              {visionAnalysis ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Detected Defect:</span>
                    <span className="font-bold text-slate-900">{visionAnalysis.issueDetected}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Vision Confidence:</span>
                    <span className="font-bold text-emerald-600">
                      {Math.round(visionAnalysis.confidence * 100)}% Verified
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Object Labels</span>
                    <div className="flex flex-wrap gap-1.5">
                      {visionAnalysis.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Inspecting image...</p>
              )}
            </div>

          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Continue to GIS Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GIS INTERACTIVE LOCATION PICKER */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Step 3: Pinpoint Location on Map</h3>
              <p className="text-xs text-slate-500">
                Click anywhere on the map to drop the GPS marker, or click auto-detect below.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetectingLocation}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1.5 self-start sm:self-center transition-all active:scale-95 shadow-2xs"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Auto-Detect My GPS Location'}</span>
            </button>
          </div>

          {/* Interactive Leaflet Map in Picker Mode */}
          <div className="h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
            <LeafletMap
              isPickerMode={true}
              selectedLocation={selectedCoords}
              onSelectLocation={handleLocationPick}
              height="100%"
              zoom={14}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Street / Area Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nearby Landmark / Pillar No.
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Municipal Ward / Zone *
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WARDS_LIST.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">GPS Coordinates:</span>
              <span className="font-mono font-bold text-blue-700">
                {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Continue to Final Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CITIZEN CONTACT */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">Step 4: Contact Info & Confirmation</h3>
            <p className="text-xs text-slate-500">
              Provide your details to receive live SMS/Email dispatch alerts and SLA notifications.
            </p>
          </div>

          {/* Citizen Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Full Name</label>
              <input
                type="text"
                value={citizenName}
                disabled={isAnonymous}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Phone (for SMS)</label>
              <input
                type="tel"
                value={citizenPhone}
                disabled={isAnonymous}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={citizenEmail}
                disabled={isAnonymous}
                onChange={(e) => setCitizenEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <label htmlFor="anon" className="text-xs text-slate-700 font-medium cursor-pointer">
                Submit Anonymously (Hide my personal contact from public transparency wall)
              </label>
            </div>
          </div>

          {/* Final Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-900 uppercase">
                AI Grievance Routing Summary
              </span>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                Guaranteed SLA: {aiResult?.estimatedSlaHours || 24} Hours
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-base">{title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-blue-200/60">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Assigned Dept:</span>
                <span className="font-semibold text-slate-800">
                  {departmentOverride || aiResult?.department}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Priority Tier:</span>
                <span className="font-bold text-rose-600">{aiResult?.priority || 'High'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Ward:</span>
                <span className="font-semibold text-slate-800">{ward}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitFinal}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <span>Generating Ticket & AI Routing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Submit & Generate Ticket ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* DUPLICATE WARNING MODAL */}
      <DuplicateWarningModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onUpvoteAndTrack={(dupId) => {
          api.upvoteComplaint(dupId);
          setShowDuplicateModal(false);
          navigate(`/track/${dupId}`);
        }}
        onContinueFiling={() => {
          setShowDuplicateModal(false);
          setStep(4);
        }}
        duplicates={duplicateCheck?.duplicateComplaints || []}
      />

    </div>
  );
};
