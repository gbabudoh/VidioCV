"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, LogOut, Bell, Search, MapPin, Briefcase, Video, 
  Building2, UserCircle, Shield, Trash2, 
  Mail, Lock, Plus, X, ChevronRight, Link as LinkIcon,
  Calendar as CalendarIcon, Archive, ArrowLeft, Calendar, CheckCircle2
} from "lucide-react";
import MobileBottomNav from "@/app/components/common/MobileBottomNav";

// Helper components
const PlayIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    className={className} 
    style={style}
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5V19L19 12L8 5Z" />
  </svg>
);
import Select, { OptionProps, SingleValueProps, SingleValue } from "react-select";
import ReactCountryFlag from "react-country-flag";
import countryList from "country-list";
import Button from "@/app/components/common/Button";
import VideoCreator from "@/app/components/video-tools/VideoCreator";
import LiveKitPlayer from "@/app/components/video-tools/LiveKitPlayer";
import Modal from "@/app/components/common/Modal";
import Toggle from "@/app/components/common/Toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { useSessionSync } from "@/app/lib/hooks/useSessionSync";

type Tab = "profile" | "jobs" | "applications" | "interviews" | "messages" | "notifications" | "settings";

const countryOptions = countryList.getData().map((country) => ({
  value: country.code,
  label: country.name,
}));

