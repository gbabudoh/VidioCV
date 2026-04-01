"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Settings, LogOut, Bell, Filter, Video, Users, Calendar as CalendarIcon, 
  MapPin, Building2, Briefcase, Search, Mail, Lock, Shield, Sparkles,
  Trash2, ArrowLeft, ArrowRight, Archive, LayoutDashboard, AlertCircle, LayoutGrid, List
} from "lucide-react";
import MobileBottomNav from "@/app/components/common/MobileBottomNav";
import Link from "next/link";
import CandidateList from "@/app/components/dashboard/CandidateList";
import InterviewCalendar from "@/app/components/dashboard/InterviewCalendar";
import Modal from "@/app/components/common/Modal";
import VideoPlayer from "@/app/components/video-tools/VideoPlayer";
import Toggle from "@/app/components/common/Toggle";
import { useRouter } from "next/navigation";
import { useSessionSync } from "@/app/lib/hooks/useSessionSync";

type Tab = "overview" | "candidates" | "jobs" | "interviews" | "messages" | "settings";

// interface Option {
//   value: string;
//   label: string;
// }

interface ProfessionalSkill {
  name: string;
  level: string;
  years: number | null;
}

interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description?: string;
}

interface Candidate {
  id: string;
  userId: string;
  name: string;
  title: string;
  skills: string[];
  fullSkills?: ProfessionalSkill[];
  videoUrl: string | null;
  rating: number;
  experience?: Experience[];
  matchScore?: number;
  matchBreakdown?: {
    skills: number;
    title: number;
    metadata: number;
  };
  matchedSkills?: string[];
  missingSkills?: string[];
}

interface RecommendationJob {
  jobId: string;
  jobTitle: string;
  topMatches: Candidate[];
}

interface Interview {
  id: string;
  candidateName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  jobTitle?: string;
}

interface Job {
  id: string;
  title: string;
  views: number;
  applicants: number;
  days: number;
}

interface InboxThread {
  id: string;
  candidateName: string;
  candidateTitle: string;
  message: string;
  replyMessage: string | null;
  status: string;
  createdAt: string | Date;
  type: "inquiry" | "direct";
}

interface DirectSentMessage {
  id: string;
  body: string;
  subject?: string | null;
  createdAt: string;
  status: string;
  receiver: { name: string; email: string };
}

interface RawInboxSignal {
  id: string;
  candidateName?: string;
  candidateTitle?: string;
  message: string;
  replyMessage?: string | null;
  status?: string;
  createdAt: string | Date;
  type: "inquiry" | "direct";
  cvProfile?: {
    candidateName?: string;
    title?: string;
  } | null;
}


