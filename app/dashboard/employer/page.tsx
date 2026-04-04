"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Settings, LogOut, Bell, Filter, Video, Users, Calendar as CalendarIcon, 
  MapPin, Building2, Briefcase, Search, Mail, Lock, Shield, Sparkles,
  Trash2, ArrowLeft, ArrowRight, Archive, LayoutDashboard, AlertCircle, LayoutGrid, List, X
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

type Tab = "overview" | "candidates" | "jobs" | "interviews" | "messages" | "submitted" | "settings";

interface SubmittedApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDepartment: string;
  jobLocation: string;
  candidateId: string;
  candidateName: string;
  candidateTitle: string;
  candidateAvatar: string | null;
  candidateSkills: string[];
  videoUrl: string | null;
  message: string | null;
  status: string;
  submittedAt: string;
}

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
  const [jobSearch, setJobSearch] = useState("");
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
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
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("");
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);

  // New Scheduling States
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleJobId, setScheduleJobId] = useState("");
  const [scheduleType, setScheduleType] = useState("video");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [isGeneralScheduleModalOpen, setIsGeneralScheduleModalOpen] = useState(false);

  // Submitted Applications States
  const [submittedApplications, setSubmittedApplications] = useState<SubmittedApplication[]>([]);
  const [isLoadingSubmitted, setIsLoadingSubmitted] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<SubmittedApplication | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

    if (activeTab === "candidates" || activeTab === "overview") {
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

  useEffect(() => {
    if (activeTab !== "submitted") return;
    const fetchSubmitted = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setIsLoadingSubmitted(true);
        const res = await fetch("/api/applications/employer", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setSubmittedApplications(data.applications || []);
      } catch (error) {
        console.error("Failed to fetch submitted applications:", error);
      } finally {
        setIsLoadingSubmitted(false);
      }
    };
    fetchSubmitted();
  }, [activeTab]);

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setIsUpdatingStatus(true);
      const res = await fetch("/api/applications/employer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedApplications(prev =>
          prev.map(a => a.id === applicationId ? { ...a, status } : a)
        );
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error("Failed to update application status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const handleSavePrefs = async () => {
    try {
      setIsSavingPrefs(true);
      const token = localStorage.getItem("token");
      await fetch("/api/profile/employer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ prefs })
      });
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordChangeError("");
    if (newPassword !== confirmPassword) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordChangeError("Password must be at least 8 characters.");
      return;
    }
    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordChangeSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordChangeSuccess(false), 4000);
      } else {
        setPasswordChangeError(data.message || "Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordChangeError("An error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
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

      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-12 relative z-10">
        
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
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "#64748B" }}>Account</p>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight" style={{ color: "#334155" }}>Account Settings</h2>
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
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-2xl md:rounded-[32px] shadow-xl flex items-center justify-center shrink-0 border border-[#E2E8F0] relative group">
                 <Building2 className="w-9 h-9 md:w-14 md:h-14" style={{ color: "#F7B980" }} />
                 <div className="absolute inset-0 bg-[#F7B980]/5 rounded-2xl md:rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-center md:text-left space-y-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#64748B" }}>Enterprise Partner</p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight" style={{ color: "#334155" }}>TechNova Solutions</h2>
                </div>
                <p className="text-sm sm:text-base md:text-lg font-bold" style={{ color: "#64748B" }}>Software Development Hub • Global Operations</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#F7B980" }} />
                    <span className="text-xs font-bold" style={{ color: "#334155" }}>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <Users className="w-3.5 h-3.5 shrink-0" style={{ color: "#F7B980" }} />
                    <span className="text-xs font-bold" style={{ color: "#334155" }}>500+ professionals</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 rounded-xl border border-[#E2E8F0] shadow-sm">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" style={{ color: "#F7B980" }} />
                    <span className="text-xs font-bold" style={{ color: "#334155" }}>Active Hiring</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsPostJobModalOpen(true)}
              className="w-full md:w-auto px-7 py-3.5 md:px-10 md:py-5 bg-[#334155] hover:bg-[#454749] text-white rounded-2xl md:rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 md:gap-3 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" /> Post Opportunity
            </button>
          </div>
        )}

        {/* Navigation Tabs - Hidden in Settings and on Mobile */}
        {activeTab !== "settings" && (
          <div className="hidden md:flex gap-4 mb-12 p-2 bg-white/30 backdrop-blur-xl border border-white rounded-[32px] shadow-xl w-full md:w-max overflow-x-auto hide-scrollbar">
            {(["overview", "candidates", "jobs", "interviews", "messages", "submitted", "settings"] as Tab[]).map((tab) => (
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
            { id: "submitted", label: "Submit", icon: Video },
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
              <div className="space-y-8">

                {/* Welcome + Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="border border-white rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(24px)", boxShadow: "0 24px 64px rgba(87,89,91,0.06)" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: "#64748B" }}>
                        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                      <h2 className="text-3xl font-black tracking-tight" style={{ color: "#334155" }}>
                        {employerName ? `Welcome back, ${employerName.split(" ")[0]}.` : "Welcome back."}
                      </h2>
                      <p className="text-sm font-semibold mt-1" style={{ color: "#64748B" }}>
                        Here&apos;s your hiring pipeline at a glance.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsPostJobModalOpen(true)}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-[#334155] hover:bg-[#454749] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Post Opportunity
                      </button>
                      <button
                        onClick={() => setIsGeneralScheduleModalOpen(true)}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-white hover:bg-[#E2E8F0] text-[#334155] rounded-2xl font-black text-[10px] uppercase tracking-widest border border-[#E2E8F0] shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                      >
                        <CalendarIcon className="w-4 h-4" /> Schedule Interview
                      </button>
                      <button
                        onClick={() => setActiveTab("candidates")}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-white hover:bg-[#E2E8F0] text-[#334155] rounded-2xl font-black text-[10px] uppercase tracking-widest border border-[#E2E8F0] shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                      >
                        <Users className="w-4 h-4" /> Browse Talent
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      label: "Active Opportunities",
                      value: employerJobs.length.toString(),
                      sub: employerJobs.reduce((a, j) => a + (j.applicants || 0), 0) > 0
                        ? `${employerJobs.reduce((a, j) => a + (j.applicants || 0), 0)} total applicants`
                        : "No applicants yet",
                      color: "#F7B980",
                      icon: <Briefcase className="w-6 h-6" />,
                      tab: "jobs" as Tab
                    },
                    {
                      label: "Global Talent Pool",
                      value: candidates.length.toString(),
                      sub: recommendations.length > 0
                        ? `${recommendations.reduce((a, r) => a + r.topMatches.length, 0)} AI-matched profiles`
                        : "Candidates available",
                      color: "#64748B",
                      icon: <Users className="w-6 h-6" />,
                      tab: "candidates" as Tab
                    },
                    {
                      label: "Planned Interviews",
                      value: employerInterviews.filter(i => i.status === "scheduled").length.toString(),
                      sub: employerInterviews.filter(i => i.status === "completed").length > 0
                        ? `${employerInterviews.filter(i => i.status === "completed").length} completed`
                        : "None completed yet",
                      color: "#334155",
                      icon: <CalendarIcon className="w-6 h-6" />,
                      tab: "interviews" as Tab
                    }
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (idx + 1) }}
                      onClick={() => setActiveTab(stat.tab)}
                      className="group border border-white rounded-[32px] p-8 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(24px)", boxShadow: "0 16px 48px rgba(87,89,91,0.06)" }}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[20px] flex items-center justify-center shadow-lg border border-[#E2E8F0] transition-transform group-hover:scale-110 shrink-0" style={{ background: "white", color: stat.color }}>
                          {stat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 truncate" style={{ color: "#64748B" }}>{stat.label}</p>
                          <p className="text-4xl font-black tracking-tight leading-none" style={{ color: "#334155" }}>{stat.value}</p>
                          <p className="text-[11px] font-semibold mt-1.5 truncate" style={{ color: "#94A3B8" }}>{stat.sub}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Hiring Pipeline + Upcoming Interviews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Hiring Pipeline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border border-white rounded-[32px] p-8 shadow-xl"
                    style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(24px)", boxShadow: "0 16px 48px rgba(87,89,91,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FFF7ED] rounded-xl border border-[#FED7AA]">
                          <Briefcase className="w-4 h-4 text-[#F7B980]" />
                        </div>
                        <div>
                          <h3 className="text-base font-black tracking-tight" style={{ color: "#334155" }}>Hiring Pipeline</h3>
                          <p className="text-[11px] font-semibold" style={{ color: "#94A3B8" }}>Active job performance</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab("jobs")} className="text-[10px] font-black uppercase tracking-widest text-[#F7B980] hover:text-[#e6a060] transition-colors cursor-pointer">
                        View All →
                      </button>
                    </div>
                    {isLoadingJobs ? (
                      <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-14 bg-[#F1F5F9] rounded-2xl animate-pulse" />)}
                      </div>
                    ) : employerJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="p-3 bg-[#F1F5F9] rounded-2xl mb-3">
                          <Briefcase className="w-6 h-6 text-[#CBD5E1]" />
                        </div>
                        <p className="text-sm font-bold text-[#94A3B8]">No active opportunities</p>
                        <button onClick={() => setIsPostJobModalOpen(true)} className="mt-4 px-5 py-2.5 bg-[#334155] text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-[#454749] transition-all">
                          Post First Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {employerJobs.slice(0, 4).map((job) => (
                          <div key={job.id} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-[#E2E8F0] hover:border-[#F7B980]/40 transition-all">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black truncate" style={{ color: "#334155" }}>{job.title}</p>
                              <p className="text-[11px] font-semibold" style={{ color: "#94A3B8" }}>{job.days}d active</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 ml-4">
                              <div className="text-center">
                                <p className="text-lg font-black leading-none" style={{ color: "#334155" }}>{job.applicants}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>Applied</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-black leading-none" style={{ color: "#64748B" }}>{job.views}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94A3B8" }}>Views</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Upcoming Interviews */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="border border-white rounded-[32px] p-8 shadow-xl"
                    style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(24px)", boxShadow: "0 16px 48px rgba(87,89,91,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                          <CalendarIcon className="w-4 h-4 text-[#4ADE80]" />
                        </div>
                        <div>
                          <h3 className="text-base font-black tracking-tight" style={{ color: "#334155" }}>Upcoming Interviews</h3>
                          <p className="text-[11px] font-semibold" style={{ color: "#94A3B8" }}>Scheduled sessions</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab("interviews")} className="text-[10px] font-black uppercase tracking-widest text-[#F7B980] hover:text-[#e6a060] transition-colors cursor-pointer">
                        View All →
                      </button>
                    </div>
                    {isLoadingInterviews ? (
                      <div className="space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-14 bg-[#F1F5F9] rounded-2xl animate-pulse" />)}
                      </div>
                    ) : employerInterviews.filter(i => i.status === "scheduled").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="p-3 bg-[#F1F5F9] rounded-2xl mb-3">
                          <CalendarIcon className="w-6 h-6 text-[#CBD5E1]" />
                        </div>
                        <p className="text-sm font-bold text-[#94A3B8]">No upcoming interviews</p>
                        <button onClick={() => setIsGeneralScheduleModalOpen(true)} className="mt-4 px-5 py-2.5 bg-[#334155] text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-[#454749] transition-all">
                          Schedule Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {employerInterviews.filter(i => i.status === "scheduled").slice(0, 4).map((interview) => (
                          <div key={interview.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-[#E2E8F0] hover:border-[#4ADE80]/40 transition-all">
                            <div className="w-10 h-10 bg-[#F0FDF4] rounded-xl flex items-center justify-center shrink-0 border border-[#BBF7D0]">
                              <Video className="w-4 h-4 text-[#4ADE80]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black truncate" style={{ color: "#334155" }}>{interview.candidateName}</p>
                              <p className="text-[11px] font-semibold truncate" style={{ color: "#94A3B8" }}>{interview.jobTitle || "General Interview"}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] font-black" style={{ color: "#334155" }}>{interview.date}</p>
                              <p className="text-[10px] font-semibold" style={{ color: "#94A3B8" }}>{interview.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* AI Recommendations Teaser */}
                {recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="border border-amber-100 rounded-[32px] p-8 shadow-xl cursor-pointer group"
                    style={{ background: "rgba(255,247,237,0.7)", backdropFilter: "blur(24px)", boxShadow: "0 16px 48px rgba(247,185,128,0.08)" }}
                    onClick={() => setActiveTab("candidates")}
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 bg-amber-100 rounded-2xl border border-amber-200 shrink-0">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-black tracking-tight" style={{ color: "#334155" }}>AI Talent Intelligence Ready</h3>
                          <p className="text-sm font-semibold truncate" style={{ color: "#64748B" }}>
                            {recommendations.reduce((a, r) => a + r.topMatches.length, 0)} top-matched candidates across {recommendations.length} {recommendations.length === 1 ? "role" : "roles"} — click to explore.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-5 py-2.5 bg-[#334155] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group-hover:bg-[#454749] shrink-0">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                )}

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4 border-b border-[#E2E8F0] pb-6 md:pb-10">
                  <div className="space-y-0.5">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight" style={{ color: "#334155" }}>Opportunity Pipeline</h3>
                    <p className="font-medium text-sm md:text-base" style={{ color: "#64748B" }}>Manage your active roles and track talent resonance.</p>
                  </div>
                  <button
                    onClick={() => setIsPostJobModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Post New Role
                  </button>
                </div>

                {isLoadingJobs ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                    <p className="text-[#64748B] font-bold text-sm tracking-wide">Retrieving your opportunities...</p>
                  </div>
                ) : employerJobs.length > 0 ? (
                  <div className="space-y-8">

                    {/* Aggregate Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Active Roles", value: employerJobs.length },
                        { label: "Total Applicants", value: employerJobs.reduce((a, j) => a + (j.applicants || 0), 0) },
                        { label: "Total Views", value: employerJobs.reduce((a, j) => a + (j.views || 0), 0) },
                      ].map((s) => (
                        <div key={s.label} className="bg-white/60 border border-[#E2E8F0] rounded-2xl p-5 text-center">
                          <p className="text-2xl font-black" style={{ color: "#334155" }}>{s.value}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: "#94A3B8" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <input
                        type="text"
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        placeholder="Search roles by title..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-[#E2E8F0] rounded-2xl text-[#334155] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#F7B980]/10 focus:border-[#F7B980] transition-all"
                      />
                    </div>

                    {/* Job Cards */}
                    {(() => {
                      const filtered = employerJobs.filter(j =>
                        j.title.toLowerCase().includes(jobSearch.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-[#E2E8F0]">
                            <p className="text-[#334155] font-black text-lg mb-1">No roles match &ldquo;{jobSearch}&rdquo;</p>
                            <p className="text-[#94A3B8] text-sm font-semibold">Try a different search term.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="grid gap-4">
                          {filtered.map((job) => (
                            <div
                              key={job.id}
                              className="group bg-white/50 border border-[#E2E8F0] rounded-2xl md:rounded-[28px] p-4 md:p-7 transition-all hover:bg-white hover:border-[#F7B980]/40 hover:shadow-xl"
                            >
                              <div className="flex flex-col gap-4">
                                {/* Top row: Title + badges */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-2 min-w-0">
                                    <h4 className="text-base sm:text-xl font-black group-hover:text-[#F7B980] transition-colors leading-tight" style={{ color: "#334155" }}>
                                      {job.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="px-2.5 py-1 bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Active
                                      </span>
                                      <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#64748B] rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Posted {job.days}d ago
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom row: Metrics + Action */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-4 sm:gap-6">
                                    {/* Applicants */}
                                    <div className="text-center">
                                      <p className="text-xl sm:text-2xl font-black leading-none" style={{ color: "#334155" }}>{job.applicants}</p>
                                      <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: "#94A3B8" }}>Applied</p>
                                    </div>
                                    <div className="w-px h-6 bg-[#E2E8F0]" />
                                    {/* Views */}
                                    <div className="text-center">
                                      <p className="text-xl sm:text-2xl font-black leading-none" style={{ color: "#64748B" }}>{job.views}</p>
                                      <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: "#94A3B8" }}>Views</p>
                                    </div>
                                  </div>
                                  {/* Action */}
                                  <button
                                    onClick={() => setSelectedJob(job)}
                                    className="px-5 py-2.5 sm:px-7 sm:py-3.5 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
                                  >
                                    Manage
                                  </button>
                                </div>
                              </div>

                              {/* Applicant fill bar */}
                              {job.views > 0 && (
                                <div className="mt-5">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#94A3B8" }}>Application Rate</p>
                                    <p className="text-[10px] font-black" style={{ color: "#64748B" }}>
                                      {Math.round((job.applicants / job.views) * 100)}%
                                    </p>
                                  </div>
                                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${Math.min(Math.round((job.applicants / job.views) * 100), 100)}%`,
                                        background: "#F7B980"
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
                    <div className="p-4 bg-[#F1F5F9] rounded-2xl mb-5">
                      <Briefcase className="w-8 h-8 text-[#CBD5E1]" />
                    </div>
                    <p className="text-[#334155] font-black text-xl mb-2">No active opportunities</p>
                    <p className="text-[#64748B] text-sm font-semibold mb-6 max-w-xs">Your pipeline is currently empty. Post a new role to start discovering global talent.</p>
                    <button
                      onClick={() => setIsPostJobModalOpen(true)}
                      className="flex items-center gap-2.5 px-8 py-4 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Post Your First Role
                    </button>
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

            {activeTab === "submitted" && (
              <div className="space-y-4">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur border border-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#F7B980]" />
                      Submitted VidioCVs
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Review candidate video applications for your roles</p>
                  </div>
                  {submittedApplications.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                      {submittedApplications.length} received
                    </span>
                  )}
                </div>

                {/* List */}
                {isLoadingSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/80 border border-white rounded-2xl shadow-sm">
                    <div className="w-8 h-8 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-3" />
                    <p className="text-slate-400 text-sm">Loading applications…</p>
                  </div>
                ) : submittedApplications.length > 0 ? (
                  <div className="space-y-2">
                    {submittedApplications.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApplication(app)}
                        className="group flex items-center gap-3 bg-white/80 backdrop-blur border border-white rounded-2xl px-4 py-3.5 hover:border-[#F7B980]/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                          {app.candidateName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#F7B980] transition-colors">
                                {app.candidateName}
                              </h4>
                              {app.videoUrl && (
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#F7B980]/10 text-[#F7B980] border border-[#F7B980]/20 shrink-0">
                                  Video
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {new Date(app.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-slate-400 truncate">
                              {app.jobTitle}{app.jobLocation ? ` · ${app.jobLocation}` : ""}
                            </p>
                            <ApplicationStatusBadge status={app.status} />
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/80 border border-dashed border-[gainsboro] rounded-2xl">
                    <Video className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No applications yet</p>
                    <p className="text-xs text-slate-400">Candidates will appear here once they submit their VidioCV to your roles.</p>
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
                <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]/60 p-8 space-y-2 shrink-0">
                  <button
                    onClick={() => setActiveTab(previousTab)}
                    className="flex items-center gap-2 mb-8 px-3 text-[#64748B] hover:text-[#334155] font-black text-[10px] uppercase tracking-[0.2em] transition-all group cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                  </button>
                  <div className="mb-4 px-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#94A3B8" }}>Account</p>
                  </div>
                  {[
                    { id: "company",       label: "Company Profile",  icon: Building2, desc: "Name, bio & industry" },
                    { id: "strategy",      label: "Talent Strategy",  icon: Briefcase, desc: "Hiring preferences"   },
                    { id: "security",      label: "Security",         icon: Shield,    desc: "Password & access"    },
                    { id: "privacy",       label: "Privacy",          icon: Lock,      desc: "Visibility & data"    },
                    { id: "notifications", label: "Notifications",    icon: Bell,      desc: "Email & push"         },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsSection(item.id as "company" | "strategy" | "security" | "privacy" | "notifications")}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all cursor-pointer group text-left"
                      style={settingsSection === item.id ? {
                        background: "white",
                        boxShadow: "0 8px 24px rgba(247,185,128,0.12)"
                      } : {}}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${settingsSection === item.id ? "bg-[#F7B980]/10 text-[#F7B980]" : "bg-[#E2E8F0] text-[#64748B] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980]"}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black text-sm leading-tight ${settingsSection === item.id ? "text-[#334155]" : "text-[#64748B] group-hover:text-[#334155]"}`}>{item.label}</p>
                        <p className="text-[10px] font-semibold mt-0.5 truncate" style={{ color: "#94A3B8" }}>{item.desc}</p>
                      </div>
                    </button>
                  ))}

                  <div className="pt-6 mt-4 border-t border-[#E2E8F0] px-3">
                    <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-2.5 text-red-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all group cursor-pointer">
                      <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Sign Out
                    </button>
                  </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 p-10 lg:p-16 overflow-y-auto bg-white/30">
                  <div className="flex lg:hidden mb-8">
                    <button
                      onClick={() => setActiveTab(previousTab)}
                      className="flex items-center gap-2 text-[#64748B] hover:text-[#334155] font-black text-[10px] uppercase tracking-widest transition-all group cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={settingsSection}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="max-w-2xl space-y-10"
                    >

                      {/* ── Company Profile ── */}
                      {settingsSection === "company" && (
                        <div className="space-y-10">
                          <div className="pb-6 border-b border-[#E2E8F0]">
                            <h3 className="text-2xl font-black tracking-tight mb-1" style={{ color: "#334155" }}>Company Profile</h3>
                            <p className="text-sm font-medium" style={{ color: "#64748B" }}>Manage your organization&apos;s public identity on the talent network.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Company Name</label>
                              <input
                                type="text"
                                value={employerName}
                                onChange={(e) => setEmployerName(e.target.value)}
                                placeholder="e.g. TechNova Solutions"
                                className="w-full px-5 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none transition-all font-bold text-sm focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 shadow-sm"
                                style={{ color: "#334155" }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Industry</label>
                              <select
                                value={employerType}
                                onChange={(e) => setEmployerType(e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none transition-all font-bold text-sm focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 shadow-sm appearance-none cursor-pointer"
                                style={{ color: "#334155" }}
                              >
                                <option value="">Select industry...</option>
                                <option value="Software & SaaS">Software & SaaS</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="AI & Machine Learning">AI & Machine Learning</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>Country</label>
                              <input
                                type="text"
                                value={employerCountry}
                                onChange={(e) => setEmployerCountry(e.target.value)}
                                placeholder="e.g. United Kingdom"
                                className="w-full px-5 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none transition-all font-bold text-sm focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 shadow-sm"
                                style={{ color: "#334155" }}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#64748B" }}>About / Bio</label>
                              <textarea
                                rows={4}
                                value={employerBio}
                                onChange={(e) => setEmployerBio(e.target.value)}
                                placeholder="Describe your organization's mission and culture..."
                                className="w-full px-5 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none transition-all font-medium text-sm leading-relaxed focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 shadow-sm resize-none"
                                style={{ color: "#334155" }}
                              />
                            </div>
                            <div className="md:col-span-2 flex items-center justify-end gap-4">
                              {isSavingProfile === false && successMessage && (
                                <p className="text-sm font-bold text-green-500">Changes saved successfully.</p>
                              )}
                              <button
                                onClick={handleSaveEmployerProfile}
                                disabled={isSavingProfile}
                                className="px-8 py-3.5 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                {isSavingProfile ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Talent Strategy ── */}
                      {settingsSection === "strategy" && (
                        <div className="space-y-10">
                          <div className="pb-6 border-b border-[#E2E8F0]">
                            <h3 className="text-2xl font-black tracking-tight mb-1" style={{ color: "#334155" }}>Talent Strategy</h3>
                            <p className="text-sm font-medium" style={{ color: "#64748B" }}>Configure your hiring preferences and workplace culture signals.</p>
                          </div>

                          <div className="space-y-4">
                            {[
                              { key: "hiringActive",      label: "Hiring Active",      desc: "Signal that your pipeline is currently open for applications." },
                              { key: "remoteFriendly",    label: "Remote Friendly",    desc: "Show candidates your company supports distributed work." },
                              { key: "relocationSupport", label: "Relocation Support", desc: "Offer relocation assistance for candidates who need to move." },
                            ].map(({ key, label, desc }) => (
                              <div key={key} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex items-center justify-between shadow-sm">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-sm" style={{ color: "#334155" }}>{label}</p>
                                  <p className="text-xs font-medium" style={{ color: "#64748B" }}>{desc}</p>
                                </div>
                                <Toggle
                                  enabled={prefs[key as keyof typeof prefs]}
                                  setEnabled={(val) => setPrefs({ ...prefs, [key]: val })}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-end gap-4">
                            {prefsSuccess && <p className="text-sm font-bold text-green-500">Preferences saved.</p>}
                            <button
                              onClick={handleSavePrefs}
                              disabled={isSavingPrefs}
                              className="px-8 py-3.5 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {isSavingPrefs ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── Security ── */}
                      {settingsSection === "security" && (
                        <div className="space-y-10">
                          <div className="pb-6 border-b border-[#E2E8F0]">
                            <h3 className="text-2xl font-black tracking-tight mb-1" style={{ color: "#334155" }}>Security</h3>
                            <p className="text-sm font-medium" style={{ color: "#64748B" }}>Update your password to keep your account secure.</p>
                          </div>

                          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                                <Lock className="w-5 h-5 text-[#64748B]" />
                              </div>
                              <div>
                                <p className="font-black text-sm" style={{ color: "#334155" }}>Change Password</p>
                                <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>Update your password periodically for best security.</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>Current Password</label>
                                <input
                                  type="password"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  placeholder="Enter current password"
                                  className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none text-sm font-bold focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 transition-all"
                                  style={{ color: "#334155" }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>New Password</label>
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="At least 8 characters"
                                  className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none text-sm font-bold focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 transition-all"
                                  style={{ color: "#334155" }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>Confirm New Password</label>
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Repeat new password"
                                  className="w-full px-5 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none text-sm font-bold focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/10 transition-all"
                                  style={{ color: "#334155" }}
                                />
                              </div>
                            </div>

                            {passwordChangeError && (
                              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <p className="text-xs font-bold text-red-500">{passwordChangeError}</p>
                              </div>
                            )}
                            {passwordChangeSuccess && (
                              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                                <p className="text-xs font-bold text-green-600">Password updated successfully.</p>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                                className="px-8 py-3.5 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                              >
                                {isChangingPassword ? "Updating..." : "Update Password"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Privacy ── */}
                      {settingsSection === "privacy" && (
                        <div className="space-y-10">
                          <div className="pb-6 border-b border-[#E2E8F0]">
                            <h3 className="text-2xl font-black tracking-tight mb-1" style={{ color: "#334155" }}>Privacy</h3>
                            <p className="text-sm font-medium" style={{ color: "#64748B" }}>Control your company&apos;s visibility and manage your data.</p>
                          </div>

                          <div className="space-y-5">
                            {/* Public Profile Toggle */}
                            <div className="bg-[#334155] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-2 max-w-sm">
                                  <p className="font-black text-base">Public Company Profile</p>
                                  <p className="text-white/60 text-sm font-medium leading-relaxed">When enabled, your company is visible to candidates searching the talent network.</p>
                                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 w-fit">
                                    <Shield className="w-3.5 h-3.5 text-[#F7B980]" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Protected by privacy controls</p>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <Toggle
                                    enabled={prefs.publicProfile}
                                    setEnabled={(val) => setPrefs({ ...prefs, publicProfile: val })}
                                    dark
                                  />
                                </div>
                              </div>
                              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7B980]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            </div>

                            {/* Danger Zone */}
                            <div className="rounded-2xl border-2 border-dashed border-red-100 bg-red-50/30 p-6">
                              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">Danger Zone</p>
                              <div className="flex items-start justify-between gap-6">
                                <div className="flex items-start gap-4">
                                  <div className="p-2.5 rounded-xl bg-red-100 text-red-400 shrink-0 mt-0.5">
                                    <Trash2 className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-black text-sm" style={{ color: "#334155" }}>Delete All Job Data</p>
                                    <p className="text-xs font-medium mt-0.5" style={{ color: "#64748B" }}>Permanently deletes all your job postings and applicant data. This cannot be undone.</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setIsWipeConfirmOpen(true)}
                                  className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-400 border border-red-200 hover:bg-red-100 transition-all cursor-pointer shrink-0"
                                >
                                  Delete Data
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Notifications ── */}
                      {settingsSection === "notifications" && (
                        <div className="space-y-10">
                          <div className="pb-6 border-b border-[#E2E8F0]">
                            <h3 className="text-2xl font-black tracking-tight mb-1" style={{ color: "#334155" }}>Notifications</h3>
                            <p className="text-sm font-medium" style={{ color: "#64748B" }}>Choose how you want to be notified about talent activity.</p>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex items-center gap-5 shadow-sm">
                              <div className="p-3 rounded-xl bg-[#F1F5F9] text-[#64748B] shrink-0">
                                <Mail className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-sm" style={{ color: "#334155" }}>Email Notifications</p>
                                <p className="text-xs font-medium" style={{ color: "#64748B" }}>Candidate updates, interview reminders, and weekly digests.</p>
                              </div>
                              <Toggle enabled={prefs.emailAlerts} setEnabled={(val) => setPrefs({ ...prefs, emailAlerts: val })} />
                            </div>

                            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex items-center gap-5 shadow-sm">
                              <div className="p-3 rounded-xl bg-[#F1F5F9] text-[#64748B] shrink-0">
                                <Bell className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-sm" style={{ color: "#334155" }}>Browser Push Notifications</p>
                                <p className="text-xs font-medium" style={{ color: "#64748B" }}>Instant alerts when candidates apply or message you.</p>
                              </div>
                              <Toggle enabled={prefs.browserAlerts} setEnabled={(val) => setPrefs({ ...prefs, browserAlerts: val })} />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-4">
                            {prefsSuccess && <p className="text-sm font-bold text-green-500">Preferences saved.</p>}
                            <button
                              onClick={handleSavePrefs}
                              disabled={isSavingPrefs}
                              className="px-8 py-3.5 bg-[#334155] hover:bg-[#454749] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {isSavingPrefs ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Wipe Confirmation Modal */}
            <AnimatePresence>
              {isWipeConfirmOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6"
                  style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
                  onClick={() => setIsWipeConfirmOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black" style={{ color: "#334155" }}>Delete All Job Data?</h3>
                        <p className="text-xs font-semibold" style={{ color: "#94A3B8" }}>This action is permanent and cannot be undone.</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-8 leading-relaxed" style={{ color: "#64748B" }}>
                      This will permanently delete all your job postings, applicant records, and associated data from the platform. Your account will remain active.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsWipeConfirmOpen(false)}
                        className="flex-1 px-6 py-3.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsWipeConfirmOpen(false)}
                        className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        Yes, Delete All
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>            {activeTab === "messages" && (
              <div className="space-y-8">
                 <div
                    className="border border-white rounded-2xl md:rounded-[40px] p-4 sm:p-8 lg:p-12 shadow-2xl relative"
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(24px)",
                      boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                    }}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4 border-b border-[#E2E8F0] pb-6 md:pb-10">
                      <div className="space-y-0.5">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight" style={{ color: "#334155" }}>Recruiter Workspace</h3>
                        <p className="font-medium text-sm md:text-base" style={{ color: "#64748B" }}>Manage your direct talent communications and inquiries.</p>
                      </div>
                      <div className="flex w-full sm:w-auto p-1 bg-[#E2E8F0] rounded-2xl">
                        {(["inbox", "sent", "compose"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setMessageSubTab(tab)}
                            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
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
                                className="p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[32px] border transition-all cursor-pointer group flex items-center gap-3 sm:gap-6"
                                style={thread.status === "pending" ? {
                                  background: "#FFFFFF",
                                  borderColor: "#F7B980",
                                  boxShadow: "0 12px 32px rgba(247,185,128,0.08)"
                                } : {
                                  background: "rgba(255,255,255,0.4)",
                                  borderColor: "#E2E8F0"
                                }}
                              >
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-xl shrink-0 shadow-inner" style={{ background: "#E2E8F0", color: "#F7B980" }}>
                                  {thread.candidateName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <h4 className="font-black text-sm sm:text-base md:text-lg transition-colors group-hover:text-[#F7B980] flex items-center gap-2 truncate" style={{ color: "#334155" }}>
                                      {thread.candidateName}
                                      {thread.status === "pending" && <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] shrink-0" />}
                                    </h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 shrink-0">
                                      {new Date(thread.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs sm:text-sm font-bold opacity-60 truncate" style={{ color: "#64748B" }}>{thread.candidateTitle}</p>
                                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center group-hover:bg-[#F7B980] group-hover:text-white transition-all group-hover:translate-x-0.5 shrink-0">
                                      <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                                    </div>
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
                                className="p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[32px] border bg-white/40 border-[#E2E8F0] transition-all hover:bg-white hover:shadow-xl group"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#334155] text-white flex items-center justify-center font-bold shadow-lg shrink-0">
                                    {msg.receiver.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="font-bold text-sm sm:text-base text-[#334155] truncate">{msg.receiver.name}</h4>
                                      <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 shrink-0">
                                        {new Date(msg.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                                      </p>
                                    </div>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{msg.receiver.email}</p>
                                  </div>
                                </div>
                                <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-60 italic pl-0 sm:pl-12 md:pl-14" style={{ color: "#334155" }}>&quot;{msg.body}&quot;</p>
                                <div className="mt-3 flex items-center gap-2 pl-0 sm:pl-12 md:pl-14">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#10B981]">Sent</p>
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
                      <div className="max-w-3xl mx-auto space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-2 relative">
                              <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: "#64748B" }}>Target Candidate</label>
                              {/* Search input */}
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                  type="text"
                                  value={candidateSearchQuery || (selectedRecipientId ? (candidates.find(c => c.userId === selectedRecipientId)?.name || "") : "")}
                                  onChange={(e) => { setCandidateSearchQuery(e.target.value); setSelectedRecipientId(""); setShowCandidateDropdown(true); }}
                                  onFocus={() => setShowCandidateDropdown(true)}
                                  onBlur={() => setTimeout(() => setShowCandidateDropdown(false), 150)}
                                  placeholder="Search candidates..."
                                  className="w-full pl-9 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-2xl outline-none text-sm font-bold focus:border-[#F7B980] transition-all shadow-sm"
                                  style={{ color: "#334155" }}
                                />
                                {selectedRecipientId && (
                                  <button
                                    onClick={() => { setSelectedRecipientId(""); setCandidateSearchQuery(""); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              {/* Dropdown list */}
                              {showCandidateDropdown && (
                                <div className="absolute z-30 w-full mt-1 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden">
                                  <div className="max-h-52 overflow-y-auto divide-y divide-[#F1F5F9]">
                                    {candidates
                                      .filter(c => !candidateSearchQuery || c.name.toLowerCase().includes(candidateSearchQuery.toLowerCase()) || c.title.toLowerCase().includes(candidateSearchQuery.toLowerCase()))
                                      .slice(0, 8)
                                      .map(candidate => (
                                        <button
                                          key={candidate.id}
                                          onMouseDown={() => { setSelectedRecipientId(candidate.userId); setCandidateSearchQuery(""); setShowCandidateDropdown(false); }}
                                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7B980]/10 transition-colors text-left cursor-pointer"
                                        >
                                          <div className="w-8 h-8 rounded-xl bg-[#E2E8F0] flex items-center justify-center font-black text-sm shrink-0" style={{ color: "#F7B980" }}>
                                            {candidate.name.charAt(0)}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-bold text-[#334155] truncate">{candidate.name}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{candidate.title}</p>
                                          </div>
                                        </button>
                                      ))}
                                    {candidates.filter(c => !candidateSearchQuery || c.name.toLowerCase().includes(candidateSearchQuery.toLowerCase()) || c.title.toLowerCase().includes(candidateSearchQuery.toLowerCase())).length === 0 && (
                                      <p className="px-4 py-3 text-sm text-slate-400 text-center">No candidates found</p>
                                    )}
                                  </div>
                                </div>
                              )}
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: "#64748B" }}>Inquiry Subject</label>
                              <input
                                type="text"
                                value={composeSubject}
                                onChange={(e) => setComposeSubject(e.target.value)}
                                placeholder="Corporate Inquiry"
                                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-2xl outline-none font-bold text-sm focus:border-[#F7B980] transition-all shadow-sm"
                                style={{ color: "#334155" }}
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: "#64748B" }}>Message</label>
                           <textarea
                             rows={5}
                             value={composeBody}
                             onChange={(e) => setComposeBody(e.target.value)}
                             placeholder="Draft your professional outreach..."
                             className="w-full px-5 py-4 bg-white border border-[#E2E8F0] rounded-2xl outline-none font-medium text-sm leading-relaxed focus:border-[#F7B980] shadow-sm resize-none"
                             style={{ color: "#334155" }}
                           />
                        </div>
                        <button
                          onClick={handleSendComposeDirect}
                          disabled={!selectedRecipientId || !composeBody.trim() || isSendingDirect}
                          className="w-full py-3.5 bg-[#334155] hover:bg-[#454749] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group flex items-center justify-center gap-3"
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

      {/* Submitted Application Detail Modal */}
      <Modal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        type="info"
        closeActionLabel="Close"
        maxWidth="max-w-xl"
        align="left"
      >
        {selectedApplication && (
          <div className="space-y-5 -mt-2">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0]">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm shrink-0"
                style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "white" }}
              >
                {selectedApplication.candidateName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black leading-tight truncate" style={{ color: "#334155" }}>{selectedApplication.candidateName}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{selectedApplication.candidateTitle || "Candidate"}</p>
              </div>
              <ApplicationStatusBadge status={selectedApplication.status} />
            </div>

            {/* Job info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-[gainsboro] rounded-xl px-4 py-3 col-span-2 sm:col-span-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Applied For</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{selectedApplication.jobTitle}</p>
              </div>
              <div className="bg-slate-50 border border-[gainsboro] rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                <p className="text-sm font-semibold text-slate-800">
                  {new Date(selectedApplication.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Skills */}
            {selectedApplication.candidateSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.candidateSkills.slice(0, 8).map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-[gainsboro]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {selectedApplication.videoUrl && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">VidioCV</p>
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-900">
                  <VideoPlayer src={selectedApplication.videoUrl} title={selectedApplication.candidateName} />
                </div>
              </div>
            )}

            {/* Cover note */}
            {selectedApplication.message && (
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Cover Note</p>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedApplication.message}</p>
              </div>
            )}

            {/* Status actions */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {(["submitted", "reviewing", "shortlisted", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateApplicationStatus(selectedApplication.id, s)}
                    disabled={isUpdatingStatus || selectedApplication.status === s}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                      selectedApplication.status === s
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-[gainsboro] hover:border-slate-400"
                    } disabled:opacity-50`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="h-32 md:hidden" />
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles =
    s.includes("shortlist") || s.includes("offer")
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : s.includes("review") || s.includes("screen")
      ? "bg-amber-50 text-amber-600 border-amber-100"
      : s.includes("reject") || s.includes("declined")
      ? "bg-rose-50 text-rose-500 border-rose-100"
      : "bg-slate-50 text-slate-500 border-slate-100";
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 capitalize ${styles}`}>
      {status}
    </span>
  );
}