export default function CandidateDashboard() {
  const router = useRouter();
  useSessionSync();
  
  // Define Experience Interface
  interface Experience {
    id: string;
    role: string;
    company: string;
    duration: string;
  }

  // Define Job Interface
  interface Job {
    id: string;
    title: string;
    company: string;
    countryCode: string;
    location: string;
    type: string;
    salary: string;
    description: string;
  }

  // Define Message Interface
  interface Message {
    id: string;
    company: string;
    sender: string;
    email?: string;
    subject: string;
    preview: string;
    body: string;
    time: string;
    unread: boolean;
    replied: boolean;
    replyMessage?: string;
    type?: "inquiry" | "direct";
  }

  // Define Application Interface
  interface Application {
    id: string;
    title: string;
    company: string;
    status: string;
    date: string;
    description: string;
    color: string;
    timeline: { date: string; event: string }[];
  }

  interface MessageRequest {
    id: string;
    requesterCompany?: string | null;
    requesterName?: string | null;
    requesterEmail: string;
    message: string;
    createdAt: string | Date;
    status: string;
    replyMessage?: string | null;
    type?: "inquiry" | "direct";
  }

  interface Interview {
    id: string;
    company: string;
    jobTitle: string;
    date: string;
    time: string;
    type: string;
    status: string;
    notes? : string;
  }

  interface DirectMessage {
    id: string;
    senderId: string;
    receiverId: string;
    subject?: string | null;
    body: string;
    createdAt: string;
    status: string;
    receiver: { name: string; email: string };
    sender: { name: string; email: string };
  }

  interface Employer {
    id: string;
    name: string;
    email: string;
  }

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showVideoCreator, setShowVideoCreator] = useState(false);
  const [settingsSection, setSettingsSection] = useState<"general" | "career" | "security" | "privacy" | "notifications">("general");

  interface UserPreferences {
    emailAlerts: boolean;
    browserAlerts: boolean;
    jobInvites: boolean;
    videoPublic: boolean;
    remoteOnly: boolean;
    openToRelocate: boolean;
    expectedSalary: number;
  }

  // Detailed Settings States
  const [prefs, setPrefs] = useState<UserPreferences>({
    emailAlerts: true,
    browserAlerts: true,
    jobInvites: true,
    videoPublic: true,
    remoteOnly: false,
    openToRelocate: true,
    expectedSalary: 150000
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string } | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applications] = useState<Application[]>([
    { 
      id: "1", 
      title: "Senior Backend Engineer", 
      company: "DataFlow", 
      status: "Under Review", 
      date: "Applied 2 days ago", 
      description: "Leading the migration of core data pipelines to Go and optimizing high-concurrency microservices.",
      color: "text-[#F7B980] bg-[#F7B980]/10 border-[#F7B980]/20",
      timeline: [
        { date: "Oct 24", event: "Application Received" },
        { date: "Oct 25", event: "Initial Technical Scan" },
        { date: "Oct 26", event: "Moved to Senior Review" }
      ]
    },
    { 
      id: "2", 
      title: "Full Stack Developer", 
      company: "FinTech Pro", 
      status: "Shortlisted", 
      date: "Applied 1 week ago", 
      description: "Developing secure financial dashboard components using React and encrypted Node.js backends.",
      color: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
      timeline: [
        { date: "Oct 18", event: "Application Transmitted" },
        { date: "Oct 20", event: "Profile Verified" },
        { date: "Oct 22", event: "Marked as Shortlisted" }
      ]
    }
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Direct Messaging Strategy
  const [messageSubTab, setMessageSubTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [sentMessages, setSentMessages] = useState<DirectMessage[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(false);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    profileViews: 0,
    activeApplications: 0,
    interviewInvites: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/candidates/dashboard/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setDashboardStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoadingMessages(true);
        const response = await fetch("/api/messages/received", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.messages) {
          const formattedMessages = data.messages.map((req: MessageRequest) => ({
            id: req.id,
            company: req.requesterCompany || "Direct Message",
            sender: req.requesterName || "Recruiter",
            email: req.requesterEmail,
            subject: req.type === "direct" ? "Direct Communication" : `New Inquiry from ${req.requesterCompany || "Employer"}`,
            preview: req.message.substring(0, 50) + "...",
            body: req.message,
            time: new Date(req.createdAt).toLocaleDateString(),
            unread: req.status === "pending",
            replied: req.status === "replied",
            replyMessage: req.replyMessage || undefined,
            type: req.type || "inquiry"
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    if (activeTab === "messages") {
      fetchMessages();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchSentMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setIsLoadingSent(true);
        const response = await fetch("/api/messages/direct?type=sent", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setSentMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to fetch sent messages:", error);
      } finally {
        setIsLoadingSent(false);
      }
    };

    const fetchEmployers = async () => {
      try {
        const response = await fetch("/api/employers", {
           headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        if (data.success) {
          setEmployers(data.employers || []);
        }
      } catch (error) {
        console.error("Failed to fetch employers:", error);
      }
    };

    if (activeTab === "messages") {
      if (messageSubTab === "sent") fetchSentMessages();
      if (messageSubTab === "compose") fetchEmployers();
    }
  }, [activeTab, messageSubTab]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoadingInterviews(true);
        const response = await fetch("/api/interview/candidate", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.interviews) {
          setInterviews(data.interviews);
        }
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    if (activeTab === "interviews") {
      fetchInterviews();
    }
  }, [activeTab]);
  
  // Skills State
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Python", "TailwindCSS"]);
  const [newSkill, setNewSkill] = useState("");
  const [userName, setUserName] = useState("John Doe");
  const [userRole, setUserRole] = useState("Senior Software Engineer");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/profile/get", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          if (data.cvProfile?.videoUrl) {
            setActiveVideoUrl(data.cvProfile.videoUrl);
          }
          if (data.user) {
            setUserName(data.user.name);
            if (data.user.profile?.fullName) setUserName(data.user.profile.fullName);
          }
          if (data.cvProfile?.title) {
            setUserRole(data.cvProfile.title);
          }
          if (data.cvProfile?.skills) {
            const fetchedSkills = data.cvProfile.skills.map((s: { skill: { name: string } }) => s.skill.name);
            if (fetchedSkills.length > 0) setSkills(fetchedSkills);
          }
          if (data.cvProfile?.workExperiences) {
            // Map work experiences if needed
            // setExperiences(data.cvProfile.workExperiences);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setIsSendingReply(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          replyMessage: replyText,
          type: selectedMessage.type
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage({
          title: "Reply Transmitted",
          message: "Your response has been securely routed back to the employer's dashboard."
        });
        setSelectedMessage(null);
        setIsReplying(false);
        setReplyText("");
        // Refresh messages
        const response2 = await fetch("/api/messages/received", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data2 = await response2.json();
        if (data2.success && data2.messages) {
          const formattedMessages = data2.messages.map((req: MessageRequest) => ({
            id: req.id,
            company: req.requesterCompany || "Direct Message",
            sender: req.requesterName || "Recruiter",
            email: req.requesterEmail,
            subject: req.type === "direct" ? "Direct Communication" : `New Inquiry from ${req.requesterCompany || "Employer"}`,
            preview: req.message.substring(0, 50) + "...",
            body: req.message,
            time: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Incoming",
            unread: req.status === "pending",
            replied: req.status === "replied",
            replyMessage: req.replyMessage || undefined,
            type: req.type || "inquiry"
          }));
          setMessages(formattedMessages);
        }
      } else {
        setModalConfig({
          isOpen: true,
          title: "Transmission Failed",
          message: data.message || "Unable to send reply at this time.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Reply error:", error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSendCompose = async () => {
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
          body: composeBody
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage({
          title: "Signal Dispatched",
          message: "Your direct communication has been successfully routed to the employer's headquarters."
        });
        setComposeSubject("");
        setComposeBody("");
        setSelectedRecipientId("");
        setMessageSubTab("sent");
      }
    } catch (error) {
      console.error("Direct message error:", error);
    } finally {
      setIsSendingDirect(false);
    }
  };

  const handleManageMessage = async (action: "archive" | "delete") => {
    if (!selectedMessage) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/messages/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messageId: selectedMessage.id,
          action
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedMessage(null);
        setSuccessMessage({
          title: action === "delete" ? "Draft Vanished" : "Inbox Organized",
          message: action === "delete" ? "The correspondence has been permanently deleted." : "Message has been safely archived away from your main feed."
        });
        
        // Refresh messages
        const response = await fetch("/api/messages/received", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const d = await response.json();
        if (d.success && d.messages) {
          const formattedMessages = d.messages.map((req: MessageRequest) => ({
            id: req.id,
            company: req.requesterCompany || "Unknown Company",
            sender: req.requesterName || "Recruiter",
            email: req.requesterEmail,
            subject: `New Inquiry from ${req.requesterCompany || "Employer"}`,
            preview: req.message.substring(0, 50) + "...",
            body: req.message,
            time: new Date(req.createdAt).toLocaleDateString(),
            unread: req.status === "pending",
            replied: req.status === "replied",
            replyMessage: req.replyMessage || undefined,
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (err) {
      console.error("Failed to manage message:", err);
    }
  };

  const syncProfile = async (skillsToSync: string[], experiencesToSync: Experience[], titleToSync: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/profile/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: titleToSync,
          skills: skillsToSync,
          experiences: experiencesToSync
        })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Profile sync failed:", error);
      return false;
    }
  };

  const handleAddSkill = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e.type === 'click' || (e as React.KeyboardEvent).key === 'Enter') && newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill("");
      // Real-time synchronization
      await syncProfile(updatedSkills, experiences, userRole);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills);
    // Real-time synchronization
    await syncProfile(updatedSkills, experiences, userRole);
  };

  // Experience State
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState({ role: "", company: "", duration: "" });

  const handleAddExperience = async () => {
    if (newExperience.role.trim() && newExperience.company.trim()) {
      const updatedExperiences = [...experiences, { ...newExperience, id: Date.now().toString() }];
      setExperiences(updatedExperiences);
      setNewExperience({ role: "", company: "", duration: "" });
      // Real-time synchronization
      await syncProfile(skills, updatedExperiences, userRole);
    }
  };

  const handleRemoveExperience = async (idToRemove: string) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== idToRemove);
    setExperiences(updatedExperiences);
    // Real-time synchronization
    await syncProfile(skills, updatedExperiences, userRole);
  };

  const handleSyncGlobal = async () => {
    const result = await syncProfile(skills, experiences, userRole);
    if (result) {
      setSuccessMessage({ 
        title: "Workspace Synchronized", 
        message: "All professional milestones and expertise narratives have been successfully localized to the global talent headquarters." 
      });
    } else {
      setModalConfig({
        isOpen: true,
        title: "Synchronization Interrupted",
        message: "We encountered a temporary protocol error while syncing your profile to the network. Please attempt a localized sync again.",
        type: "error"
      });
    }
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await fetch("/api/job/all");
        const data = await response.json();
        
        if (data.success && data.jobs) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesCountry = selectedCountry ? job.countryCode === selectedCountry.value : true;
    const matchesQuery = (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                         (job.company?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesCountry && matchesQuery;
  });

  const handleApply = (jobId: string) => {
    setSelectedJob(null);
    setSuccessMessage({
      title: "Application Successful!",
      message: `Successfully submitted Video CV for Job ID: ${jobId}`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <div 
      className="min-h-screen font-sans relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #E2E8F0 0%, #F9F9F9 45%, #F9F5F1 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full blur-[140px]"
          style={{ background: "rgba(247,185,128,0.15)" }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[130px]"
          style={{ background: "rgba(172,186,196,0.18)" }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(87,89,91,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Header */}
      <nav 
        className="sticky top-0 z-50 backdrop-blur-2xl transition-all duration-300"
        style={{ 
          background: "rgba(253,252,250,0.92)", 
          borderBottom: "1px solid #E0E4E3",
          boxShadow: "0 2px 16px rgba(87,89,91,0.04)"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex justify-between items-center relative gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group shrink-0">
               <NextImage 
                 src="/logo.png" 
                 alt="VidioCV Logo" 
                 width={100}
                 height={32}
                 className="object-contain md:w-[120px] md:h-[38px]"
                 priority
               />
            </Link>
            
            {/* Back Context for Mobile */}
            {activeTab !== "profile" && (
              <div className="md:hidden flex items-center">
                 <button 
                   onClick={() => setActiveTab("profile")}
                   className="flex items-center gap-2 text-[#64748B] font-bold text-xs uppercase tracking-widest"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Back
                 </button>
              </div>
            )}
          </div>

          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span 
                className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border shadow-sm"
                style={{ 
                  background: "rgba(255,255,255,0.8)", 
                  borderColor: "#E0E4E3", 
                  color: "#64748B" 
                }}
              >
                  Candidate Hub
              </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setActiveTab("notifications")} 
              className="p-2 md:p-2.5 rounded-xl transition-all hover:bg-[#E2E8F0] group cursor-pointer"
              style={{ color: "#64748B" }}
            >
              <Bell className="w-5 h-5 group-hover:text-[#334155] transition-colors" />
            </button>
            <button 
              onClick={() => setActiveTab("settings")} 
              className="p-2 md:p-2.5 rounded-xl transition-all hover:bg-[#E2E8F0] group cursor-pointer"
              style={{ color: "#64748B" }}
            >
              <Settings className="w-5 h-5 group-hover:text-[#334155] transition-colors" />
            </button>
            <div className="hidden md:block h-6 w-px bg-[#E0E4E3] mx-1" />
            <button 
              onClick={() => setIsLogoutModalOpen(true)} 
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all font-semibold text-xs md:text-sm cursor-pointer"
              style={{ 
                background: "#FFFFFF", 
                border: "1px solid #E0E4E3", 
                color: "#EF4444",
                boxShadow: "0 2px 8px rgba(239,68,68,0.05)"
              }}
            >
              <LogOut className="w-4 h-4" /> 
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10 font-sans">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="overview-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 border border-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center group"
            style={{ 
              background: "rgba(255, 255, 255, 0.82)", 
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px rgba(87,89,91,0.08)"
            }}
          >
            <div className="relative w-28 h-28 mb-6 p-1.5 rounded-full" style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)" }}>
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-extrabold" style={{ color: "#F7B980" }}>
                  {userName.split(" ").map(n => n[0]).join("")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent group-hover:translate-x-full duration-700 transition-transform" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#334155" }}>{userName}</h2>
            <p className="font-semibold text-sm mb-6 px-4 py-1 rounded-full" style={{ background: "#E2E8F0", color: "#64748B" }}>{userRole}</p>
            <div className="w-full space-y-4 text-sm text-left px-2">
              <div className="flex items-center gap-4 py-3 border-b border-[#E2E8F0]">
                <div className="p-2 rounded-xl" style={{ background: "rgba(172,186,196,0.1)" }}>
                  <MapPin className="w-4 h-4" style={{ color: "#64748B" }} />
                </div>
                <span className="font-medium" style={{ color: "#8A8C8E" }}>Global / Remote</span>
              </div>
              <div className="flex items-center gap-4 py-3">
                <div className="p-2 rounded-xl" style={{ background: "rgba(172,186,196,0.1)" }}>
                  <Briefcase className="w-4 h-4" style={{ color: "#64748B" }} />
                </div>
                <span className="font-medium" style={{ color: "#8A8C8E" }}>5+ years experience</span>
              </div>
            </div>
          </motion.div>

          {/* KPI Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Profile Views", value: dashboardStats.profileViews.toString(), color: "from-[#8A8C8E] to-[#64748B]" },
              { label: "Active Applications", value: dashboardStats.activeApplications.toString(), color: "from-[#F7B980] to-[#F0A060]" },
              { label: "Interview Invites", value: dashboardStats.interviewInvites.toString(), color: "from-[#334155] to-[#8A8C8E]" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * (idx + 1), duration: 0.4 }}
                className="border border-white rounded-[32px] p-8 shadow-xl flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-all"
                style={{ 
                  background: "rgba(255, 255, 255, 0.75)", 
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 16px 40px rgba(87,89,91,0.06)"
                }}
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full blur-2xl`} />
                <p className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "#64748B" }}>{stat.label}</p>
                <p className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.color} tracking-tighter`}>
                  {stat.value}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold" style={{ color: "#10B981" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Live Sync
                </div>
              </motion.div>
            ))}
          </div>
          </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-3 text-sm font-bold mb-3" style={{ color: "#64748B" }}>
                  <button onClick={() => setActiveTab("profile")} className="hover:text-[#F7B980] transition-colors cursor-pointer">Dashboard</button>
                  <ChevronRight className="w-4 h-4" />
                  <span style={{ color: "#334155" }}>Workspace Settings</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight" style={{ color: "#334155" }}>Account Workspace</h1>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setActiveTab("profile")} className="px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all hover:bg-[#E2E8F0] cursor-pointer" style={{ borderColor: "#E0E4E3", color: "#8A8C8E" }}>
                   Discard Changes
                 </button>
                 <Button onClick={handleSyncGlobal} size="lg" className="px-10 shadow-lg shadow-[#F7B980]/20">
                   Sync Global Portfolio
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== "settings" && (
          <>
            <div className="hidden md:flex gap-2 mb-10 p-1.5 rounded-2xl max-w-fit overflow-x-auto border border-white shadow-lg" style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)" }}>
              {(["profile", "jobs", "applications", "interviews", "messages", "settings"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-8 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer whitespace-nowrap"
                  style={activeTab === tab ? {
                    background: "#334155",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 20px rgba(87,89,91,0.2)"
                  } : {
                    color: "#64748B"
                  }}
                >
                  {tab === "jobs" ? "Global Search" : tab}
                </button>
              ))}
            </div>

          </>
        )}

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div 
                  className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.7)", 
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-[#E2E8F0] gap-6">
                    <h3 className="text-3xl font-bold flex items-center gap-4" style={{ color: "#334155" }}>
                      <div className="p-2.5 rounded-2xl bg-[#F7B980]/10">
                        <Mail className="w-7 h-7 text-[#F7B980]" />
                      </div>
                      Communications Hub
                    </h3>
                    
                    <div className="flex p-1.5 bg-white/40 rounded-2xl border border-[#E2E8F0]">
                      {(["inbox", "sent", "compose"] as const).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setMessageSubTab(sub)}
                          className={`px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                            messageSubTab === sub 
                              ? "bg-white text-[#F7B980] shadow-md border border-[#F7B980]/10" 
                              : "text-[#64748B] hover:text-[#334155]"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {messageSubTab === "inbox" && (
                      <>
                        {isLoadingMessages ? (
                          <div className="flex flex-col items-center justify-center py-20 mt-10">
                            <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                            <p className="text-[#64748B] font-bold text-sm tracking-wide">Decrypting inbound signals...</p>
                          </div>
                        ) : messages.length > 0 ? (
                          messages.map((msg) => (
                            <div 
                              key={msg.id} 
                              onClick={() => {
                                setSelectedMessage(msg);
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
                              }}
                              className="p-6 rounded-[24px] border transition-all cursor-pointer group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                              style={msg.unread ? { 
                                background: "#FFFFFF", 
                                borderColor: "#F7B980",
                                boxShadow: "0 12px 32px rgba(247,185,128,0.08)"
                              } : {
                                background: "rgba(255, 255, 255, 0.4)",
                                borderColor: "#E0E4E3"
                              }}
                            >
                              <div className="flex gap-4 items-center flex-1">
                                <div 
                                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0"
                                  style={{ background: "#E2E8F0", color: "#F7B980" }}
                                >
                                  {msg.company.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-base transition-colors group-hover:text-[#F7B980] flex items-center gap-2" style={{ color: "#334155" }}>
                                    {msg.company}
                                    {msg.unread && <span className="inline-block w-2 h-2 rounded-full bg-[#F7B980]" />}
                                    {msg.replied && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Replied</span>}
                                  </h4>
                                  <p className="text-sm font-medium" style={{ color: "#64748B" }}>{msg.subject}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#64748B" }}>{msg.time}</p>
                                <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "#334155" }} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-20 bg-[#F9F9F9]/50 rounded-[32px] border-2 border-dashed" style={{ borderColor: "#E0E4E3" }}>
                            <p className="text-xl font-bold mb-2" style={{ color: "#334155" }}>No inbound signals</p>
                            <p className="font-medium" style={{ color: "#64748B" }}>Your communication channels are currently quiet.</p>
                          </div>
                        )}
                        
                        <div className="mt-10 pt-10 border-t border-[#E2E8F0] text-center">
                          <button className="text-sm font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer" style={{ color: "#334155" }}>
                            Archive History
                          </button>
                        </div>
                      </>
                    )}

                    {messageSubTab === "sent" && (
                      <>
                        {isLoadingSent ? (
                          <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                            <p className="text-[#64748B] font-bold text-sm">Auditing outbound transit...</p>
                          </div>
                        ) : sentMessages.length > 0 ? (
                          sentMessages.map((msg: DirectMessage) => (
                            <div 
                              key={msg.id}
                              className="p-6 rounded-[24px] border border-[#E2E8F0] transition-all hover:bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                              style={{ background: "rgba(255, 255, 255, 0.4)" }}
                            >
                               <div className="flex gap-4 items-center">
                                  <div className="w-12 h-12 rounded-2xl bg-[#334155]/5 flex items-center justify-center font-black text-[#334155] text-lg">
                                    {msg.receiver.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-base" style={{ color: "#334155" }}>{msg.receiver.name}</h4>
                                    <p className="text-sm italic opacity-60" style={{ color: "#64748B" }}>{msg.subject || "Direct Inquiry"}</p>
                                  </div>
                               </div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                 {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Present"}
                               </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-20 bg-[#F9F9F9]/50 rounded-[32px] border-2 border-dashed" style={{ borderColor: "#E0E4E3" }}>
                            <p className="text-xl font-bold mb-2" style={{ color: "#334155" }}>No sent transmissions</p>
                            <p className="font-medium" style={{ color: "#64748B" }}>You haven&apos;t initiated any direct contact yet.</p>
                          </div>
                        )}
                      </>
                    )}

                    {messageSubTab === "compose" && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: "#64748B" }}>Target Headquarters</label>
                               <select 
                                 value={selectedRecipientId}
                                 onChange={(e) => setSelectedRecipientId(e.target.value)}
                                 className="w-full px-8 py-5 bg-white border-2 rounded-[28px] outline-none transition-all font-bold text-base focus:border-[#F7B980] shadow-sm appearance-none cursor-pointer"
                                 style={{ borderColor: "#E2E8F0", color: "#334155" }}
                               >
                                 <option value="">Select a Company...</option>
                                 {employers.map((emp: Employer) => (
                                   <option key={emp.id} value={emp.id}>{emp.name}</option>
                                 ))}
                               </select>
                            </div>
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: "#64748B" }}>Communication Pitch</label>
                               <input 
                                 type="text"
                                 value={composeSubject}
                                 onChange={(e) => setComposeSubject(e.target.value)}
                                 placeholder="Subject (Optional)"
                                 className="w-full px-8 py-5 bg-white border-2 rounded-[28px] outline-none transition-all font-bold text-base focus:border-[#F7B980] shadow-sm"
                                 style={{ borderColor: "#E2E8F0", color: "#334155" }}
                               />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: "#64748B" }}>Transmission Body</label>
                            <textarea 
                              value={composeBody}
                              onChange={(e) => setComposeBody(e.target.value)}
                              placeholder="Write your professional inquiries, follow-ups or proposals here..."
                              className="w-full px-8 py-8 bg-white border-2 rounded-[40px] outline-none transition-all font-medium text-lg leading-relaxed focus:border-[#F7B980] shadow-inner min-h-[280px] resize-none"
                              style={{ borderColor: "#E2E8F0", color: "#334155" }}
                            />
                         </div>
                         <div className="flex justify-center md:justify-end pt-4">
                            <Button 
                              onClick={handleSendCompose}
                              disabled={!selectedRecipientId || !composeBody.trim() || isSendingDirect}
                              className="px-16 py-5 rounded-[28px]"
                              size="lg"
                            >
                               {isSendingDirect ? "Transmitting..." : "Initiate Protocol"}
                            </Button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Video CV Section */}
                <div 
                  className="border border-white md:rounded-[40px] rounded-[32px] p-4 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.7)", 
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 md:pb-10 mb-6 md:mb-10 border-b border-[#E2E8F0] px-1 md:px-0">
                    <div className="mb-6 md:mb-0">
                      <h3 className="text-3xl font-bold mb-3 flex items-center gap-4" style={{ color: "#334155" }}>
                        <div className="p-2.5 rounded-2xl bg-[#F7B980]/10">
                          <Video className="w-7 h-7 text-[#F7B980]" />
                        </div>
                        Video Portfolio
                      </h3>
                      <p className="max-w-xl text-base font-medium" style={{ color: "#64748B" }}>
                        Record or upload a high-fidelity introduction. Your Video CV is your competitive edge, showcasing your personality directly to global hiring teams.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowVideoCreator(!showVideoCreator)}
                      variant={showVideoCreator ? "outline" : "primary"}
                      size="lg"
                    >
                      {showVideoCreator ? "Close Studio" : "Open Video Studio"}
                    </Button>
                  </div>

                  {showVideoCreator ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                      <div className="bg-[#F9F9F9] rounded-[32px] p-6 md:p-10 border border-[#E0E4E3]">
                        <VideoCreator 
                           initialVideoUrl={activeVideoUrl || undefined}
                           onVideoUpload={async (file, url, streamingUrl) => {
                             console.log("Uploaded:", file.name);
                             const finalUrl = streamingUrl || url;
                             if (finalUrl) {
                               setActiveVideoUrl(finalUrl);
                               // Call the save API to persist the video to the profile
                               try {
                                 const response = await fetch("/api/profile/video/save", {
                                   method: "POST",
                                   headers: {
                                     "Content-Type": "application/json",
                                     "Authorization": `Bearer ${localStorage.getItem("token")}`
                                   },
                                   body: JSON.stringify({ videoUrl: url, streamingUrl })
                                 });
                                 if (!response.ok) {
                                   console.error("Failed to save video to profile database");
                                 }
                               } catch (err) {
                                 console.error("Persistence error:", err);
                               }
                             }
                             setShowVideoCreator(false);
                           }} 
                           onVideoDelete={() => setActiveVideoUrl(null)}
                        />
                      </div>
                    </motion.div>
                  ) : activeVideoUrl ? (
                    <div className="w-full aspect-video bg-[#334155] rounded-[24px] md:rounded-[32px] border-2 md:border-4 border-white overflow-hidden relative shadow-2xl group">
                        <LiveKitPlayer 
                          src={activeVideoUrl}
                          candidateName="Candidate"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#334155]/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button 
                          onClick={() => {
                            setModalConfig({
                              isOpen: true,
                              title: "Delete Portfolio Video?",
                              message: "This will permanently remove your active Video CV from your profile. Are you sure?",
                              type: "confirm",
                              onConfirm: async () => {
                                try {
                                  const response = await fetch("/api/profile/video/delete", { 
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                                  });
                                  if (response.ok) {
                                    setActiveVideoUrl(null);
                                    setModalConfig({ isOpen: true, title: "Success", message: "Video deleted.", type: "success" });
                                  } else {
                                    setModalConfig({ isOpen: true, title: "Failed", message: "Failed to delete video.", type: "error" });
                                  }
                                } catch (error) {
                                  console.error("Deletion error:", error);
                                }
                              }
                            });
                          }}
                          className="absolute md:top-6 md:right-6 top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 md:p-3.5 rounded-xl md:rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-xl md:opacity-0 md:group-hover:opacity-100 opacity-100 scale-90 md:group-hover:scale-100"
                        >
                          <Trash2 className="w-4 h-4 md:w-6 md:h-6" />
                        </button>
                    </div>
                  ) : (
                    <div 
                      className="w-full aspect-video md:aspect-[21/9] rounded-[24px] md:rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center text-center p-6 md:p-12 group transition-all cursor-pointer" 
                      style={{ background: "#F9F9F9", borderColor: "#E0E4E3" }}
                      onClick={() => setShowVideoCreator(true)}
                    >
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform cursor-pointer border border-[#E0E4E3]">
                        <PlayIcon className="w-10 h-10 translate-x-1" style={{ color: "#F7B980" }} />
                      </div>
                      <h4 className="text-2xl font-bold mb-3" style={{ color: "#334155" }}>Bring your profile to life</h4>
                      <p className="max-w-md font-medium" style={{ color: "#64748B" }}>You haven&apos;t added a Video CV yet. Launch the studio to record your 60-second elevator pitch.</p>
                      <button 
                        className="mt-8 px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                        style={{ background: "#334155", color: "white" }}
                      >
                        Launch Studio
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Skills Section */}
                  <div 
                    className="border border-white rounded-[40px] p-8 lg:p-10 shadow-xl"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.7)", 
                      backdropFilter: "blur(24px)",
                      boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                    }}
                  >
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ color: "#334155" }}>
                      Professional Skills
                    </h4>
                    
                    <div className="flex gap-3 mb-8">
                      <input 
                        type="text" 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Expertise (e.g. Next.js)..." 
                        className="flex-1 px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                        style={{ borderColor: "#E0E4E3", color: "#334155" }}
                      />
                      <button 
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="p-3 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                        style={{ background: "#334155", color: "white" }}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <AnimatePresence>
                        {skills.map((skill) => (
                          <motion.span 
                            key={skill}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group flex items-center gap-2 pl-4 pr-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border group"
                            style={{ 
                              background: "#FFFFFF", 
                              borderColor: "#E0E4E3", 
                              color: "#8A8C8E" 
                            }}
                          >
                            {skill}
                            <button 
                              onClick={() => handleRemoveSkill(skill)}
                              className="p-1 hover:bg-[#E2E8F0] rounded-lg text-[#64748B] hover:text-[#EF4444] transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {skills.length === 0 && (
                        <span className="text-sm font-medium italic" style={{ color: "#64748B" }}>Define your stack...</span>
                      )}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div 
                    className="border border-white rounded-[40px] p-8 lg:p-10 shadow-xl"
                    style={{ 
                      background: "rgba(255, 255, 255, 0.7)", 
                      backdropFilter: "blur(24px)",
                      boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                    }}
                  >
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ color: "#334155" }}>
                      Work Experience
                    </h4>
                    
                    {/* Add Experience Form */}
                    <div className="p-6 rounded-[24px] border border-dashed mb-10 space-y-4" style={{ background: "rgba(242, 244, 244, 0.4)", borderColor: "#E0E4E3" }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748B" }}>Add New Milestone</p>
                      <input 
                        type="text" 
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({...newExperience, role: e.target.value})}
                        placeholder="Role / Position" 
                        className="w-full px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium mb-2"
                        style={{ borderColor: "#E0E4E3", color: "#334155" }}
                      />
                      <div className="flex flex-col md:flex-row gap-3">
                        <input 
                          type="text" 
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          placeholder="Company" 
                          className="flex-1 px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                          style={{ borderColor: "#E0E4E3", color: "#334155" }}
                        />
                        <input 
                          type="text" 
                          value={newExperience.duration}
                          onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                          placeholder="Duration" 
                          className="flex-1 px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                          style={{ borderColor: "#E0E4E3", color: "#334155" }}
                        />
                      </div>
                      <button 
                        onClick={handleAddExperience}
                        disabled={!newExperience.role.trim() || !newExperience.company.trim()}
                        className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                        style={{ background: "#334155", color: "white" }}
                      >
                        Add to Profile
                      </button>
                    </div>

                    <div className="space-y-8">
                      <AnimatePresence>
                        {experiences.map((exp) => (
                          <motion.div 
                            key={exp.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-5 group relative"
                          >
                            <div 
                              className="w-14 h-14 rounded-[20px] flex items-center justify-center font-bold text-lg shrink-0 shadow-lg"
                              style={{ 
                                background: "linear-gradient(135deg, #F9F9F9, #E2E8F0)", 
                                border: "1px solid #E0E4E3",
                                color: "#F7B980" 
                              }}
                            >
                              {exp.company.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 pr-10">
                              <p className="font-bold text-lg leading-tight mb-1" style={{ color: "#334155" }}>{exp.role}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#F7B980" }}>{exp.company}</span>
                                <span className="hidden sm:block w-1 h-1 rounded-full bg-[#E0E4E3]" />
                                <span className="text-xs font-semibold" style={{ color: "#64748B" }}>{exp.duration}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="absolute top-0 right-0 md:opacity-0 md:group-hover:opacity-100 p-2 text-[#64748B] hover:text-[#EF4444] transition-all cursor-pointer opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-8">
                <div 
                  className="border border-white/50 rounded-[40px] p-5 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden transition-all duration-500"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.85)", 
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 32px 80px rgba(87,89,91,0.07)"
                  }}
                >
                  <div className="mb-10 md:mb-12">
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#334155" }}>Global Job Search</h3>
                    <p className="font-bold text-base md:text-lg leading-relaxed opacity-70" style={{ color: "#64748B" }}>Find your dream role and instantly apply using your verified Video Portfolio.</p>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 mb-12">
                    <div className="flex-1 relative group transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#F7B980]" style={{ color: "#64748B" }}>
                        <Search className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search roles or companies..."
                        className="w-full pl-12 pr-6 py-4 md:py-5 bg-white border-2 rounded-[24px] outline-none transition-all font-bold placeholder:text-[#94A3B8] focus:border-[#F7B980]/60 shadow-sm"
                        style={{ borderColor: "#E0E4E3", color: "#334155" }}
                      />
                    </div>
                    
                    <div className="flex-1 relative z-20">
                      <Select
                        options={countryOptions}
                        onChange={(newValue) => setSelectedCountry(newValue as SingleValue<{ value: string; label: string }>)}
                        value={selectedCountry}
                        isClearable
                        placeholder="Filter by Location..."
                        className="react-select-container text-left font-bold"
                        classNamePrefix="react-select"
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "56px",
                            paddingLeft: "8px",
                            backgroundColor: "#FFFFFF",
                            borderColor: state.isFocused ? "#F7B980" : "#E0E4E3",
                            borderWidth: "2px",
                            borderRadius: "24px",
                            boxShadow: "none",
                            display: "flex",
                            alignItems: "center",
                            "&:hover": { borderColor: "#F7B980/60" }
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "2px 12px",
                            display: "flex",
                            alignItems: "center"
                          }),
                          indicatorsContainer: (base) => ({
                            ...base,
                            height: "56px",
                            display: "flex",
                            alignItems: "center"
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            backdropFilter: "blur(20px)",
                            borderRadius: "24px",
                            padding: "8px",
                            border: "1px solid #E0E4E3",
                            boxShadow: "0 20px 50px rgba(87,89,91,0.12)"
                          }),
                        }}
                      />
                    </div>

                    <Button 
                      className="h-14 lg:h-auto px-10 rounded-[24px] shadow-lg shadow-[#F7B980]/10 font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3"
                      size="lg"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search Opportunities</span>
                    </Button>
                  </div>

            {isLoadingJobs ? (
              <div className="flex flex-col items-center justify-center py-24 mt-10">
                <div className="w-12 h-12 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-6" />
                <p className="text-[#64748B] font-bold text-sm tracking-widest uppercase">Syncing Live Opportunities...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="group bg-white/50 border-2 rounded-[36px] p-5 md:p-8 transition-all hover:bg-white hover:border-[#F7B980]/40 hover:shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden"
                    style={{ borderColor: "rgba(224, 228, 227, 0.6)" }}
                  >
                    <div className="flex gap-6 items-start z-10">
                      <div 
                        className="w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-lg"
                        style={{ background: "#F9F9F9", border: "1px solid #E0E4E3" }}
                      >
                         <Building2 className="w-8 h-8" style={{ color: "#64748B" }} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1 transition-colors group-hover:text-[#F7B980]" style={{ color: "#334155" }}>{job.title}</h4>
                        <p className="font-bold text-sm tracking-wide mb-4" style={{ color: "#64748B" }}>{job.company.toUpperCase()}</p>
                        <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider" style={{ color: "#8A8C8E" }}>
                          <span className="flex items-center gap-2 bg-[#E2E8F0] px-3 py-1.5 rounded-lg"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                          <span className="flex items-center gap-2 bg-[#E2E8F0] px-3 py-1.5 rounded-lg"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
                          <span className="bg-[#10B981]/10 text-[#10B981] px-3 py-1.5 rounded-lg">{job.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
                      <button 
                        onClick={() => setSelectedJob(job)} 
                        className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-[#E2E8F0] cursor-pointer"
                        style={{ background: "transparent", color: "#334155", border: "1px solid #E0E4E3" }}
                      >
                        Explore
                      </button>
                      <Button 
                        onClick={() => handleApply(job.id)} 
                        className="flex-1 shrink-0 flex items-center justify-center gap-3"
                        size="md"
                      >
                        <Video className="w-4 h-4" /> 
                        Submit Portfolio
                      </Button>
                    </div>
                    {/* Subtle decorative element */}
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#F7B980]/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none group-hover:bg-[#F7B980]/10 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="text-center py-16 md:py-24 rounded-[32px] border-2 border-dashed flex flex-col items-center" 
                style={{ borderColor: "#E0E4E3", background: "rgba(249, 249, 249, 0.4)" }}
                onClick={() => { setSearchQuery(""); setSelectedCountry(null); }}
              >
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl border border-[#E0E4E3]">
                  <Search className="w-10 h-10" style={{ color: "#64748B" }} />
                </div>
                <p className="text-xl font-bold mb-2" style={{ color: "#334155" }}>No matching opportunities</p>
                <p className="font-medium mb-8" style={{ color: "#64748B" }}>Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCountry(null); }} 
                  className="font-bold text-sm underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ color: "#334155" }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

            {activeTab === "applications" && (
              <div 
                className="border border-white rounded-[40px] p-6 lg:p-12 shadow-2xl relative overflow-hidden transition-all duration-500"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-2xl bg-[#F7B980]/10 border border-[#F7B980]/20">
                      <Briefcase className="w-8 h-8 text-[#F7B980]" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold tracking-tight" style={{ color: "#334155" }}>Applied Opportunities</h3>
                      <p className="text-sm font-bold opacity-60 mt-1" style={{ color: "#64748B" }}>Track your digital journey from first impression to finalized offer.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <div 
                        key={app.id} 
                        onClick={() => setSelectedApplication(app)}
                        className="bg-white/40 border-2 rounded-[32px] p-6 md:p-8 transition-all hover:bg-white hover:border-[#F7B980]/30 hover:shadow-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 cursor-pointer group relative overflow-hidden"
                        style={{ background: "rgba(255, 255, 255, 0.4)", borderColor: "rgba(224, 228, 227, 0.6)" }}
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div 
                            className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-[#E0E4E3]"
                            style={{ background: "#F9F9F9" }}
                          >
                            <Building2 className="w-7 h-7" style={{ color: "#64748B" }} />
                          </div>
                          <div>
                            <h4 className="text-xl font-extrabold mb-1 group-hover:text-[#F7B980] transition-colors tracking-tight" style={{ color: "#334155" }}>{app.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-bold" style={{ color: "#64748B" }}>
                               <span>{app.company}</span>
                               <span className="opacity-30">•</span>
                               <span className="opacity-70">{app.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-[#E0E4E3]/30">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${app.color}`}>
                            {app.status}
                          </span>
                          <div className="p-2 rounded-xl bg-white/50 border border-[#E0E4E3] group-hover:border-[#F7B980]/30 transition-all">
                             <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "#334155" }} />
                          </div>
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#F7B980]/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-[#F7B980]/10 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-[#F9F9F9]/50 rounded-[32px] border-2 border-dashed" style={{ borderColor: "#E0E4E3" }}>
                       <Briefcase className="w-12 h-12 mx-auto mb-6 opacity-20" style={{ color: "#334155" }} />
                       <p className="text-xl font-bold mb-2" style={{ color: "#334155" }}>No active explorations</p>
                       <p className="font-medium px-8" style={{ color: "#64748B" }}>Your digital applications will materialize here once you begin your quest.</p>
                    </div>
                  )
                  }
                </div>
              </div>
            )}
            
            {activeTab === "interviews" && (
              <div 
                className="border border-white rounded-[40px] p-6 lg:p-12 shadow-2xl relative overflow-hidden transition-all duration-500"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="p-3 rounded-2xl bg-[#F7B980]/10 border border-[#F7B980]/20">
                      <CalendarIcon className="w-8 h-8 text-[#F7B980]" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold tracking-tight" style={{ color: "#334155" }}>Interview Schedule</h3>
                      <p className="text-sm font-bold opacity-60 mt-1" style={{ color: "#64748B" }}>Your professional spotlight awaits. Preparation is the bridge to opportunity.</p>
                    </div>
                  </div>
                </div>
                 
                 {isLoadingInterviews ? (
                   <div className="flex flex-col items-center justify-center py-20 mt-10">
                      <div className="w-12 h-12 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-6" />
                      <p className="text-[#64748B] font-bold text-sm tracking-widest uppercase">Retrieving your schedule...</p>
                   </div>
                 ) : interviews.length > 0 ? (
                   <div className="space-y-6">
                     {interviews.map((interview) => (
                       <div 
                         key={interview.id} 
                         className="bg-white/40 border-2 rounded-[32px] p-6 md:p-8 transition-all hover:bg-white hover:border-[#F7B980]/30 hover:shadow-2xl flex flex-col md:flex-row justify-between md:items-center gap-8 cursor-pointer group relative overflow-hidden"
                         style={{ background: "rgba(255, 255, 255, 0.4)", borderColor: "rgba(224, 228, 227, 0.6)" }}
                       >
                         <div className="flex items-center gap-6 flex-1">
                            <div 
                              className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-[#E0E4E3]"
                              style={{ background: "#F9F9F9" }}
                            >
                              <Building2 className="w-7 h-7" style={{ color: "#64748B" }} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#64748B" }}>{interview.jobTitle}</p>
                               <h4 className="text-xl font-extrabold group-hover:text-[#F7B980] transition-colors tracking-tight" style={{ color: "#334155" }}>{interview.company}</h4>
                               <div className="flex flex-wrap items-center gap-4 mt-3">
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-[#E0E4E3] text-xs font-bold" style={{ color: "#334155" }}>
                                     <Calendar className="w-3.5 h-3.5" />
                                     {interview.date}
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-[#E0E4E3] text-xs font-bold" style={{ color: "#334155" }}>
                                     <ArrowLeft className="w-3.5 h-3.5 rotate-[135deg]" /> {/* Simple clock-ish stand-in if Clock not imported */}
                                     {interview.time}
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-[#E0E4E3]/30">
                            <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border bg-[#F7B980]/5 text-[#F7B980] border-[#F7B980]/20 shadow-sm">
                              {interview.type}
                            </span>
                            <div className="p-2 rounded-xl bg-white/50 border border-[#E0E4E3] group-hover:border-[#F7B980]/30 transition-all font-bold text-[10px] uppercase tracking-widest px-4" style={{ color: "#334155" }}>
                               Prep Guide
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "#334155" }} />
                         </div>
                         {/* Decorative glow */}
                         <div className="absolute left-0 bottom-0 w-24 h-24 bg-[#F7B980]/5 rounded-full blur-3xl -ml-12 -mb-12 group-hover:bg-[#F7B980]/10 transition-all" />
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-20 bg-[#F9F9F9]/50 rounded-[40px] border-2 border-dashed flex flex-col items-center" style={{ borderColor: "#E0E4E3" }}>
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl border border-[#E2E8F0] transform group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-10 h-10" style={{ color: "#F7B980" }} />
                      </div>
                      <h3 className="text-3xl font-extrabold mb-4 tracking-tight" style={{ color: "#334155" }}>Ready for the spotlight?</h3>
                      <p className="max-w-md font-bold text-base leading-relaxed opacity-60 px-8" style={{ color: "#64748B" }}>Your upcoming interview schedule is currently clear. Keep your portfolio updated to attract global hiring teams.</p>
                      <button 
                         onClick={() => setActiveTab("jobs")} 
                         className="mt-10 px-12 py-4 rounded-full font-black text-xs tracking-[0.2em] uppercase transition-all shadow-xl hover:-translate-y-1 active:scale-95 bg-[#334155] text-white hover:bg-[#475569] shadow-slate-200 cursor-pointer"
                      >
                         Browse Roles
                      </button>
                   </div>
                 )}
              </div>
            )}
            
            {activeTab === "notifications" && (
              <div 
                className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <h3 className="text-3xl font-bold mb-10" style={{ color: "#334155" }}>Alerts & Activity</h3>
                <div className="space-y-6">
                  <div className="bg-white/40 border border-[#E0E4E3] rounded-[32px] p-8 flex items-start gap-6 transition-all hover:bg-white cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: "#E2E8F0" }}>
                      <Bell className="w-6 h-6 text-[#F7B980]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold" style={{ color: "#334155" }}>Welcome to VidioCV</h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#64748B" }}>Just now</span>
                      </div>
                      <p className="font-medium text-base" style={{ color: "#64748B" }}>Your account is verified. Start by customizing your profile and recording your first intro.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div 
                className="border border-white rounded-[48px] p-2 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row min-h-[850px] transition-all duration-500"
                style={{ 
                  background: "rgba(255, 255, 255, 0.8)", 
                  backdropFilter: "blur(40px)",
                  boxShadow: "0 32px 80px rgba(87,89,91,0.12)"
                }}
              >
                {/* Settings Sidebar */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#E2E8F0]/60 p-6 lg:p-10 space-y-3">
                   <div className="mb-10 px-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-1 opacity-50" style={{ color: "#64748B" }}>Configuration</p>
                     <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: "#334155" }}>Workspace</h3>
                   </div>
                   {[
                     { id: "general", label: "Identity & Profile", icon: UserCircle, desc: "Personal footprint" },
                     { id: "career", label: "Career Strategy", icon: Briefcase, desc: "Job match logic" },
                     { id: "security", label: "Access & Security", icon: Shield, desc: "Keys and sessions" },
                     { id: "privacy", label: "Privacy Guard", icon: Lock, desc: "Video visibility" },
                     { id: "notifications", label: "Alert Protocols", icon: Bell, desc: "Push & email" },
                   ].map((item) => (
                     <button
                       key={item.id}
                       onClick={() => setSettingsSection(item.id as "general" | "career" | "security" | "privacy" | "notifications")}
                       className={`w-full flex items-center gap-5 px-6 py-5 rounded-[30px] transition-all cursor-pointer group text-left`}
                       style={settingsSection === item.id ? {
                         background: "white",
                         color: "#F7B980",
                         boxShadow: "0 15px 35px rgba(87,89,91,0.08)"
                       } : {
                         color: "#64748B",
                       }}
                     >
                       <div className={`p-3 rounded-2xl transition-all ${settingsSection === item.id ? "bg-[#F7B980]/10 text-[#F7B980] scale-110" : "bg-[#F9F9F9] text-[#64748B] group-hover:bg-white group-hover:text-[#334155]"}`}>
                         <item.icon className="w-5 h-5 transition-transform group-active:scale-90" />
                       </div>
                       <div className="flex-1">
                         <p className="font-extrabold text-sm leading-tight transition-colors group-hover:text-[#334155]">{item.label}</p>
                         <p className="text-[9px] opacity-40 font-black uppercase tracking-widest mt-1">{item.desc}</p>
                       </div>
                       {settingsSection === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[#F7B980]" />}
                     </button>
                   ))}

                   <div className="pt-8 mt-8 border-t border-[#E2E8F0] px-4 space-y-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">System Actions</p>
                      <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center justify-between px-6 py-4 rounded-[24px] border border-transparent hover:border-red-100 hover:bg-red-50 text-red-400 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all group cursor-pointer">
                        Sign Out Workspace
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> 
                      </button>
                   </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#F9F9F9]/30 custom-scrollbar">
                    {/* Content Header / Breadcrumbs & Actions */}
                    <div className="sticky top-0 z-20 px-8 py-6 bg-[#F9F9F9]/80 backdrop-blur-md border-b border-[#E2E8F0]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: "#64748B" }}>
                          <span>Dashboard</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>Workspace Settings</span>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-[0.1em] mt-1" style={{ color: "#334155" }}>Account Workspace</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <button className="px-6 py-3 rounded-2xl border-2 border-[#E2E8F0] bg-white font-black text-[10px] uppercase tracking-widest text-[#64748B] hover:border-[#64748B]/20 hover:text-[#334155] transition-all cursor-pointer">
                          Discard Changes
                        </button>
                        <button className="px-6 py-3 rounded-2xl bg-[#334155] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#334155]/20 hover:bg-[#475569] transition-all cursor-pointer flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#F7B980]" />
                          Sync Global Portfolio
                        </button>
                      </div>
                    </div>

                    <div className="p-8 lg:p-16">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={settingsSection}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="max-w-4xl mx-auto space-y-16"
                        >
                          {settingsSection === "general" && (
                            <div className="space-y-12">
                              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-[#E2E8F0]">
                                 <div className="flex-1">
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7B980]/10 border border-[#F7B980]/20 text-[9px] font-black text-[#F7B980] uppercase tracking-widest mb-4">
                                      <UserCircle className="w-3 h-3" /> Verified Presence
                                   </div>
                                   <h3 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#334155" }}>Identity & Presence</h3>
                                   <p className="font-bold text-base leading-relaxed opacity-60" style={{ color: "#64748B" }}>Manage your global professional footprint and verified identifier.</p>
                                 </div>
                                 <div className="flex -space-x-4">
                                    {[
                                      { src: "/avatars/user-pfp.png", alt: "User Profile" },
                                      { src: "/avatars/recruiter-1.png", alt: "Recruiter 1" },
                                      { src: "/avatars/recruiter-2.png", alt: "Recruiter 2" },
                                      { initials: "+4" }
                                    ].map((avatar, i) => (
                                      <div key={i} className="w-16 h-16 rounded-[24px] border-[4px] border-white bg-white shadow-xl flex items-center justify-center text-xs font-black transition-transform hover:scale-110 cursor-help" style={{ color: "#64748B" }}>
                                        <div className="w-full h-full rounded-[20px] bg-[#F9F9F9] flex items-center justify-center border border-[#E2E8F0] overflow-hidden">
                                          {avatar.src ? (
                                            <NextImage 
                                              src={avatar.src} 
                                              alt={avatar.alt || "Avatar"} 
                                              width={64} 
                                              height={64} 
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            avatar.initials
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 ml-4" style={{ color: "#64748B" }}>Legal Identifier</label>
                                  <input type="text" defaultValue={userName} className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-[28px] outline-none transition-all font-extrabold focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/5 shadow-sm" style={{ color: "#334155" }} />
                                </div>
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 ml-4" style={{ color: "#64748B" }}>Main Connection</label>
                                  <input type="tel" defaultValue="+1 (555) 782-0192" className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-[28px] outline-none transition-all font-extrabold focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/5 shadow-sm" style={{ color: "#334155" }} />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 ml-4" style={{ color: "#64748B" }}>Professional Narrative</label>
                                  <textarea rows={5} defaultValue="Senior Software Engineer with a passion for high-fidelity UI/UX and scalable distributed systems. Currently optimizing video delivery at scale." className="w-full px-8 py-7 bg-white border border-[#E2E8F0] rounded-[32px] outline-none transition-all font-bold text-lg leading-relaxed focus:border-[#F7B980] focus:ring-4 focus:ring-[#F7B980]/5 shadow-sm resize-none" style={{ color: "#334155" }} />
                                </div>
                              </div>

                              <div className="pt-8 space-y-10">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-2xl font-black tracking-tight" style={{ color: "#334155" }}>Ecosystem Hub</h4>
                                      <p className="text-sm font-bold opacity-50 mt-1" style={{ color: "#64748B" }}>Connect your external professional nodes for deeper verification.</p>
                                    </div>
                                    <button className="p-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-[#F7B980] transition-all cursor-pointer">
                                      <Plus className="w-5 h-5 text-[#F7B980]" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 gap-6">
                                    {[
                                      { label: "LinkedIn Domain", val: "linkedin.com/in/johndoe", icon: LinkIcon },
                                      { label: "Architecture Portfolio", val: "johndoe.dev", icon: LinkIcon }
                                    ].map((hub, i) => (
                                      <div key={i} className="flex items-center gap-6 p-6 rounded-[32px] bg-white border border-[#E2E8F0] shadow-sm group hover:border-[#F7B980] transition-all relative overflow-hidden">
                                        <div className="p-4 rounded-[22px] bg-[#F9F9F9] text-[#64748B] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-all shadow-inner">
                                          <hub.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-40" style={{ color: "#64748B" }}>{hub.label}</p>
                                          <input type="text" defaultValue={hub.val} className="w-full bg-transparent outline-none font-black text-base" style={{ color: "#334155" }} />
                                        </div>
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-[#F7B980]/5 rounded-full blur-[60px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    ))}
                                  </div>
                              </div>
                            </div>
                          )}

                          {settingsSection === "career" && (
                            <div className="space-y-12">
                              <div className="pb-10 border-b border-[#E2E8F0]">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7B980]/10 border border-[#F7B980]/20 text-[9px] font-black text-[#F7B980] uppercase tracking-widest mb-4">
                                    <Briefcase className="w-3 h-3" /> Strategy Architecture
                                 </div>
                                 <h3 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#334155" }}>Career Strategy</h3>
                                 <p className="font-bold text-base leading-relaxed opacity-60" style={{ color: "#64748B" }}>Configure your employment mobility and signal your availability to the network.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                 <div className="space-y-10">
                                    <div className="space-y-6">
                                      <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-4 opacity-40" style={{ color: "#64748B" }}>Mobility Protocols</label>
                                      <div className="space-y-4">
                                        <div className="p-6 rounded-[32px] bg-white border border-[#E2E8F0] shadow-sm">
                                          <Toggle 
                                            enabled={prefs.remoteOnly} 
                                            setEnabled={(val) => setPrefs({...prefs, remoteOnly: val})} 
                                            label="Remote Operations" 
                                            description="Prioritize opportunities with distributed workspace."
                                          />
                                        </div>
                                        <div className="p-6 rounded-[32px] bg-white border border-[#E2E8F0] shadow-sm">
                                          <Toggle 
                                            enabled={prefs.openToRelocate} 
                                            setEnabled={(val) => setPrefs({...prefs, openToRelocate: val})} 
                                            label="Global Relocation" 
                                            description="Willing to move for the right high-impact mission."
                                          />
                                        </div>
                                      </div>
                                    </div>
                                 </div>
                                 <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-4 opacity-40" style={{ color: "#64748B" }}>Compensation Blueprint</label>
                                    <div className="p-10 rounded-[40px] bg-white border border-[#F7B980]/20 shadow-xl shadow-[#F7B980]/5 space-y-10 relative overflow-hidden">
                                      <div className="flex justify-between items-start relative z-10">
                                        <div>
                                          <p className="text-xs font-black uppercase tracking-widest opacity-40" style={{ color: "#64748B" }}>Target Minimum</p>
                                          <p className="text-4xl font-black mt-2" style={{ color: "#334155" }}>${(prefs.expectedSalary / 1000).toFixed(0)}k<span className="text-lg text-[#F7B980] ml-1">USD+</span></p>
                                        </div>
                                        <div className="p-3 bg-[#F7B980]/10 rounded-2xl text-[#F7B980] border border-[#F7B980]/10">
                                           <Lock className="w-5 h-5" />
                                        </div>
                                      </div>
                                      <div className="relative z-10 pt-4">
                                        <input 
                                          type="range" 
                                          min="50000" 
                                          max="300000" 
                                          step="5000"
                                          value={prefs.expectedSalary} 
                                          onChange={(e) => setPrefs({...prefs, expectedSalary: parseInt(e.target.value)})} 
                                          className="w-full h-2 bg-[#F9F9F9] rounded-lg appearance-none cursor-pointer accent-[#F7B980]" 
                                        />
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mt-6 opacity-40" style={{ color: "#64748B" }}>
                                          <span>$50k</span>
                                          <span className="text-[#F7B980] opacity-100">$175k (Avg)</span>
                                          <span>$300k+</span>
                                        </div>
                                      </div>
                                      <div className="absolute top-0 right-0 w-48 h-48 bg-[#F7B980]/5 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
                                    </div>
                                 </div>
                              </div>

                              <div className="pt-8 space-y-8">
                                 <div className="flex items-center justify-between">
                                   <div>
                                     <h4 className="text-2xl font-black tracking-tight" style={{ color: "#334155" }}>Mission Targets</h4>
                                     <p className="text-sm font-bold opacity-50 mt-1" style={{ color: "#64748B" }}>Tag the sectors where you want to make the most professional impact.</p>
                                   </div>
                                 </div>
                                 <div className="flex flex-wrap gap-4">
                                    {["FinTech", "HealthTech", "AI / ML", "Cybersecurity", "E-commerce", "SaaS", "Web3"].map(tag => (
                                      <button 
                                        key={tag} 
                                        className="px-8 py-4 rounded-[24px] border font-black text-xs uppercase tracking-widest transition-all bg-white hover:bg-[#F7B980] hover:text-white hover:border-[#F7B980] hover:shadow-xl hover:shadow-[#F7B980]/20 cursor-pointer shadow-sm border-[#E2E8F0]"
                                        style={{ color: "#334155" }}
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                    <button className="px-8 py-4 rounded-[24px] border-2 border-dashed border-[#E2E8F0] font-black text-xs uppercase tracking-widest flex items-center gap-3 cursor-pointer group hover:bg-white hover:border-[#F7B980]/30 transition-all text-[#64748B] hover:text-[#F7B980]">
                                      <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> New Target
                                    </button>
                                 </div>
                              </div>
                            </div>
                          )}

                          {settingsSection === "notifications" && (
                            <div className="space-y-12">
                              <div className="pb-10 border-b border-[#E2E8F0]">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7B980]/10 border border-[#F7B980]/20 text-[9px] font-black text-[#F7B980] uppercase tracking-widest mb-4">
                                    <Bell className="w-3 h-3" /> Communications Sync
                                 </div>
                                 <h3 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#334155" }}>Alert Protocols</h3>
                                 <p className="font-bold text-base leading-relaxed opacity-60" style={{ color: "#64748B" }}>Configure your real-time signal preferences for the dashboard.</p>
                              </div>

                              <div className="space-y-6">
                                {[
                                  { icon: Mail, label: "Email Sync", desc: "Weekly digests and mission-critical updates.", enabled: prefs.emailAlerts, key: "emailAlerts" },
                                  { icon: Bell, label: "Desktop Signals", desc: "Instant push notifications for recruiter inquiries.", enabled: prefs.browserAlerts, key: "browserAlerts" },
                                  { icon: Shield, label: "Private Inquiries", desc: "Allow high-tier recruiters to reach out directly.", enabled: prefs.jobInvites, key: "jobInvites" }
                                ].map((alert, i) => (
                                  <div key={i} className="bg-white border border-[#E2E8F0] rounded-[40px] p-8 flex items-center gap-10 shadow-sm group hover:border-[#F7B980]/30 transition-all">
                                    <div className="p-5 rounded-[24px] bg-[#F9F9F9] text-[#64748B] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors shadow-inner">
                                      <alert.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                      <Toggle 
                                        enabled={alert.enabled as boolean} 
                                        setEnabled={(val) => setPrefs({...prefs, [alert.key]: val})} 
                                        label={alert.label} 
                                        description={alert.desc}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {settingsSection === "privacy" && (
                            <div className="space-y-12">
                              <div className="pb-10 border-b border-[#E2E8F0]">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[9px] font-black text-[#10B981] uppercase tracking-widest mb-4">
                                    <Lock className="w-3 h-3" /> Security Overwatch
                                 </div>
                                 <h3 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#334155" }}>Privacy Guard</h3>
                                 <p className="font-bold text-base leading-relaxed opacity-60" style={{ color: "#64748B" }}>Control your video resume discoverability and narrative data.</p>
                              </div>

                              <div className="grid grid-cols-1 gap-10">
                                  <div className="bg-[#334155] rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl group">
                                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                                        <div className="max-w-md space-y-6">
                                           <h4 className="text-4xl font-black tracking-tight underline decoration-[#F7B980]/30 decoration-8 underline-offset-8">Spotlight Visibility</h4>
                                           <p className="text-white/60 font-bold text-lg leading-relaxed mt-4">When active, your high-fidelity Video Resume is promoted to the global recruiter network.</p>
                                           <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                              <Shield className="w-5 h-5 text-[#F7B980]" />
                                              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by VidioCV Privacy Protocols</p>
                                           </div>
                                        </div>
                                        <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 backdrop-blur-xl group-hover:bg-white/10 transition-colors">
                                          <Toggle 
                                            enabled={prefs.videoPublic} 
                                            setEnabled={(val) => setPrefs({...prefs, videoPublic: val})} 
                                            label="Go Public" 
                                            description="Active for Recruiters"
                                            dark
                                          />
                                        </div>
                                      </div>
                                      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F7B980]/10 rounded-full blur-[140px] -mr-64 -mt-64 pointer-events-none group-hover:bg-[#F7B980]/15 transition-all duration-700" />
                                  </div>

                                  <div className="p-10 rounded-[40px] border-2 border-dashed border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-10 hover:bg-red-50/10 transition-colors">
                                     <div className="flex items-center gap-8">
                                        <div className="p-5 rounded-[24px] bg-red-50 text-red-400 border border-red-50 shadow-inner">
                                          <Trash2 className="w-8 h-8" />
                                        </div>
                                        <div>
                                          <p className="font-extrabold text-xl" style={{ color: "#334155" }}>Narrative Data Wipe</p>
                                          <p className="text-sm font-bold opacity-50 mt-1" style={{ color: "#64748B" }}>Irreversibly delete your active Video CV and local metadata.</p>
                                        </div>
                                     </div>
                                     <button className="px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest text-red-500 bg-red-50/50 hover:bg-red-100 transition-all border border-red-100 cursor-pointer">Execute Wipe</button>
                                  </div>
                              </div>
                            </div>
                          )}

                          {settingsSection === "security" && (
                            <div className="space-y-12">
                              <div className="pb-10 border-b border-[#E2E8F0]">
                                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#334155]/10 border border-[#334155]/20 text-[9px] font-black text-[#334155] uppercase tracking-widest mb-4">
                                    <Shield className="w-3 h-3" /> Authenticity Hub
                                 </div>
                                 <h3 className="text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#334155" }}>Security Hub</h3>
                                 <p className="font-bold text-base leading-relaxed opacity-60" style={{ color: "#64748B" }}>Manage authentication hardware and active workspace sessions.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-4 opacity-40" style={{ color: "#64748B" }}>Access Key</label>
                                  <div className="relative group">
                                    <input type="password" defaultValue="********" disabled className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-[28px] transition-all font-extrabold" style={{ color: "#334155" }} />
                                    <button className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[10px] uppercase tracking-widest text-[#F7B980] hover:scale-105 transition-transform cursor-pointer px-4 py-2 rounded-xl bg-[#F7B980]/5">Rotate</button>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-[0.25em] ml-4 opacity-40" style={{ color: "#64748B" }}>Verified Terminal</label>
                                  <div className="relative group">
                                    <input type="email" defaultValue="johndoe@example.com" disabled className="w-full px-8 py-5 bg-white border border-[#E2E8F0] rounded-[28px] transition-all font-extrabold" style={{ color: "#334155" }} />
                                    <button className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[10px] uppercase tracking-widest text-[#F7B980] hover:scale-105 transition-transform cursor-pointer px-4 py-2 rounded-xl bg-[#F7B980]/5">Update</button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-8 pt-6">
                                 <div className="flex items-center justify-between px-4">
                                   <h4 className="text-2xl font-black tracking-tight" style={{ color: "#334155" }}>Active Terminals</h4>
                                   <button className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors cursor-pointer border border-transparent hover:border-red-100 hover:bg-red-50 px-4 py-2 rounded-xl">Disconnect All</button>
                                 </div>
                                 <div className="grid grid-cols-1 gap-6">
                                    {[
                                      { device: "MacBook Pro M2 - San Francisco, US", time: "Active Workspace", current: true, icon: "💻" },
                                      { device: "iPhone 15 Pro - Austin, TX", time: "Last check-in 2h ago", current: false, icon: "📱" }
                                    ].map((session, i) => (
                                      <div key={i} className="flex justify-between items-center p-8 rounded-[40px] bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                                        <div className="flex items-center gap-8">
                                          <div className="w-16 h-16 rounded-[24px] bg-[#F9F9F9] flex items-center justify-center text-3xl shadow-inner border border-[#E2E8F0] group-hover:scale-110 transition-transform">
                                            {session.icon}
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-lg tracking-tight" style={{ color: "#334155" }}>{session.device}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                              <div className={`w-2.5 h-2.5 rounded-full ${session.current ? "bg-[#10B981] shadow-lg shadow-[#10B981]/40" : "bg-slate-300"}`} />
                                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: "#64748B" }}>{session.time}</p>
                                            </div>
                                          </div>
                                        </div>
                                        {!session.current && <button className="p-4 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer shadow-sm border border-transparent hover:border-red-100"><Trash2 className="w-6 h-6" /></button>}
                                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-slate-500/5 rounded-full blur-3xl -mr-12 -mb-12 pointer-events-none" />
                                      </div>
                                    ))}
                                 </div>
                              </div>

                              <div className="pt-12 border-t border-[#E2E8F0]">
                                 <div className="p-12 rounded-[50px] bg-red-500/5 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                                    <div className="relative z-10 max-w-md text-center md:text-left">
                                       <h5 className="text-3xl font-black text-red-500 tracking-tight mb-3">Danger Zone</h5>
                                       <p className="text-base font-bold text-red-400 leading-relaxed">Permanently deactivate your professional profile and erase all narrative history across the VidioCV network.</p>
                                    </div>
                                    <button onClick={() => setIsLogoutModalOpen(true)} className="relative z-10 px-12 py-5 bg-red-500 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-500/30 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                                      Deactivate Profile
                                    </button>
                                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-red-500/10 transition-all duration-700" />
                                 </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                </div>
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
        <div className="py-4 text-center">
          <div className="w-20 h-20 bg-[#F7B980]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-[#F7B980]" />
          </div>
          <p className="text-lg font-medium" style={{ color: "#8A8C8E" }}>
            {successMessage?.message}
          </p>
        </div>
      </Modal>

      {/* Generic Modal for Confirmations/Alerts */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        type={modalConfig.type === "confirm" ? "default" : modalConfig.type}
        primaryAction={modalConfig.type === "confirm" ? {
          label: "Confirm Action",
          onClick: () => {
            modalConfig.onConfirm?.();
            setModalConfig({ ...modalConfig, isOpen: false });
          }
        } : undefined}
        closeActionLabel={modalConfig.type === "confirm" ? "Cancel" : "Close"}
      >
        <div className="py-6 text-center">
           <p className="text-lg font-medium" style={{ color: "#8A8C8E" }}>{modalConfig.message}</p>
        </div>
      </Modal>

      {/* Job Details Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        type="info"
        primaryAction={{
          label: "Submit Video Portfolio",
          onClick: () => {
             setModalConfig({
               isOpen: true,
               title: "Application Synced",
               message: "Your Video Portfolio has been successfully transmitted to " + selectedJob?.company + ". Good luck!",
               type: "success"
             });
             setSelectedJob(null);
          }
        }}
        closeActionLabel="Close"
        maxWidth="max-w-3xl"
      >
        {selectedJob && (
          <div className="space-y-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between border-b border-[#E2E8F0] pb-8 gap-6">
               <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#E2E8F0] flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-[#334155]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#334155" }}>{selectedJob.company}</p>
                    <div className="flex items-center gap-3 text-sm font-bold" style={{ color: "#64748B" }}>
                      <MapPin className="w-4 h-4" /> {selectedJob.location}
                    </div>
                  </div>
               </div>
               <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-xl bg-[#F7B980]/10 text-[#F7B980] text-xs font-bold uppercase tracking-widest">{selectedJob.type}</span>
                  <span className="px-4 py-2 rounded-xl bg-[#10B981]/10 text-[#10B981] text-xs font-bold uppercase tracking-widest">{selectedJob.salary}</span>
               </div>
            </div>
            
            <div className="space-y-6">
               <h4 className="text-xl font-bold" style={{ color: "#334155" }}>Opportunity Blueprint</h4>
               <p className="text-lg leading-relaxed font-medium" style={{ color: "#8A8C8E" }}>
                 {selectedJob.description}
               </p>
            </div>

            <div className="p-6 rounded-3xl flex items-start gap-5 border border-[#E2E8F0]" style={{ background: "rgba(242, 244, 244, 0.3)" }}>
               <div className="p-3 rounded-2xl bg-white shadow-sm">
                 <Shield className="w-6 h-6 text-[#10B981]" />
               </div>
               <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "#334155" }}>Verified Selection Process</p>
                  <p className="text-xs font-medium" style={{ color: "#64748B" }}>Applying will securely transmit your active Video Resume. Your data is protected by global encryption standards.</p>
               </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        type="default" 
        title="Sign Out"
        primaryAction={{ label: "Confirm Logout", onClick: handleLogout }}
        closeActionLabel="Stay Logged In"
      >
        <div className="py-6 text-center">
          <p className="text-lg font-medium" style={{ color: "#8A8C8E" }}>Are you ready to sign out of your professional workspace?</p>
        </div>
      </Modal>

      {/* Read Email Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => {
          setSelectedMessage(null);
          setIsReplying(false);
          setReplyText("");
        }}
        type="info"
        closeActionLabel={isReplying ? "Cancel Reply" : "Back to Inbox"}
        maxWidth="max-w-3xl"
        align="left"
      >
        {selectedMessage && (
          <div className="space-y-4 -mt-2">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-5">
              <div className="flex gap-3 items-center">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "white" }}
                >
                  {selectedMessage.company.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-black leading-tight" style={{ color: "#334155" }}>{selectedMessage.company}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: "#64748B" }}>{selectedMessage.sender}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{selectedMessage.time}</p>
                <div className="px-2 py-0.5 bg-[#10B981]/5 text-[#10B981] rounded-full text-[8px] font-black uppercase tracking-widest inline-block border border-[#10B981]/10">Verified</div>
              </div>
            </div>
            
            {isReplying ? (
              <div className="space-y-6 pt-2">
                <div className="p-4 rounded-2xl bg-[#F7B980]/5 border border-[#F7B980]/10">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#F7B980" }}>Replying to message</p>
                   <p className="text-sm font-medium italic opacity-60 line-clamp-2" style={{ color: "#334155" }}>&quot;{selectedMessage.body}&quot;</p>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#64748B" }}>Your Narrative Response</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Draft your professional response..."
                    className="w-full px-6 py-5 bg-white border-2 rounded-[28px] outline-none transition-all font-medium text-base leading-relaxed focus:border-[#F7B980] shadow-inner resize-none min-h-[200px]"
                    style={{ borderColor: "#E2E8F0", color: "#334155" }}
                  />
                </div>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isSendingReply}
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]"
                >
                  {isSendingReply ? "Transmitting..." : "Send Response to Headquarters"}
                </Button>
              </div>
            ) : (
              <>
                <div className="p-6 rounded-[24px] border border-[#E2E8F0] relative overflow-hidden group shadow-inner" style={{ background: "rgba(249, 249, 249, 0.4)" }}>
                  <div className="text-sm font-medium whitespace-pre-wrap relative z-10 leading-relaxed" style={{ color: "#334155" }}>
                    {selectedMessage.body}
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7B980]/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                </div>

                {selectedMessage.replied && selectedMessage.replyMessage && (
                  <div className="p-5 rounded-[20px] border border-[#10B981]/20 bg-[#10B981]/5">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#10B981" }}>Your Reply (Sent)</p>
                    <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed" style={{ color: "#334155" }}>{selectedMessage.replyMessage}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {!selectedMessage.replied && (
                    <Button
                      onClick={() => setIsReplying(true)}
                      className="flex-[2] py-3.5 text-[9px] font-black tracking-[0.2em] uppercase"
                      size="lg"
                    >
                      Initiate Internal Reply
                    </Button>
                  )}
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => handleManageMessage("archive")}
                      title="Archive Correspondence"
                      className="flex-1 p-3 rounded-2xl transition-all border-2 border-[#E2E8F0] hover:bg-white hover:border-[#64748B]/20 hover:text-[#334155] flex justify-center items-center cursor-pointer"
                    >
                      <Archive className="w-5 h-5 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => handleManageMessage("delete")}
                      title="Delete Permanently"
                      className="flex-1 p-3 rounded-2xl transition-all border-2 border-[#E2E8F0] hover:bg-white hover:border-red-500/10 hover:text-red-500 flex justify-center items-center cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 opacity-40 text-red-500" />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-[9px] tracking-[0.2em] uppercase transition-all border-2 border-[#E2E8F0] hover:bg-white hover:border-[#F7B980]/20 hover:text-[#F7B980] cursor-pointer"
                    style={{ color: "#64748B" }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Application Details Modal */}
      <Modal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        type="info"
        closeActionLabel="CLOSE"
        maxWidth="max-w-3xl"
        align="left"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#E2E8F0] pb-6 -mt-2">
               <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-[24px] bg-[#F9F9F9] flex items-center justify-center shadow-md border border-[#E0E4E3]">
                    <Building2 className="w-8 h-8" style={{ color: "#64748B" }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: "#334155" }}>{selectedApplication.company}</h3>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em] mt-1" style={{ color: "#64748B" }}>{selectedApplication.title}</p>
                  </div>
               </div>
               <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${selectedApplication.color}`}>
                 {selectedApplication.status}
               </span>
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-[0.25em] mb-4 opacity-50" style={{ color: "#64748B" }}>Role Blueprint</h4>
                      <div className="p-5 md:p-6 rounded-[28px] bg-[#F9F9F9] border border-[#E0E4E3] relative overflow-hidden shadow-inner">
                        <p className="text-sm md:text-base font-medium leading-relaxed relative z-10" style={{ color: "#334155" }}>{selectedApplication.description}</p>
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#F7B980]/5 rounded-full blur-3xl -mr-16 -mb-16 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#F7B980]/5 to-transparent border border-[#F7B980]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#F7B980]/10">
                             <Video className="w-5 h-5 text-[#F7B980]" />
                          </div>
                          <div>
                             <p className="text-xs font-bold" style={{ color: "#334155" }}>Video Portfolio Linked</p>
                             <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest" style={{ color: "#64748B" }}>Verified Submission</p>
                          </div>
                       </div>
                       <button className="px-5 py-2 rounded-full bg-white text-[9px] font-black uppercase tracking-widest text-[#F7B980] border border-[#F7B980]/20 hover:bg-[#F7B980] hover:text-white transition-all shadow-sm cursor-pointer">Preview Reel</button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.25em] opacity-50" style={{ color: "#64748B" }}>Life Cycle</h4>
                    <div className="relative pl-7 space-y-8">
                       <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#E2E8F0]" />
                       {selectedApplication.timeline.map((item, i) => (
                         <div key={i} className="relative">
                           <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full border-[3px] border-white shadow-md" style={{ background: i === selectedApplication.timeline.length - 1 ? "#F7B980" : "#CBD5E1" }} />
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">{item.date}</p>
                           <p className="text-xs font-bold leading-tight" style={{ color: "#334155" }}>{item.event}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button className="flex-1 py-3.5 shadow-xl shadow-[#F7B980]/15 font-black text-[9px] uppercase tracking-[0.2em]" size="lg">
                  Recruiter Workspace
                </Button>
                <button 
                  className="flex-1 py-3.5 rounded-2xl font-bold text-[9px] tracking-[0.2em] uppercase transition-all border-2 border-[#E2E8F0] hover:bg-white hover:border-red-500/20 hover:text-red-500 cursor-pointer"
                  style={{ color: "#64748B" }}
                >
                  Withdraw Intent
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as Tab)}
        items={[
          { id: "profile", label: "ME", icon: UserCircle },
          { id: "jobs", label: "MATCH", icon: Search },
          { id: "applications", label: "PATH", icon: Briefcase },
          { id: "interviews", label: "INTERVIEW", icon: Calendar },
          { id: "messages", label: "INBOX", icon: Mail },
          { id: "settings", label: "CONTROL", icon: Settings },
        ]}
      />
      <div className="h-32 md:hidden" />
    </div>
  );
}

// Helpers System
const CustomOption = (props: OptionProps<{ value: string; label: string }, false>) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-3 px-4 py-3 hover:bg-[#E2E8F0] cursor-pointer transition-colors group">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.5rem", height: "1.5rem" }} className="rounded-sm shadow-sm" />
      <span className="font-bold text-sm group-hover:text-[#334155]" style={{ color: "#8A8C8E" }}>{props.data.label}</span>
    </div>
  );
};

const CustomSingleValue = (props: SingleValueProps<{ value: string; label: string }, false>) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-3 font-bold text-sm" style={{ color: "#334155" }}>
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.5rem", height: "1.5rem" }} className="rounded-sm shadow-sm" />
      <span>{props.data.label}</span>
    </div>
  );
};