export default function EmployerDashboard() {
  const router = useRouter();
  useSessionSync();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [previousTab, setPreviousTab] = useState<Tab>("overview");
  const [settingsSection, setSettingsSection] = useState<"company" | "strategy" | "security" | "privacy" | "notifications">("company");
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string } | null>(null);

  // const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    browserAlerts: true,
    hiringActive: true,
    publicProfile: true,
    remoteFriendly: true,
    relocationSupport: true
  });

  // Employer Profile States
  const [employerName, setEmployerName] = useState("");
  const [employerCountry, setEmployerCountry] = useState("");
  const [employerType, setEmployerType] = useState("");
  const [employerBio, setEmployerBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Interaction States
  const [selectedCandidateVideo, setSelectedCandidateVideo] = useState<Candidate | null>(null);
  const [selectedCandidateExperience, setSelectedCandidateExperience] = useState<Candidate | null>(null);
  const [selectedCandidateSkills, setSelectedCandidateSkills] = useState<Candidate | null>(null);
  const [selectedCandidateMessage, setSelectedCandidateMessage] = useState<Candidate | null>(null);
  const [selectedCandidateSchedule, setSelectedCandidateSchedule] = useState<Candidate | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [employerInterviews, setEmployerInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkSearch, setNetworkSearch] = useState("");
  const [networkSort, setNetworkSort] = useState<'name' | 'skills' | 'recent'>("recent");
  const [messageText, setMessageText] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [inboxThreads, setInboxThreads] = useState<InboxThread[]>([]);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // New Messaging States
  const [messageSubTab, setMessageSubTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [directSentMessages, setDirectSentMessages] = useState<DirectSentMessage[]>([]);
  const [isLoadingDirectSent, setIsLoadingDirectSent] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  // New Scheduling States
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleJobId, setScheduleJobId] = useState("");
  const [scheduleType, setScheduleType] = useState("video");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [isGeneralScheduleModalOpen, setIsGeneralScheduleModalOpen] = useState(false);

  // New Post Job States
  const [postJobTitle, setPostJobTitle] = useState("");
  const [postJobDescription, setPostJobDescription] = useState("");
  const [postJobLocation, setPostJobLocation] = useState("");
  const [postJobSalaryMin, setPostJobSalaryMin] = useState(0);
  const [postJobSalaryMax, setPostJobSalaryMax] = useState(0);
  const [postJobDepartment, setPostJobDepartment] = useState("");
  const [postJobSkills, setPostJobSkills] = useState("");
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [postJobError, setPostJobError] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoadingCandidates(true);
        const res = await fetch("/api/candidates");
        const data = await res.json();
        if (data.success) {
          setCandidates(data.candidates || []);
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    fetchCandidates();
  },[]);

  const [recommendations, setRecommendations] = useState<RecommendationJob[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Use localStorage cache — skip ML run if data is fresh (5 min TTL)
        const CACHE_KEY = "recommendations_cache";
        const CACHE_TTL = 5 * 60 * 1000;
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setRecommendations(cachedData);
            return;
          }
        }

        setIsLoadingRecommendations(true);
        const response = await fetch("/api/candidates/recommendations", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data.recommendations, timestamp: Date.now() }));
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    if (activeTab === "candidates") {
      fetchRecommendations();
    }
  }, [activeTab]);

  console.log("Recommendations loaded:", recommendations.length);

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/profile/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user) {
           setEmployerName(data.user.name || "");
           setEmployerCountry(data.user.country || "");
           setEmployerType(data.user.companyType || "");
           // UserProfile might have bio/location
           if (data.user.profile) {
             setEmployerBio(data.user.profile.bio || "");
           }
        }
      } catch (error) {
        console.error("Failed to fetch employer profile:", error);
      }
    };
    fetchEmployerProfile();
  }, []);

  useEffect(() => {
    if (activeTab !== "messages") return;
    const fetchInbox = async () => {
      try {
        setIsLoadingInbox(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/messages/employer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const threads: InboxThread[] = data.messages.map((m: RawInboxSignal) => ({
            id: m.id,
            candidateName: m.candidateName || m.cvProfile?.candidateName || "Candidate",
            candidateTitle: m.candidateTitle || m.cvProfile?.title || "Professional",
            message: m.message,
            replyMessage: m.replyMessage || null,
            status: m.status || "pending",
            createdAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "Incoming",
            type: m.type as "inquiry" | "direct"
          }));
          setInboxThreads(threads);
        }
      } catch (error) {
        console.error("Failed to fetch inbox:", error);
      } finally {
        setIsLoadingInbox(false);
      }
    };
    fetchInbox();
  }, [activeTab]);

  useEffect(() => {
    const fetchDirectSent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setIsLoadingDirectSent(true);
        const response = await fetch("/api/messages/direct?type=sent", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setDirectSentMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to fetch direct sent messages:", error);
      } finally {
        setIsLoadingDirectSent(false);
      }
    };

    if (activeTab === "messages" && messageSubTab === "sent") {
      fetchDirectSent();
    }
  }, [activeTab, messageSubTab]);

  useEffect(() => {
    if (activeTab !== "jobs" && activeTab !== "overview" && activeTab !== "candidates") return;
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/job/employer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setEmployerJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Failed to fetch employer jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "interviews" && activeTab !== "overview" && activeTab !== "candidates") return;
    const fetchInterviews = async () => {
      try {
        setIsLoadingInterviews(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/interview/employer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setEmployerInterviews(data.interviews || []);
        }
      } catch (error) {
        console.error("Failed to fetch employer interviews:", error);
      } finally {
        setIsLoadingInterviews(false);
      }
    };
    fetchInterviews();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  const handleMessageAction = async (action: "archive" | "delete", messageId: string, type: "inquiry" | "direct") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messageId, action, type })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage({ title: "Operation Confirmed", message: `The correspondence has been successfully ${action}ed.` });
        setSelectedThread(null);
        // Refresh inbox
        const refreshRes = await fetch("/api/messages/employer", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          const formattedMessages: InboxThread[] = refreshData.messages.map((m: RawInboxSignal) => ({
            id: m.id,
            candidateName: m.candidateName || "Candidate",
            candidateTitle: m.candidateTitle || "Professional",
            message: m.message,
            replyMessage: m.replyMessage || null,
            status: m.status || "pending",
            createdAt: m.createdAt,
            type: m.type
          }));
          setInboxThreads(formattedMessages);
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} message:`, error);
    }
  };

  const handleSaveEmployerProfile = async () => {
    try {
      setIsSavingProfile(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/profile/employer/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: employerName,
          country: employerCountry,
          companyType: employerType
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage({
          title: "Brand Protocol Updated",
          message: "Your organizational identity has been synchronized across the talent network."
        });
      }
    } catch (error) {
      console.error("Save profile error:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePostJob = async () => {
    if (!postJobTitle || !postJobDescription || !postJobLocation || !postJobDepartment) {
      setPostJobError("Please fulfill all mandatory parameters to publish.");
      return;
    }

    try {
      setIsPostingJob(true);
      setPostJobError("");
      const token = localStorage.getItem("token");
      const response = await fetch("/api/job/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: postJobTitle,
          description: postJobDescription,
          location: postJobLocation,
          salary: {
            min: Number(postJobSalaryMin),
            max: Number(postJobSalaryMax)
          },
          skills: postJobSkills.split(",").map(s => s.trim()).filter(Boolean),
          department: postJobDepartment
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsPostJobModalOpen(false);
        setSuccessMessage({
          title: "Opportunity Published",
          message: "Your strategic role is now active in the talent intelligence network."
        });
        // Reset states
        setPostJobTitle("");
        setPostJobDescription("");
        setPostJobLocation("");
        setPostJobSalaryMin(0);
        setPostJobSalaryMax(0);
        setPostJobDepartment("");
        setPostJobSkills("");
        
        // Refresh jobs
        const res = await fetch("/api/job/employer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success) setEmployerJobs(d.jobs || []);
      } else {
        setPostJobError(data.message || "Failed to route publication.");
      }
    } catch (error) {
      console.error("Post job error:", error);
      setPostJobError("Critical failure during transmission.");
    } finally {
      setIsPostingJob(false);
    }
  };

  const networkQuery = networkSearch || searchQuery;
  const filteredCandidates = candidates
    .filter(c =>
      c.name.toLowerCase().includes(networkQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(networkQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(networkQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (networkSort === "name") return a.name.localeCompare(b.name);
      if (networkSort === "skills") return b.skills.length - a.skills.length;
      return 0; // "recent" — preserve original fetch order
    });

  const handleSendMessage = async () => {
    if (!selectedCandidateMessage || !messageText.trim()) return;

    try {
      setIsSendingMessage(true);
      const token = localStorage.getItem("token");
      
      // Use the unified DirectMessage API for the employer's "Compose" from Candidate List
      const response = await fetch("/api/messages/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedCandidateMessage.userId,
          subject: `Opportunity Inquiry: ${selectedCandidateMessage.title}`,
          body: messageText,
        })
      });

      const data = await response.json();
      const candidateName = selectedCandidateMessage.name;
      setSelectedCandidateMessage(null);
      setMessageText("");

      if (data.success) {
        setSuccessMessage({
          title: "Signal Dispatched",
          message: `Your direct communication to ${candidateName} has been routed through headquarters.`,
        });
      } else {
        console.error("Failed to send message:", data.message);
      }
    } catch (error) {
      setSelectedCandidateMessage(null);
      setMessageText("");
      console.error("Error sending message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendComposeDirect = async () => {
    if (!selectedRecipientId || !composeBody.trim()) return;

    try {
      setIsSendingDirect(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/messages/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedRecipientId,
          subject: composeSubject,
          body: composeBody,
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage({
          title: "Direct Signal Transmitted",
          message: "Your direct communication has been routed to the candidate's personal inbox."
        });
        setMessageSubTab("sent");
        setSelectedRecipientId("");
        setComposeSubject("");
        setComposeBody("");
      } else {
        console.error("Message send failed:", data.message);
      }
    } catch (error) {
      console.error("Direct message error:", error);
    } finally {
      setIsSendingDirect(false);
    }
  };

  const handleScheduleInterview = async () => {
    if ((!selectedCandidateSchedule && !isGeneralScheduleModalOpen) || !scheduleTime || !scheduleJobId) {
      setScheduleError("Please calibrate both synchronization time and target opportunity.");
      return;
    }

    const targetCandidateId = selectedCandidateSchedule?.userId || selectedRecipientId;
    if (!targetCandidateId) {
       setScheduleError("Please select a target candidate for this synchronization.");
       return;
    }

    try {
      setIsScheduling(true);
      setScheduleError("");
      const token = localStorage.getItem("token");
      const response = await fetch("/api/interview/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateId: targetCandidateId,
          jobId: scheduleJobId,
          dateTime: new Date(scheduleTime).toISOString(),
          interviewType: scheduleType,
          notes: scheduleNotes
        })
      });

      const data = await response.json();
      const name = selectedCandidateSchedule?.name || candidates.find(c => c.userId === targetCandidateId)?.name || "Candidate";

      if (data.success) {
        setSelectedCandidateSchedule(null);
        setIsGeneralScheduleModalOpen(false);
        setScheduleTime("");
        setScheduleJobId("");
        setScheduleNotes("");
        setScheduleType("video");
        setSelectedRecipientId("");
        
        setSuccessMessage({ 
          title: "Sync Proposed", 
          message: `A strategic sync invitation has been dispatched to ${name}.` 
        });
        
        // Refresh interviews
        const res = await fetch("/api/interview/employer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success) setEmployerInterviews(d.interviews || []);
      } else {
        setScheduleError(data.message || "Transmission failed. Check network integrity.");
      }
    } catch (error) {
      console.error("Scheduling error:", error);
      setScheduleError("Critical system error during dispatch.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div 
      className="min-h-screen overflow-hidden relative font-sans"
      style={{
        background: "linear-gradient(135deg, #E2E8F0 0%, #F9F9F9 45%, #F9F5F1 100%)",
      }}
    >
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px]" 
          style={{ background: "rgba(247,185,128,0.18)" }}
        />
        <div 
          className="absolute top-[15%] right-[-15%] w-[50%] h-[50%] rounded-full blur-[140px]" 
          style={{ background: "rgba(172,186,196,0.22)" }}
        />
        <div 
          className="absolute bottom-[-10%] left-[30%] w-[45%] h-[45%] rounded-full blur-[120px]" 
          style={{ background: "rgba(191,201,209,0.18)" }}
        />
      </div>

      {/* Dot grid */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(87,89,91,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 40%, black 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 40%, black 50%, transparent 100%)",
        }}
      />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center relative gap-4">
          <div className="flex items-center gap-6">
            <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer group shrink-0">
              <NextImage 
                src="/logo.png" 
                alt="VidioCV Logo" 
                width={120}
                height={38}
                className="object-contain group-hover:scale-105 transition-all md:w-[140px] md:h-[44px]"
                priority
              />
            </div>
            <Link 
              href="/" 
              className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] hover:text-[#334155] hover:bg-[#E2E8F0]/50 transition-all group cursor-pointer"
            >
              Go to homepage <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Mobile Back Button Context */}
          {activeTab !== "overview" && (
            <div className="md:hidden flex items-center">
               <button 
                 onClick={() => setActiveTab("overview")}
                 className="flex items-center gap-2 text-[#64748B] font-bold text-xs uppercase tracking-widest cursor-pointer"
               >
                 <ArrowLeft className="w-4 h-4" />
                 Back
               </button>
            </div>
          )}

          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <span className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-[#E2E8F0] rounded-2xl shadow-xl" style={{ color: "#334155" }}>
                 Employer Hub
             </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="p-2 md:p-3 bg-white hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#334155] rounded-xl md:rounded-2xl border border-[#E2E8F0] shadow-sm transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={() => {
              setPreviousTab(activeTab);
              setActiveTab("settings");
            }} className={`p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all cursor-pointer ${activeTab === "settings" ? "bg-white border-[#F7B980] text-[#F7B980] shadow-lg shadow-[#F7B980]/10" : "bg-white hover:bg-[#E2E8F0] border-[#E2E8F0] text-[#64748B] hover:text-[#334155] shadow-sm"}`}>
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-3 p-2 md:p-3 md:px-6 bg-white hover:bg-red-50 text-red-400 hover:text-red-500 rounded-xl md:rounded-2xl border border-[#E2E8F0] shadow-sm transition-all cursor-pointer font-bold text-[10px] md:text-xs uppercase tracking-widest">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Settings Context Header */}
        {activeTab === "settings" && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 p-8 lg:p-12 border border-white rounded-[48px] shadow-2xl relative overflow-hidden"
            style={{ 
              background: "rgba(255, 255, 255, 0.8)", 
              backdropFilter: "blur(40px)",
              boxShadow: "0 32px 80px rgba(87,89,91,0.12)"
            }}
          >
            <div className="flex items-center gap-8">
               <div className="w-24 h-24 bg-[#334155] rounded-[32px] flex items-center justify-center text-white shadow-2xl shrink-0 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Settings className="w-12 h-12" />
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#F7B980] animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "#64748B" }}>System Control</p>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight" style={{ color: "#334155" }}>Headquarters Strategy</h2>
               </div>
            </div>
            <button 
              onClick={() => setActiveTab(previousTab)}
              className="flex items-center gap-4 px-10 py-6 bg-[#334155] hover:bg-[#454749] text-white rounded-[28px] shadow-2xl transition-all cursor-pointer group active:scale-95"
            >
               <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-2" />
               <span className="font-black text-xs uppercase tracking-[0.2em]">Back to Dashboard</span>
            </button>
          </motion.div>
        )}

        {/* Top Company Hero Block - Hidden in Settings */}
        {activeTab !== "settings" && (
          <div 
            className="border border-white rounded-[40px] p-10 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-10 mb-12"
            style={{ 
              background: "rgba(255, 255, 255, 0.7)", 
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
            }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="w-32 h-32 bg-white rounded-[32px] shadow-2xl flex items-center justify-center shrink-0 border border-[#E2E8F0] relative group">
                 <Building2 className="w-14 h-14" style={{ color: "#F7B980" }} />
                 <div className="absolute inset-0 bg-[#F7B980]/5 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#64748B" }}>Enterprise Partner</p>
                  <h2 className="text-4xl font-black tracking-tight" style={{ color: "#334155" }}>TechNova Solutions</h2>
                </div>
                <p className="text-lg font-bold" style={{ color: "#64748B" }}>Software Development Hub • Global Operations</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <MapPin className="w-4 h-4" style={{ color: "#F7B980" }} />
                    <span className="text-xs font-bold" style={{ color: "#334155" }}>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <Users className="w-4 h-4" style={{ color: "#F7B980" }} />
                    <span className="text-xs font-bold" style={{ color: "#334155" }}>500+ professionals</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <Briefcase className="w-4 h-4" style={{ color: "#F7B980" }} />
                    <span className="text-xs font-bold" style={{ color: "#334155" }}>Active Hiring</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsPostJobModalOpen(true)} 
              className="px-10 py-5 bg-[#334155] hover:bg-[#454749] text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Post Opportunity
            </button>
          </div>
        )}

        {/* Navigation Tabs - Hidden in Settings and on Mobile */}
        {activeTab !== "settings" && (
          <div className="hidden md:flex gap-4 mb-12 p-2 bg-white/30 backdrop-blur-xl border border-white rounded-[32px] shadow-xl w-full md:w-max overflow-x-auto hide-scrollbar">
            {(["overview", "candidates", "jobs", "interviews", "messages", "settings"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-10 py-4 font-black text-[10px] uppercase tracking-[0.15em] rounded-2xl transition-all duration-500 cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white text-[#334155] shadow-2xl shadow-charcoal/10"
                    : "text-[#64748B] hover:text-[#334155] hover:bg-white/40"
                }`}
              >
                {tab.replace(/^./, str => str.toUpperCase())}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Hub Navigation */}
        <MobileBottomNav 
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as Tab)}
          items={[
            { id: "overview", label: "Hub", icon: LayoutDashboard },
            { id: "candidates", label: "Talent", icon: Users },
            { id: "jobs", label: "Jobs", icon: Briefcase },
            { id: "messages", label: "Mail", icon: Mail },
            { id: "settings", label: "Control", icon: Settings },
          ]}
        />

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Active Opportunities", value: employerJobs.length.toString(), color: "#F7B980", icon: <Briefcase className="w-6 h-6" /> },
                  { label: "Global Talent Pool", value: candidates.length.toString(), color: "#64748B", icon: <Users className="w-6 h-6" /> },
                  { label: "Planned Interviews", value: employerInterviews.length.toString(), color: "#334155", icon: <CalendarIcon className="w-6 h-6" /> }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (idx + 1) }}
                    onClick={() => {
                        if (stat.label.includes("Opportunities")) setActiveTab("jobs");
                        if (stat.label.includes("Talent")) setActiveTab("candidates");
                        if (stat.label.includes("Planned")) setActiveTab("interviews");
                    }}
                    className="group border border-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden transition-all hover:-translate-y-1 cursor-pointer"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.7)", 
                      backdropFilter: "blur(24px)",
                      boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                    }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl border border-[#E2E8F0] transition-transform group-hover:scale-110" style={{ background: "white", color: stat.color }}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#64748B" }}>{stat.label}</p>
                        <p className="text-4xl font-black tracking-tight" style={{ color: "#334155" }}>{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "candidates" && (
              <div 
                className="border border-white rounded-[40px] p-10 lg:p-12 shadow-2xl relative overflow-hidden"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[#E2E8F0] pb-10">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight" style={{ color: "#334155" }}>Global Talent Pool</h3>
                    <p className="font-medium text-base" style={{ color: "#64748B" }}>Curated matches driven by high-fidelity Video CVs.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-1 bg-white/50 p-1.5 rounded-2xl border border-[#E2E8F0] shadow-sm">
                       <button 
                         onClick={() => setViewMode('grid')}
                         className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-[#334155] text-white shadow-lg' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}
                         title="Grid View"
                       >
                         <LayoutGrid className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => setViewMode('list')}
                         className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#334155] text-white shadow-lg' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}
                         title="List View"
                       >
                         <List className="w-4 h-4" />
                       </button>
                    </div>
                    <button onClick={() => setIsFilterModalOpen(true)} className="px-8 py-4 bg-white hover:bg-[#E2E8F0] font-bold text-[10px] uppercase tracking-widest rounded-2xl text-[#334155] border border-[#E2E8F0] shadow-sm transition cursor-pointer flex items-center gap-3">
                      <Filter className="w-4 h-4" /> Refine
                    </button>
                    <div className="relative flex-1 md:w-80">
                       <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Search by name, skill, or role..." 
                         className="w-full pl-14 pr-8 py-4 bg-white border border-[#E2E8F0] rounded-2xl text-[#334155] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#F7B980]/10 focus:border-[#F7B980] transition-all" 
                       />
                    </div>
                  </div>
                </div>
                {isLoadingCandidates ? (
                  <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                     <p className="text-[#64748B] font-bold text-sm tracking-wide">Loading global talent pool...</p>
                  </div>
                ) : (
                  <div className="space-y-16">
                    {/* AI Matching Section */}
                    {isLoadingRecommendations ? (
                       <div>
                          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
                          <div className="grid grid-cols-2 gap-8">
                             {[1, 2].map(i => (
                               <div key={i} className="w-full h-[320px] bg-white rounded-[40px] border border-gray-100 animate-pulse" />
                             ))}
                          </div>
                       </div>
                    ) : recommendations.length > 0 && !searchQuery && (
                      <div>
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2.5 bg-amber-100 rounded-2xl shadow-sm border border-amber-200">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black tracking-tight" style={{ color: "#334155" }}>AI Talent Intelligence</h3>
                            <p className="text-sm font-semibold opacity-60" style={{ color: "#64748B" }}>Top-tier matches calibrated for your active opportunities.</p>
                          </div>
                        </div>

                        <div className={viewMode === 'list' ? "flex flex-col gap-8" : "grid grid-cols-1 md:grid-cols-2 gap-8"}>
                          {recommendations.map((rec) => (
                            <div key={rec.jobId} className="space-y-4">
                              <div className="flex items-center gap-4 pl-2">
                                 <div className="w-1.5 h-6 bg-[#F7B980] rounded-full" />
                                 <h4 className="text-sm font-black uppercase tracking-widest text-[#64748B]">For: {rec.jobTitle}</h4>
                              </div>

                              <CandidateList
                                candidates={rec.topMatches.map(c => ({...c, matchScore: c.matchScore}))}
                                viewMode={viewMode}
                                columns={1}
                                onViewVideo={(c) => setSelectedCandidateVideo(c)}
                                onMessage={(c) => setSelectedCandidateMessage(c)}
                                onSchedule={(c) => setSelectedCandidateSchedule(c)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Talent Network */}
                    <div className="border-t border-[#E2E8F0] pt-10 space-y-6">
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#E2E8F0] rounded-2xl">
                            <Users className="w-5 h-5 text-[#64748B]" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black tracking-tight" style={{ color: "#334155" }}>Talent Network</h3>
                            <p className="text-sm font-semibold opacity-60" style={{ color: "#64748B" }}>
                              {filteredCandidates.length} professional{filteredCandidates.length !== 1 ? "s" : ""} found
                            </p>
                          </div>
                        </div>

                        {/* Sort pills */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#64748B] font-semibold mr-1">Sort:</span>
                          {(["recent", "name", "skills"] as const).map(opt => (
                            <button
                              key={opt}
                              onClick={() => setNetworkSort(opt)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                                networkSort === opt
                                  ? "bg-[#334155] text-white"
                                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] cursor-pointer"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Search bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                          type="text"
                          value={networkSearch}
                          onChange={(e) => setNetworkSearch(e.target.value)}
                          placeholder="Search by name, role, or skill…"
                          className="w-full pl-11 pr-10 py-3 bg-white border border-[gainsboro] rounded-2xl text-sm text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#334155]/10 focus:border-[#334155]/30 transition-all"
                        />
                        {networkSearch && (
                          <button
                            onClick={() => setNetworkSearch("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155] transition-colors text-xs font-semibold cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Results */}
                      {filteredCandidates.length > 0 ? (
                        <CandidateList
                          candidates={filteredCandidates}
                          viewMode={viewMode}
                          onViewVideo={(c) => setSelectedCandidateVideo(c)}
                          onMessage={(c) => setSelectedCandidateMessage(c)}
                          onSchedule={(c) => setSelectedCandidateSchedule(c)}
                        />
                      ) : (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-[#E2E8F0]">
                          <p className="text-[#334155] font-black text-xl mb-2">No professionals found</p>
                          <p className="text-[#64748B] text-sm">Try adjusting your search or clearing filters.</p>
                          {networkSearch && (
                            <button
                              onClick={() => setNetworkSearch("")}
                              className="mt-4 px-5 py-2 bg-[#334155] text-white rounded-xl text-sm font-semibold hover:bg-[#475569] transition-all cursor-pointer"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "jobs" && (
              <div 
                className="border border-white rounded-[40px] p-10 lg:p-12 shadow-2xl relative overflow-hidden"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[#E2E8F0] pb-10">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight" style={{ color: "#334155" }}>Opportunity Pipeline</h3>
                    <p className="font-medium text-base" style={{ color: "#64748B" }}>Manage your active roles and track talent resonance.</p>
                  </div>
                </div>
                
                {isLoadingJobs ? (
                  <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                     <p className="text-[#64748B] font-bold text-sm tracking-wide">Retrieving your opportunities...</p>
                  </div>
                ) : employerJobs.length > 0 ? (
                  <div className="grid gap-6">
                    {employerJobs.map((job) => (
                      <div
                        key={job.id}
                        className="group bg-white/40 border-2 border-transparent rounded-[32px] p-8 transition-all hover:bg-white hover:border-[#F7B980]/30 hover:shadow-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 cursor-pointer"
                        style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid #E0E4E3" }}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 w-full">
                          <div className="space-y-2">
                            <h4 className="text-2xl font-black group-hover:text-[#F7B980] transition-colors" style={{ color: "#334155" }}>
                              {job.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>
                              <span className="flex items-center gap-2 px-3 py-1 bg-[#E2E8F0] rounded-lg">Posted {job.days} days ago</span>
                              <span className="flex items-center gap-2 px-3 py-1 bg-[#E2E8F0] rounded-lg">{job.applicants} applications</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full sm:w-auto">
                             <span className="px-6 py-2 bg-[#E2E8F0] rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#334155] border border-white transition-all group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] group-hover:border-[#F7B980]/20">
                               Active
                             </span>
                             <button onClick={() => setSelectedJob(job)} className="px-8 py-3.5 bg-[#334155] hover:bg-[#454749] text-white font-bold text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer">
                               Blueprint
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-[#E2E8F0]">
                     <p className="text-[#334155] font-black text-xl mb-2">No active opportunities</p>
                     <p className="text-[#64748B] text-sm">Your pipeline is currently empty. Post a new role to start discovering global talent.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "interviews" && (
              <div 
                className="border border-white rounded-[40px] p-10 lg:p-12 shadow-2xl relative overflow-hidden"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[#E2E8F0] pb-10">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight" style={{ color: "#334155" }}>Session Schedule</h3>
                    <p className="font-medium text-base" style={{ color: "#64748B" }}>Coordinate your global interview syncs and talent meetups.</p>
                  </div>
                  <button 
                    onClick={() => setIsGeneralScheduleModalOpen(true)}
                    className="px-8 py-4 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Propose New Sync
                  </button>
                </div>
                {isLoadingInterviews ? (
                  <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                     <p className="text-[#64748B] font-bold text-sm tracking-wide">Syncing your schedule...</p>
                  </div>
                ) : employerInterviews.length > 0 ? (
                  <div className="bg-white/40 p-4 rounded-[40px] border border-[#E2E8F0]">
                    <InterviewCalendar interviews={employerInterviews} />
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white/40 rounded-[40px] border border-dashed border-[#E2E8F0]">
                     <div className="w-16 h-16 bg-[#E2E8F0] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarIcon className="w-8 h-8 text-[#64748B]" />
                     </div>
                     <p className="text-[#334155] font-black text-xl mb-2">No Synchronizations</p>
                     <p className="text-[#64748B] text-sm">Your schedule is currently clear. Reach out to talent to propose a meeting.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div 
                className="border border-white rounded-[48px] p-2 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row min-h-[800px]"
                style={{ 
                  background: "rgba(255, 255, 255, 0.8)", 
                  backdropFilter: "blur(40px)",
                  boxShadow: "0 32px 80px rgba(87,89,91,0.12)"
                }}
              >
                {/* Settings Sidebar */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]/60 p-10 space-y-4">
                   <button 
                     onClick={() => setActiveTab(previousTab)}
                     className="flex items-center gap-2 mb-10 px-4 text-[#64748B] hover:text-[#334155] font-black text-[10px] uppercase tracking-[0.2em] transition-all group cursor-pointer"
                   >
                     <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                   </button>
                   <div className="mb-6 px-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#64748B" }}>Organization</p>
                     <h3 className="text-xl font-bold" style={{ color: "#334155" }}>Operations</h3>
                   </div>
                     {[
                       { id: "company", label: "Company Presence", icon: Building2, desc: "Brand footprint" },
                       { id: "strategy", label: "Talent Strategy", icon: Briefcase, desc: "Recruitment logic" },
                       { id: "security", label: "Access Control", icon: Shield, desc: "Keys and sessions" },
                       { id: "privacy", label: "Data Pipeline", icon: Lock, desc: "Corporate visibility" },
                       { id: "notifications", label: "Alert Protocols", icon: Bell, desc: "Push & email" },
                     ].map((item) => (
                       <button
                         key={item.id}
                         onClick={() => setSettingsSection(item.id as "company" | "strategy" | "security" | "privacy" | "notifications")}
                         className={`w-full flex items-center gap-5 px-6 py-5 rounded-[28px] transition-all cursor-pointer group text-left`}
                         style={settingsSection === item.id ? {
                           background: "white",
                           color: "#F7B980",
                           boxShadow: "0 12px 32px rgba(247,185,128,0.15)"
                         } : {
                           color: "#64748B",
                         }}
                       >
                       <div className={`p-3 rounded-2xl transition-colors ${settingsSection === item.id ? "bg-[#F7B980]/10 text-[#F7B980]" : "bg-[#E2E8F0] text-[#64748B] group-hover:text-[#334155]"}`}>
                         <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-sm leading-tight">{item.label}</p>
                         <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                       </div>
                     </button>
                   ))}

                   <div className="pt-10 mt-10 border-t border-[#E2E8F0] px-4">
                      <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-3 text-red-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all group cursor-pointer">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Exit Workspace
                      </button>
                   </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 p-10 lg:p-20 overflow-y-auto bg-white/30 relative">
                    <div className="flex lg:hidden mb-8">
                       <button 
                         onClick={() => setActiveTab(previousTab)}
                         className="flex items-center gap-2 text-[#64748B] hover:text-[#334155] font-black text-[10px] uppercase tracking-widest transition-all group cursor-pointer"
                       >
                         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                       </button>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={settingsSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-4xl mx-auto space-y-16"
                      >
                        {settingsSection === "company" && (
                          <div className="space-y-12">
                             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E2E8F0]">
                               <div>
                                 <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#334155" }}>Brand Footprint</h3>
                                 <p className="font-medium text-base leading-relaxed" style={{ color: "#64748B" }}>Manage your organization&apos;s global identity and identifier.</p>
                               </div>
                               <div className="w-24 h-24 rounded-[32px] bg-white border border-[#E2E8F0] shadow-xl flex items-center justify-center">
                                  <Building2 className="w-10 h-10 text-[#F7B980]" />
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Legal Entity</label>
                                <input 
                                  type="text" 
                                  value={employerName} 
                                  onChange={(e) => setEmployerName(e.target.value)}
                                  placeholder="e.g. TechNova Solutions"
                                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-3xl outline-none transition-all font-bold focus:border-[#F7B980] shadow-sm" style={{ color: "#334155" }} 
                                />
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Primary Industry</label>
                                <select 
                                  value={employerType}
                                  onChange={(e) => setEmployerType(e.target.value)}
                                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-3xl outline-none transition-all font-bold focus:border-[#F7B980] shadow-sm appearance-none cursor-pointer" 
                                  style={{ color: "#334155" }}
                                >
                                  <option value="">Select Industry...</option>
                                  <option value="Software & SaaS">Software & SaaS</option>
                                  <option value="Fintech">Fintech</option>
                                  <option value="Healthcare">Healthcare</option>
                                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                                  <option value="E-commerce">E-commerce</option>
                                  <option value="Cybersecurity">Cybersecurity</option>
                                </select>
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Operational Base (Country)</label>
                                <input 
                                  type="text" 
                                  value={employerCountry} 
                                  onChange={(e) => setEmployerCountry(e.target.value)}
                                  placeholder="e.g. United Kingdom"
                                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-3xl outline-none transition-all font-bold focus:border-[#F7B980] shadow-sm" style={{ color: "#334155" }} 
                                />
                              </div>
                              <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Organization Narrative</label>
                                <textarea 
                                  rows={5} 
                                  value={employerBio}
                                  onChange={(e) => setEmployerBio(e.target.value)}
                                  placeholder="Describe your organization's mission..."
                                  className="w-full px-8 py-6 bg-white border border-[#E2E8F0] rounded-[32px] outline-none transition-all font-medium text-lg leading-relaxed focus:border-[#F7B980] shadow-sm resize-none" style={{ color: "#334155" }} 
                                />
                              </div>
                              <div className="md:col-span-2 flex justify-end">
                                 <button
                                   onClick={handleSaveEmployerProfile}
                                   disabled={isSavingProfile}
                                   className="px-12 py-4 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 cursor-pointer"
                                 >
                                   {isSavingProfile ? "Synchronizing..." : "Save Brand Protocol"}
                                 </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "strategy" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#E2E8F0]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#334155" }}>Recruitment Strategy</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#64748B" }}>Configure your hiring mobility and workplace culture signals.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-12">
                               <div className="space-y-8">
                                  <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] mb-6 block" style={{ color: "#64748B" }}>Operational protocols</label>
                                    <div className="space-y-6">
                                      <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 flex items-center justify-between shadow-sm">
                                        <div className="space-y-1">
                                          <p className="font-bold text-sm" style={{ color: "#334155" }}>Hiring Active</p>
                                          <p className="text-xs font-medium" style={{ color: "#64748B" }}>Signal that your pipeline is currently open for applications.</p>
                                        </div>
                                        <Toggle enabled={prefs.hiringActive} setEnabled={(val) => setPrefs({...prefs, hiringActive: val})} />
                                      </div>
                                      <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 flex items-center justify-between shadow-sm">
                                        <div className="space-y-1">
                                          <p className="font-bold text-sm" style={{ color: "#334155" }}>Remote Operations</p>
                                          <p className="text-xs font-medium" style={{ color: "#64748B" }}>Showcase your company as a distributed-first workspace.</p>
                                        </div>
                                        <Toggle enabled={prefs.remoteFriendly} setEnabled={(val) => setPrefs({...prefs, remoteFriendly: val})} />
                                      </div>
                                      <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 flex items-center justify-between shadow-sm">
                                        <div className="space-y-1">
                                          <p className="font-bold text-sm" style={{ color: "#334155" }}>Relocation Support</p>
                                          <p className="text-xs font-medium" style={{ color: "#64748B" }}>Offer logistical assistance for global talent transitions.</p>
                                        </div>
                                        <Toggle enabled={prefs.relocationSupport} setEnabled={(val) => setPrefs({...prefs, relocationSupport: val})} />
                                      </div>
                                    </div>
                                  </div>
                               </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "notifications" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#E2E8F0]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#334155" }}>Alert Protocols</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#64748B" }}>Configure your real-time signal preferences for talent activity.</p>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 flex items-start gap-8 shadow-sm group hover:shadow-md transition-all">
                                <div className="p-4 rounded-2xl bg-[#E2E8F0] text-[#64748B] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors">
                                  <Mail className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="font-bold text-sm" style={{ color: "#334155" }}>Email Sync</p>
                                      <p className="text-xs font-medium" style={{ color: "#64748B" }}>Weekly candidate digests and mission-critical updates.</p>
                                    </div>
                                    <Toggle enabled={prefs.emailAlerts} setEnabled={(val) => setPrefs({...prefs, emailAlerts: val})} />
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-8 flex items-start gap-8 shadow-sm group hover:shadow-md transition-all">
                                <div className="p-4 rounded-2xl bg-[#E2E8F0] text-[#64748B] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors">
                                  <Bell className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="font-bold text-sm" style={{ color: "#334155" }}>Desktop Signals</p>
                                      <p className="text-xs font-medium" style={{ color: "#64748B" }}>Instant push notifications for new Video CV uploads.</p>
                                    </div>
                                    <Toggle enabled={prefs.browserAlerts} setEnabled={(val) => setPrefs({...prefs, browserAlerts: val})} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "privacy" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#E2E8F0]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#334155" }}>Data Pipeline</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#64748B" }}>Control your corporate visibility and recruitment data footprint.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="bg-[#334155] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                      <div className="max-w-md space-y-4">
                                         <h4 className="text-2xl font-black">Public Presence</h4>
                                         <p className="text-white/60 font-medium leading-relaxed">When active, your company profile is promoted to top-tier candidates on the global network.</p>
                                         <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10">
                                            <Shield className="w-5 h-5 text-[#F7B980]" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Secured by Corporate Privacy Protocols</p>
                                         </div>
                                      </div>
                                      <div className="bg-white/10 p-8 rounded-[32px] border border-white/20">
                                        <Toggle 
                                          enabled={prefs.publicProfile} 
                                          setEnabled={(val) => setPrefs({...prefs, publicProfile: val})} 
                                          dark
                                        />
                                      </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7B980]/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                                </div>

                                <div className="p-8 rounded-[32px] border-2 border-dashed border-[#E2E8F0] flex items-center justify-between">
                                   <div className="flex items-center gap-6">
                                      <div className="p-4 rounded-2xl bg-[#E2E8F0] text-[#64748B]">
                                        <Trash2 className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm" style={{ color: "#334155" }}>Recruitment Narrative Wipe</p>
                                        <p className="text-xs font-medium" style={{ color: "#64748B" }}>Irreversibly delete your job postings and inbound applicant data.</p>
                                      </div>
                                   </div>
                                   <button className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer">Execute Wipe</button>
                                </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "security" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#E2E8F0]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#334155" }}>Security Hub</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#64748B" }}>Manage organizational authentication and active workspace sessions.</p>
                            </div>
                            <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-10 flex items-center justify-between">
                               <div className="flex items-center gap-6">
                                  <div className="w-14 h-14 rounded-2xl bg-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                                     <Lock className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <p className="font-bold text-sm" style={{ color: "#334155" }}>Master Access Key</p>
                                     <p className="text-xs font-medium" style={{ color: "#64748B" }}>Update your corporate credential periodically for high security.</p>
                                  </div>
                               </div>
                               <button className="px-8 py-3.5 border-2 border-[#E2E8F0] rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-[#E2E8F0] transition-all cursor-pointer">Update Key</button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                </div>
              </div>
            )}            {activeTab === "messages" && (
              <div className="space-y-12">
                 <div 
                    className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.7)", 
                      backdropFilter: "blur(24px)",
                      boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                    }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-[#E2E8F0] pb-10">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tight" style={{ color: "#334155" }}>Recruiter Workspace</h3>
                        <p className="font-medium text-base" style={{ color: "#64748B" }}>Manage your direct talent communications and inquiries.</p>
                      </div>
                      <div className="flex p-1.5 bg-[#E2E8F0] rounded-2xl">
                        {(["inbox", "sent", "compose"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setMessageSubTab(tab)}
                            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                              messageSubTab === tab 
                                ? "bg-white text-[#F7B980] shadow-lg shadow-[#F7B980]/5" 
                                : "text-[#64748B] hover:text-[#334155]"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {messageSubTab === "inbox" && (
                      <div className="space-y-6">
                        {isLoadingInbox ? (
                          <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                            <p className="text-[#64748B] font-bold text-sm tracking-wide">Syncing your workspace...</p>
                          </div>
                        ) : inboxThreads.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {inboxThreads.map((thread) => (
                              <div
                                key={thread.id}
                                onClick={() => setSelectedThread(thread)}
                                className="p-8 rounded-[32px] border transition-all cursor-pointer group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                                style={thread.status === "pending" ? {
                                  background: "#FFFFFF",
                                  borderColor: "#F7B980",
                                  boxShadow: "0 12px 32px rgba(247,185,128,0.08)"
                                } : {
                                  background: "rgba(255,255,255,0.4)",
                                  borderColor: "#E2E8F0"
                                }}
                              >
                                <div className="flex gap-6 items-center flex-1">
                                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-inner" style={{ background: "#E2E8F0", color: "#F7B980" }}>
                                    {thread.candidateName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-black text-lg transition-colors group-hover:text-[#F7B980] flex items-center gap-3" style={{ color: "#334155" }}>
                                      {thread.candidateName}
                                      {thread.status === "pending" && <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-lg shadow-[#10B981]/20" />}
                                    </h4>
                                    <p className="text-sm font-bold opacity-60" style={{ color: "#64748B" }}>{thread.candidateTitle}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-8">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{new Date(thread.createdAt).toLocaleDateString()}</p>
                                  <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center group-hover:bg-[#F7B980] group-hover:text-white transition-all group-hover:translate-x-1">
                                    <ArrowRight className="w-5 h-5" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-24 bg-[#E2E8F0]/20 rounded-[40px] border-2 border-dashed border-[#E2E8F0]">
                            <Mail className="w-12 h-12 text-[#64748B] mx-auto mb-6 opacity-40" />
                            <p className="text-[#64748B] font-bold text-lg">No incoming transmissions found in this sector.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {messageSubTab === "sent" && (
                      <div className="space-y-6">
                        {isLoadingDirectSent ? (
                          <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                            <p className="text-[#64748B] font-bold text-sm tracking-wide">Retrieving log files...</p>
                          </div>
                        ) : directSentMessages.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4">
                            {directSentMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className="p-8 rounded-[32px] border bg-white/40 border-[#E2E8F0] transition-all hover:bg-white hover:shadow-xl group"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-4 items-center">
                                     <div className="w-10 h-10 rounded-xl bg-[#334155] text-white flex items-center justify-center font-bold shadow-lg">
                                       {msg.receiver.name.charAt(0)}
                                     </div>
                                     <div>
                                       <h4 className="font-bold text-[#334155]">{msg.receiver.name}</h4>
                                       <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{msg.receiver.email}</p>
                                     </div>
                                  </div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="pl-14">
                                   <p className="text-sm font-medium leading-relaxed opacity-60 italic" style={{ color: "#334155" }}>&quot;{msg.body}&quot;</p>
                                   <div className="mt-4 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#10B981]">Signal Successfully Transmitted</p>
                                   </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-24 bg-[#E2E8F0]/20 rounded-[40px] border-2 border-dashed border-[#E2E8F0]">
                            <Mail className="w-12 h-12 text-[#64748B] mx-auto mb-6 opacity-40" />
                            <p className="text-[#64748B] font-bold text-lg">No transmitted signals found in your logs.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {messageSubTab === "compose" && (
                      <div className="max-w-3xl mx-auto space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest block pl-2" style={{ color: "#64748B" }}>Target Candidate</label>
                              <select 
                                value={selectedRecipientId}
                                onChange={(e) => setSelectedRecipientId(e.target.value)}
                                className="w-full px-6 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none font-bold text-sm focus:border-[#F7B980] transition-all shadow-sm"
                                style={{ color: "#334155" }}
                              >
                                <option value="">Select Candidate...</option>
                                {candidates.map(candidate => (
                                  <option key={candidate.id} value={candidate.userId}>{candidate.name} — {candidate.title}</option>
                                ))}
                              </select>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest block pl-2" style={{ color: "#64748B" }}>Inquiry Subject</label>
                              <input 
                                type="text"
                                value={composeSubject}
                                onChange={(e) => setComposeSubject(e.target.value)}
                                placeholder="Corporate Inquiry"
                                className="w-full px-6 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none font-bold text-sm focus:border-[#F7B980] transition-all shadow-sm"
                                style={{ color: "#334155" }}
                              />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest block pl-2" style={{ color: "#64748B" }}>Message Blueprint</label>
                           <textarea 
                             rows={6}
                             value={composeBody}
                             onChange={(e) => setComposeBody(e.target.value)}
                             placeholder="Draft your professional outreach signal..."
                             className="w-full px-8 py-6 bg-white border border-[#E2E8F0] rounded-[32px] outline-none font-medium text-base leading-relaxed focus:border-[#F7B980] shadow-sm resize-none"
                             style={{ color: "#334155" }}
                           />
                        </div>
                        <button 
                          onClick={handleSendComposeDirect}
                          disabled={!selectedRecipientId || !composeBody.trim() || isSendingDirect}
                          className="w-full py-5 bg-[#334155] hover:bg-[#454749] text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group flex items-center justify-center gap-3"
                        >
                           {isSendingDirect ? "Transmitting..." : (
                             <>
                               Initiate Professional Outreach
                               <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                             </>
                           )}
                        </button>
                      </div>
                    )}
                 </div>

                 {/* Thread Detail Modal */}
                 {selectedThread && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#334155]/40 backdrop-blur-md">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full max-w-2xl bg-white/95 rounded-[48px] p-10 shadow-2xl border border-white relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-8 mb-8">
                        <div className="flex gap-5 items-center">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg" style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "white" }}>
                            {selectedThread.candidateName ? selectedThread.candidateName.charAt(0) : "?"}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black leading-tight" style={{ color: "#334155" }}>{selectedThread.candidateName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: "#64748B" }}>{selectedThread.candidateTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">
                             {selectedThread.createdAt ? new Date(selectedThread.createdAt).toLocaleDateString() : "Incoming"}
                          </p>
                          <div className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-[8px] font-black uppercase tracking-widest inline-block border border-[#10B981]/20">Active Channel</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-8 rounded-[32px] border border-[#E2E8F0] bg-[#E2E8F0]/20 shadow-inner relative overflow-hidden">
                           <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40" style={{ color: "#334155" }}>Original Correspondence</p>
                           <p className="text-base font-medium whitespace-pre-wrap leading-relaxed relative z-10" style={{ color: "#334155" }}>{selectedThread.message}</p>
                           <Mail className="absolute -bottom-4 -right-4 w-24 h-24 text-[#334155]/5 -rotate-12" />
                        </div>

                        {selectedThread.replyMessage && (
                          <div className="p-8 rounded-[32px] border border-[#10B981]/20 bg-[#10B981]/5 relative">
                            <div className="flex items-center gap-3 mb-4">
                               <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Candidate Transmission Received</p>
                            </div>
                            <p className="text-base font-medium whitespace-pre-wrap leading-relaxed" style={{ color: "#334155" }}>{selectedThread.replyMessage}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 mt-10">
                        <button
                          onClick={() => handleMessageAction("archive", selectedThread.id, selectedThread.type)}
                          className="flex-1 py-4 rounded-[20px] font-black text-[10px] tracking-[0.2em] uppercase transition-all border-2 border-[#E2E8F0] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#334155] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                        <button
                          onClick={() => handleMessageAction("delete", selectedThread.id, selectedThread.type)}
                          className="flex-1 py-4 rounded-[20px] font-black text-[10px] tracking-[0.2em] uppercase transition-all border-2 border-red-50 hover:bg-red-50 text-red-300 hover:text-red-400 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <button
                          onClick={() => setSelectedThread(null)}
                          className="px-8 py-4 rounded-[20px] font-black text-[10px] tracking-[0.2em] uppercase transition-all bg-[#334155] hover:bg-[#454749] text-white cursor-pointer shadow-lg"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                 )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Modals */}
      <Modal 
        isOpen={!!successMessage} 
        onClose={() => setSuccessMessage(null)} 
        type="success" 
        title={successMessage?.title}
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#E2E8F0] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#F7B980]" />
          </div>
          <p className="text-lg font-bold" style={{ color: "#334155" }}>
            {successMessage?.message}
          </p>
        </div>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        isOpen={isPostJobModalOpen}
        onClose={() => {
          setIsPostJobModalOpen(false);
          setPostJobError("");
        }}
        title="Post Global Opportunity"
        type="default"
        primaryAction={{
          label: isPostingJob ? "Publishing..." : "Publish to Network",
          onClick: handlePostJob
        }}
      >
        <div className="space-y-8 p-2">
          {postJobError && (
             <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{postJobError}</p>
             </div>
          )}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Opportunity Title</label>
            <input 
              type="text" 
              value={postJobTitle}
              onChange={(e) => setPostJobTitle(e.target.value)}
              placeholder="e.g. Lead Distributed Systems Engineer" 
              className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all" 
              style={{ color: "#334155" }} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Global Region</label>
                <input 
                  type="text" 
                  value={postJobLocation}
                  onChange={(e) => setPostJobLocation(e.target.value)}
                  placeholder="e.g. Remote / London" 
                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all" 
                  style={{ color: "#334155" }} 
                />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Strategic Department</label>
                <input 
                  type="text" 
                  value={postJobDepartment}
                  onChange={(e) => setPostJobDepartment(e.target.value)}
                  placeholder="e.g. Engineering" 
                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all" 
                  style={{ color: "#334155" }} 
                />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Minimum Yield (Salary)</label>
                <input 
                  type="number" 
                  value={postJobSalaryMin}
                  onChange={(e) => setPostJobSalaryMin(Number(e.target.value))}
                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all" 
                  style={{ color: "#334155" }} 
                />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Maximum Yield (Salary)</label>
                <input 
                  type="number" 
                  value={postJobSalaryMax}
                  onChange={(e) => setPostJobSalaryMax(Number(e.target.value))}
                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all" 
                  style={{ color: "#334155" }} 
                />
             </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Required Techniques (Skills, comma separated)</label>
            <input 
              type="text" 
              value={postJobSkills}
              onChange={(e) => setPostJobSkills(e.target.value)}
              placeholder="e.g. React, Node.js, AI" 
              className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all" 
              style={{ color: "#334155" }} 
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Strategic Narrative</label>
            <textarea 
              rows={4} 
              value={postJobDescription}
              onChange={(e) => setPostJobDescription(e.target.value)}
              placeholder="Describe the mission, impact, and requirements..." 
              className="w-full px-8 py-6 bg-white border border-[#E2E8F0] rounded-[24px] font-medium text-base outline-none focus:border-[#F7B980] transition-all resize-none" 
              style={{ color: "#334155" }} 
            />
          </div>
        </div>
      </Modal>

      {/* Action Modals */}
      <Modal 
        isOpen={!!selectedCandidateVideo} 
        onClose={() => setSelectedCandidateVideo(null)} 
        type="default" 
        title={`Video CV Presence: ${selectedCandidateVideo?.name}`}
        closeActionLabel=" Return to Pool "
      >
        <div className="bg-[#334155] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
           {selectedCandidateVideo?.videoUrl && selectedCandidateVideo.videoUrl !== "#" ? (
             <VideoPlayer src={selectedCandidateVideo.videoUrl} title={selectedCandidateVideo.name} />
           ) : (
             <div className="aspect-video flex flex-col items-center justify-center gap-6 bg-white/5">
               <div className="p-6 rounded-full bg-white/10">
                 <Video className="w-12 h-12 text-white/40" />
               </div>
               <p className="text-white/60 text-sm font-bold tracking-widest uppercase">Narrative Unavailable</p>
             </div>
           )}
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedCandidateExperience} 
        onClose={() => setSelectedCandidateExperience(null)} 
        type="default" 
        title={`Work Experience: ${selectedCandidateExperience?.name}`}
        closeActionLabel=" Close Portfolio "
      >
        <div className="space-y-6 p-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
          {selectedCandidateExperience?.experience && selectedCandidateExperience.experience.length > 0 ? (
            <div className="space-y-8">
              {selectedCandidateExperience.experience.map((exp) => (
                <div key={exp.id} className="relative pl-12 pb-8 border-l-2 border-[#E2E8F0] last:pb-0">
                  <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-[#F7B980] z-10" />
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-lg font-black" style={{ color: "#334155" }}>{exp.role}</h4>
                      <span className="px-4 py-1 rounded-full bg-[#E2E8F0] text-[#64748B] text-[10px] font-black uppercase tracking-widest">{exp.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748B] font-bold text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>{exp.company}</span>
                    </div>
                    {exp.description && (
                      <p className="text-[#8A8C8E] text-sm leading-relaxed font-medium mt-4 bg-[#F2F4F4]/50 p-6 rounded-2xl border border-[#E2E8F0]">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
               <div className="w-16 h-16 bg-[#F2F4F4] rounded-full flex items-center justify-center mx-auto mb-4">
                 <Briefcase className="w-8 h-8 text-[#ACBAC4]" />
               </div>
               <p className="text-[#64748B] font-bold">No listed experience narratives found for this candidate.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedCandidateSkills} 
        onClose={() => setSelectedCandidateSkills(null)} 
        type="default" 
        title={`Professional Skills: ${selectedCandidateSkills?.name}`}
        closeActionLabel=" Close Matrix "
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {selectedCandidateSkills?.fullSkills && selectedCandidateSkills.fullSkills.length > 0 ? (
            selectedCandidateSkills.fullSkills.map((skill, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm tracking-tight text-[#334155]">{skill.name}</h4>
                  <div className="p-2 rounded-xl bg-[#F7B980]/10">
                    <Sparkles className="w-4 h-4 text-[#F7B980]" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                    <span>Expertise Level</span>
                    <span className="text-[#F7B980]">{skill.level}</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#F7B980] rounded-full transition-all duration-1000" 
                      style={{ width: skill.level === 'Expert' ? '100%' : skill.level === 'Advanced' ? '75%' : skill.level === 'Intermediate' ? '50%' : '25%' }} 
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748B]">
                    <Sparkles className="w-3 h-3" />
                    <span>{skill.years || 0} Years of Command</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
               <div className="w-16 h-16 bg-[#F2F4F4] rounded-full flex items-center justify-center mx-auto mb-4">
                 <Sparkles className="w-8 h-8 text-[#ACBAC4]" />
               </div>
               <p className="text-[#64748B] font-bold">No verified professional techniques found.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedCandidateMessage} 
        onClose={() => { setSelectedCandidateMessage(null); setMessageText(""); }} 
        type="default" 
        title={`Connect with ${selectedCandidateMessage?.name}`}
        primaryAction={{ label: isSendingMessage ? "Sending..." : "Initiate Thread", onClick: handleSendMessage }}
      >
        <div className="space-y-4 p-2">
          <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>Message Narrative</label>
          <textarea 
            rows={4} 
            placeholder="Type your professional signal here..." 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full px-8 py-6 bg-white border border-[#E2E8F0] rounded-[24px] font-medium text-base outline-none focus:border-[#F7B980] transition-all resize-none" 
            style={{ color: "#334155" }} 
          />
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedCandidateSchedule || isGeneralScheduleModalOpen} 
        onClose={() => {
          setSelectedCandidateSchedule(null);
          setIsGeneralScheduleModalOpen(false);
          setScheduleError("");
        }} 
        type="default" 
        title={selectedCandidateSchedule ? `Sync with ${selectedCandidateSchedule.name}` : "Propose New Synchronization"}
        primaryAction={{ 
          label: isScheduling ? "Transmitting..." : "Dispatch Invite", 
          onClick: handleScheduleInterview
        }}
      >
        <div className="space-y-6 p-2">
           {scheduleError && (
             <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{scheduleError}</p>
             </div>
           )}
           {isGeneralScheduleModalOpen && (
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Target Candidate</label>
                <select 
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all cursor-pointer" 
                  style={{ color: "#334155" }}
                >
                  <option value="">Select Candidate...</option>
                  {candidates.map(candidate => (
                    <option key={candidate.id} value={candidate.userId}>{candidate.name} — {candidate.title}</option>
                  ))}
                </select>
             </div>
           )}
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Proposed Sync Time</label>
              <input 
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                type="datetime-local" 
                className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all cursor-pointer" 
                style={{ color: "#334155" }} 
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Target Opportunity</label>
              <select 
                value={scheduleJobId}
                onChange={(e) => setScheduleJobId(e.target.value)}
                className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all cursor-pointer" 
                style={{ color: "#334155" }}
              >
                <option value="">Select Opportunity...</option>
                {employerJobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Sync Format</label>
              <select 
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all cursor-pointer" 
                style={{ color: "#334155" }}
              >
                <option value="video">High-Fidelity Video Sync</option>
                <option value="phone">Voice Channel</option>
                <option value="in-person">Physical Rendezvous</option>
              </select>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest pl-2" style={{ color: "#64748B" }}>Strategic Notes</label>
              <textarea 
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                rows={3} 
                placeholder="Additional context for the candidate..." 
                className="w-full px-8 py-4 bg-white border border-[#E2E8F0] rounded-2xl font-medium text-sm outline-none focus:border-[#F7B980] transition-all resize-none" 
                style={{ color: "#334155" }}
              />
           </div>
           <p className="px-2 text-xs font-medium leading-relaxed" style={{ color: "#64748B" }}>The candidate will receive a high-priority notification to confirm the proposed synchronization parameters.</p>
        </div>
      </Modal>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        type="default" 
        title="Exit Workspace"
        primaryAction={{ label: "Sign Out", onClick: handleLogout }}
      >
        <div className="text-center py-4">
          <p className="text-lg font-bold" style={{ color: "#334155" }}>Ready to conclude your session?</p>
          <p className="font-medium mt-2" style={{ color: "#64748B" }}>Your environmental parameters and active pipelines will be preserved.</p>
        </div>
      </Modal>

      <Modal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        type="default" 
        title="Refine Search Parameters"
        primaryAction={{ label: "Update View", onClick: () => setIsFilterModalOpen(false) }}
      >
        <div className="space-y-6 p-2">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>Talent Calibration</label>
              <select className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-2xl font-bold text-sm outline-none focus:border-[#F7B980] transition-all cursor-pointer" style={{ color: "#334155" }}>
                 <option>All Calibrations</option>
                 <option>Tier 1 (4+ Stars)</option>
                 <option>Elite Only (5 Stars)</option>
              </select>
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        type="default" 
        title={`Blueprint Management: ${selectedJob?.title}`}
        primaryAction={{ label: "Update Blueprint", onClick: () => {
           setSelectedJob(null);
           setSuccessMessage({ title: "Blueprint Verified", message: "Your opportunity parameters have been successfully updated." });
        }}}
      >
        <div className="space-y-8 p-2">
           <p className="font-medium" style={{ color: "#ACBAC4" }}>Audit and refine the parameters for this active recruitment pipeline.</p>
           <div className="flex gap-4">
             <button onClick={() => setSelectedJob(null)} className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-100 transition-all cursor-pointer">Deactivate Pipeline</button>
             <button onClick={() => setSelectedJob(null)} className="flex-1 py-4 bg-[#F2F4F4] hover:bg-white text-[#57595B] rounded-2xl font-black text-[10px] uppercase tracking-widest border border-[#F2F4F4] transition-all cursor-pointer">Archive</button>
           </div>
        </div>
      </Modal>

      <div className="h-32 md:hidden" />
    </div>
  );
}

