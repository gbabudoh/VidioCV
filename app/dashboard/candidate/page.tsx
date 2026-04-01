"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, LogOut, Bell, Search, MapPin, Briefcase, Video,
  Building2, UserCircle, Shield, Trash2,
  Mail, Lock, Plus, X, ChevronRight, Link as LinkIcon,
  Calendar as CalendarIcon, Archive, ArrowLeft, Calendar,
  Monitor, Smartphone
} from "lucide-react";
import MobileBottomNav from "@/app/components/common/MobileBottomNav";

// Helper components
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
    country?: string | null;
    companyType?: string | null;
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

  // Employer Filtering States
  const [employerSearchQuery, setEmployerSearchQuery] = useState("");
  const [employerFilterCountry, setEmployerFilterCountry] = useState("");
  const [employerFilterType, setEmployerFilterType] = useState("");

  const filteredEmployers = employers.filter((emp: Employer) => {
    const matchesSearch = emp.name.toLowerCase().includes(employerSearchQuery.toLowerCase());
    const matchesCountry = !employerFilterCountry || emp.country === employerFilterCountry;
    const matchesType = !employerFilterType || emp.companyType === employerFilterType;
    return matchesSearch && matchesCountry && matchesType;
  });

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
              <div className="bg-white border border-[gainsboro] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-white border border-[gainsboro] flex items-center justify-center text-black font-bold text-xl shrink-0">
                  {userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-slate-800 leading-tight">{userName}</h2>
                  <p className="text-sm text-slate-400 mt-0.5 truncate">{userRole}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Briefcase className="w-3.5 h-3.5" />
                      {experiences.length > 0 ? `${experiences.length} role${experiences.length !== 1 ? "s" : ""}` : "No experience added"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      Global / Remote
                    </span>
                  </div>
                </div>

                {/* KPI Stats */}
                <div className="flex gap-6 sm:gap-8 shrink-0">
                  {[
                    { label: "Views", value: dashboardStats.profileViews },
                    { label: "Applications", value: dashboardStats.activeApplications },
                    { label: "Interviews", value: dashboardStats.interviewInvites },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{stat.label}</p>
                    </div>
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
                   Sync Global VidioCV
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
              <div className="bg-white border border-[gainsboro] rounded-2xl p-6">
                {/* Header + tabs */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#F7B980]" />
                      Messages
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Employer inquiries and direct outreach</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    {(["inbox", "sent", "compose"] as const).map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setMessageSubTab(sub)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                          messageSubTab === sub
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inbox */}
                {messageSubTab === "inbox" && (
                  <div className="space-y-3">
                    {isLoadingMessages ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-3" />
                        <p className="text-slate-400 text-sm">Loading messages…</p>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessage(msg);
                            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
                          }}
                          className={`group flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all duration-200 cursor-pointer hover:shadow-md ${
                            msg.unread
                              ? "bg-white border-[#F7B980]/40 hover:border-[#F7B980]/60"
                              : "bg-white border-[gainsboro] hover:border-slate-300"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                            {msg.company.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#F7B980] transition-colors">
                                {msg.company}
                              </h4>
                              {msg.unread && <span className="w-2 h-2 rounded-full bg-[#F7B980] shrink-0" />}
                              {msg.replied && (
                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                                  Replied
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.subject}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-slate-400">{msg.time}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 rounded-2xl border border-dashed border-[gainsboro] bg-slate-50/50">
                        <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-600 mb-1">No messages yet</p>
                        <p className="text-xs text-slate-400">Employer inquiries will appear here.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sent */}
                {messageSubTab === "sent" && (
                  <div className="space-y-3">
                    {isLoadingSent ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-3" />
                        <p className="text-slate-400 text-sm">Loading sent messages…</p>
                      </div>
                    ) : sentMessages.length > 0 ? (
                      sentMessages.map((msg: DirectMessage) => (
                        <div
                          key={msg.id}
                          className="flex items-center gap-4 bg-white border border-[gainsboro] rounded-2xl px-5 py-4 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                            {msg.receiver.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 truncate">{msg.receiver.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{msg.subject || "No subject"}</p>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 rounded-2xl border border-dashed border-[gainsboro] bg-slate-50/50">
                        <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-600 mb-1">No sent messages</p>
                        <p className="text-xs text-slate-400">Messages you send will appear here.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Compose */}
                {messageSubTab === "compose" && (
                  <div className="space-y-5">
                    {/* Employer filter row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={employerSearchQuery}
                          onChange={(e) => setEmployerSearchQuery(e.target.value)}
                          placeholder="Search companies…"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                      </div>
                      <div className="relative sm:w-44">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={employerFilterCountry}
                          onChange={(e) => setEmployerFilterCountry(e.target.value)}
                          placeholder="Country…"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                      </div>
                      <select
                        value={employerFilterType}
                        onChange={(e) => setEmployerFilterType(e.target.value)}
                        className="sm:w-44 px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer"
                      >
                        <option value="">All industries</option>
                        <option value="Software & SaaS">Software & SaaS</option>
                        <option value="Fintech">Fintech</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="AI & Machine Learning">AI & ML</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                      </select>
                      {(employerSearchQuery || employerFilterCountry || employerFilterType) && (
                        <button
                          onClick={() => { setEmployerSearchQuery(""); setEmployerFilterCountry(""); setEmployerFilterType(""); }}
                          className="px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 border border-[gainsboro] rounded-xl bg-white transition-all cursor-pointer shrink-0"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* To + Subject row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">To</label>
                        <select
                          value={selectedRecipientId}
                          onChange={(e) => setSelectedRecipientId(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer"
                        >
                          <option value="">{filteredEmployers.length > 0 ? "Select a company…" : "No matches found"}</option>
                          {filteredEmployers.map((emp: Employer) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name}{emp.country ? ` · ${emp.country}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Subject <span className="text-slate-400">(optional)</span></label>
                        <input
                          type="text"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="e.g. Inquiry about open roles"
                          className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                      </div>
                    </div>

                    {/* Message body */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">Message</label>
                      <textarea
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Write your message here…"
                        className="w-full px-4 py-3 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all min-h-[180px] resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSendCompose}
                        disabled={!selectedRecipientId || !composeBody.trim() || isSendingDirect}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {isSendingDirect ? "Sending…" : "Send Message"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "profile" && (
              <div className="space-y-6">

                {/* VidioCV Section */}
                <div className="bg-white border border-[gainsboro] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#F7B980]" />
                        VidioCV
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Your 60-second video introduction shown to employers.</p>
                    </div>
                    <button
                      onClick={() => setShowVideoCreator(!showVideoCreator)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${showVideoCreator ? "border border-[gainsboro] text-slate-600 hover:bg-slate-50" : "bg-[#F7B980] hover:bg-[#F0A060] text-black"}`}
                    >
                      {showVideoCreator ? "Close Studio" : "Open Studio"}
                    </button>
                  </div>

                  {showVideoCreator ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="bg-slate-50 rounded-xl p-4 border border-[gainsboro]">
                        <VideoCreator
                          initialVideoUrl={activeVideoUrl || undefined}
                          onVideoUpload={async (_file, url, streamingUrl) => {
                            const finalUrl = streamingUrl || url;
                            if (finalUrl) {
                              setActiveVideoUrl(finalUrl);
                              try {
                                const response = await fetch("/api/profile/video/save", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                                  },
                                  body: JSON.stringify({ videoUrl: url, streamingUrl })
                                });
                                if (!response.ok) console.error("Failed to save video to profile database");
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
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 group">
                      <LiveKitPlayer src={activeVideoUrl} candidateName="Candidate" />
                      <button
                        onClick={() => {
                          setModalConfig({
                            isOpen: true,
                            title: "Delete VidioCV?",
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
                        className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowVideoCreator(true)}
                      className="w-full aspect-video rounded-xl border border-dashed border-[gainsboro] bg-slate-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-100 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white border border-[gainsboro] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Video className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600">No VidioCV yet</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click to open the studio and record your introduction</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills + Experience side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Skills */}
                  <div className="bg-white border border-[gainsboro] rounded-2xl p-6 flex flex-col gap-5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Skills</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Press Enter or click + to add</p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="e.g. Next.js"
                        className="flex-1 px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                      />
                      <button
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {skills.map((skill) => (
                          <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-slate-50 border border-[gainsboro] rounded-lg text-xs font-medium text-slate-600"
                          >
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {skills.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No skills added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="bg-white border border-[gainsboro] rounded-2xl p-6 flex flex-col gap-5">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Work Experience</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Add roles to your professional timeline</p>
                    </div>

                    {/* Add form */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({...newExperience, role: e.target.value})}
                        placeholder="Role / Position"
                        className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          placeholder="Company"
                          className="flex-1 px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                        <input
                          type="text"
                          value={newExperience.duration}
                          onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                          placeholder="Duration"
                          className="flex-1 px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                      </div>
                      <button
                        onClick={handleAddExperience}
                        disabled={!newExperience.role.trim() || !newExperience.company.trim()}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        Add to Profile
                      </button>
                    </div>

                    {/* Experience list */}
                    <div className="space-y-3">
                      <AnimatePresence>
                        {experiences.map((exp) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                              {exp.company.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{exp.role}</p>
                              <p className="text-xs text-slate-400 truncate">
                                {exp.company}{exp.duration ? ` · ${exp.duration}` : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {experiences.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No experience added yet</p>
                      )}
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
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-800">Global Job Search</h3>
                      <p className="text-sm text-slate-400 mt-1">Find your next role and apply instantly with your verified VidioCV.</p>
                    </div>
                    {!isLoadingJobs && (
                      <p className="text-xs font-semibold text-slate-400 shrink-0">
                        {filteredJobs.length} opportunit{filteredJobs.length !== 1 ? "ies" : "y"} found
                      </p>
                    )}
                  </div>

                  {/* Search + Filter row */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search roles or companies…"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[gainsboro] rounded-2xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#F7B980]/30 focus:border-[#F7B980]/60 transition-all"
                      />
                    </div>
                    <div className="relative sm:w-56 z-20">
                      <Select
                        options={countryOptions}
                        onChange={(newValue) => setSelectedCountry(newValue as SingleValue<{ value: string; label: string }>)}
                        value={selectedCountry}
                        isClearable
                        placeholder="Location…"
                        className="react-select-container text-left"
                        classNamePrefix="react-select"
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            minHeight: "46px",
                            height: "46px",
                            paddingLeft: "6px",
                            backgroundColor: "#FFFFFF",
                            borderColor: state.isFocused ? "#F7B980" : "gainsboro",
                            borderWidth: "1px",
                            borderRadius: "16px",
                            boxShadow: "none",
                            fontSize: "14px",
                            cursor: "pointer",
                            "&:hover": { borderColor: "#cbd5e1" }
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            height: "46px",
                            padding: "0 6px",
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "nowrap",
                          }),
                          indicatorsContainer: (base) => ({
                            ...base,
                            height: "46px",
                          }),
                          indicatorSeparator: () => ({ display: "none" }),
                          dropdownIndicator: (base) => ({
                            ...base,
                            color: "#94a3b8",
                            padding: "0 8px",
                            "&:hover": { color: "#64748b" }
                          }),
                          clearIndicator: (base) => ({
                            ...base,
                            color: "#94a3b8",
                            padding: "0 4px",
                            cursor: "pointer",
                            "&:hover": { color: "#64748b" }
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                            fontSize: "14px",
                            fontWeight: 400,
                            whiteSpace: "nowrap",
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "#fff",
                            borderRadius: "16px",
                            padding: "4px",
                            border: "1px solid gainsboro",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            marginTop: "6px",
                          }),
                          menuList: (base) => ({
                            ...base,
                            padding: 0,
                            maxHeight: "240px",
                            borderRadius: "12px",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#f1f5f9"
                              : state.isFocused
                              ? "#f8fafc"
                              : "transparent",
                            color: "#334155",
                            borderRadius: "10px",
                            cursor: "pointer",
                            padding: 0,
                          }),
                        }}
                      />
                    </div>
                  </div>

                  {/* Job list */}
                  {isLoadingJobs ? (
                    <div className="flex flex-col items-center justify-center py-24">
                      <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-4" />
                      <p className="text-slate-400 text-sm font-medium">Loading opportunities…</p>
                    </div>
                  ) : filteredJobs.length > 0 ? (
                    <div className="space-y-3">
                      {filteredJobs.map((job) => (
                        <div
                          key={job.id}
                          className="group bg-white border border-[gainsboro] rounded-2xl px-5 py-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-5"
                        >
                          {/* Company initial */}
                          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-base shrink-0">
                            {job.company.charAt(0).toUpperCase()}
                          </div>

                          {/* Job info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-[#F7B980] transition-colors">{job.title}</h4>
                              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">{job.salary}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{job.company}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-[gainsboro] px-2.5 py-1 rounded-lg">
                                <MapPin className="w-3 h-3" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-[gainsboro] px-2.5 py-1 rounded-lg">
                                <Briefcase className="w-3 h-3" /> {job.type}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                            >
                              Explore
                            </button>
                            <button
                              onClick={() => handleApply(job.id)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Submit VidioCV
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 rounded-2xl border border-dashed border-[gainsboro] bg-slate-50/50">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600 mb-1">No matching opportunities</p>
                      <p className="text-xs text-slate-400 mb-5">Try different keywords or clear your location filter.</p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedCountry(null); }}
                        className="px-5 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
          </div>
        </div>
      )}

            {activeTab === "applications" && (
              <div className="bg-white border border-[gainsboro] rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#F7B980]" />
                      Applications
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {applications.length} application{applications.length !== 1 ? "s" : ""} submitted
                    </p>
                  </div>
                </div>

                {/* List */}
                {applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setSelectedApplication(app)}
                        className="group flex items-center gap-4 bg-white border border-[gainsboro] rounded-2xl px-5 py-4 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        {/* Company initial */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                          {app.company.charAt(0).toUpperCase()}
                        </div>

                        {/* Job info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#F7B980] transition-colors">
                            {app.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {app.company} · {app.date}
                          </p>
                        </div>

                        {/* Status badge */}
                        <StatusBadge status={app.status} />

                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 rounded-2xl border border-dashed border-[gainsboro] bg-slate-50/50">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No applications yet</p>
                    <p className="text-xs text-slate-400">Jobs you apply to will appear here.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "interviews" && (
              <div className="bg-white border border-[gainsboro] rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#F7B980]" />
                      Interview Schedule
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {interviews.length} interview{interviews.length !== 1 ? "s" : ""} scheduled
                    </p>
                  </div>
                </div>

                {isLoadingInterviews ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#E2E8F0] border-t-[#F7B980] rounded-full animate-spin mb-3" />
                    <p className="text-slate-400 text-sm">Loading schedule…</p>
                  </div>
                ) : interviews.length > 0 ? (
                  <div className="space-y-3">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="group flex items-center gap-4 bg-white border border-[gainsboro] rounded-2xl px-5 py-4 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                      >
                        {/* Company initial */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm shrink-0">
                          {interview.company.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#F7B980] transition-colors">
                            {interview.company}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{interview.jobTitle}</p>
                        </div>

                        {/* Date + time */}
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-[gainsboro] px-2.5 py-1 rounded-lg">
                            <CalendarIcon className="w-3 h-3" />
                            {interview.date}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-[gainsboro] px-2.5 py-1 rounded-lg">
                            <Bell className="w-3 h-3" />
                            {interview.time}
                          </span>
                        </div>

                        {/* Type badge */}
                        <InterviewTypeBadge type={interview.type} />

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 rounded-2xl border border-dashed border-[gainsboro] bg-slate-50/50">
                    <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 mb-1">No interviews scheduled</p>
                    <p className="text-xs text-slate-400 mb-5">Apply to roles and employers will invite you here.</p>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="px-5 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
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
              <div className="bg-white border border-[gainsboro] rounded-2xl flex flex-col lg:flex-row overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-52 border-b lg:border-b-0 lg:border-r border-[gainsboro] p-4 flex flex-col gap-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1">Settings</p>
                  {[
                    { id: "general",       label: "Profile",       icon: UserCircle },
                    { id: "career",        label: "Career",        icon: Briefcase  },
                    { id: "security",      label: "Security",      icon: Shield     },
                    { id: "privacy",       label: "Privacy",       icon: Lock       },
                    { id: "notifications", label: "Notifications", icon: Bell       },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsSection(item.id as "general" | "career" | "security" | "privacy" | "notifications")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left text-xs font-medium ${
                        settingsSection === item.id
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </button>
                  ))}

                  <div className="mt-auto pt-4 border-t border-[gainsboro]">
                    <button
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={settingsSection}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-2xl space-y-8"
                    >
                      {settingsSection === "general" && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">Identity & Profile</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Manage your professional details and external links.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Full Name</label>
                              <input type="text" defaultValue={userName} className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 transition-all" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Phone</label>
                              <input type="tel" defaultValue="+1 (555) 782-0192" className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 transition-all" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Bio</label>
                              <textarea rows={4} defaultValue="Senior Software Engineer with a passion for high-fidelity UI/UX and scalable distributed systems." className="w-full px-3 py-3 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 transition-all resize-none leading-relaxed" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="text-xs font-semibold text-slate-800">External Links</h5>
                                <p className="text-xs text-slate-400">Connect your portfolio and professional profiles.</p>
                              </div>
                              <button className="p-1.5 rounded-lg border border-[gainsboro] hover:bg-slate-50 transition-all cursor-pointer">
                                <Plus className="w-3.5 h-3.5 text-slate-500" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {[
                                { label: "LinkedIn", val: "linkedin.com/in/johndoe" },
                                { label: "Portfolio", val: "johndoe.dev" },
                              ].map((link, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl">
                                  <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-slate-400 mb-0.5">{link.label}</p>
                                    <input type="text" defaultValue={link.val} className="w-full bg-transparent outline-none text-sm text-slate-700 font-medium" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsSection === "career" && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">Career Preferences</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Set your job match criteria and compensation expectations.</p>
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-xs font-medium text-slate-500">Work Preferences</h5>
                            <div className="divide-y divide-[gainsboro] border border-[gainsboro] rounded-xl overflow-hidden">
                              <div className="px-4 py-3 bg-white">
                                <Toggle enabled={prefs.remoteOnly} setEnabled={(val) => setPrefs({...prefs, remoteOnly: val})} label="Remote only" description="Only show remote opportunities" />
                              </div>
                              <div className="px-4 py-3 bg-white">
                                <Toggle enabled={prefs.openToRelocate} setEnabled={(val) => setPrefs({...prefs, openToRelocate: val})} label="Open to relocation" description="Willing to move for the right opportunity" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-medium text-slate-500">Expected Salary</h5>
                              <span className="text-sm font-semibold text-slate-800">${(prefs.expectedSalary / 1000).toFixed(0)}k / yr</span>
                            </div>
                            <input type="range" min="50000" max="300000" step="5000" value={prefs.expectedSalary} onChange={(e) => setPrefs({...prefs, expectedSalary: parseInt(e.target.value)})} className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-slate-800 bg-slate-200" />
                            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                              <span>$50k</span><span>$300k+</span>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-slate-500 mb-3">Target Sectors</h5>
                            <div className="flex flex-wrap gap-2">
                              {["FinTech", "HealthTech", "AI / ML", "Cybersecurity", "E-commerce", "SaaS", "Web3"].map(tag => (
                                <button key={tag} className="px-3 py-1.5 rounded-lg border border-[gainsboro] text-xs font-medium text-slate-600 bg-white hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all cursor-pointer">{tag}</button>
                              ))}
                              <button className="px-3 py-1.5 rounded-lg border border-dashed border-[gainsboro] text-xs font-medium text-slate-400 hover:text-slate-600 hover:border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all">
                                <Plus className="w-3 h-3" /> Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {settingsSection === "notifications" && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Choose what alerts you receive.</p>
                          </div>
                          <div className="divide-y divide-[gainsboro] border border-[gainsboro] rounded-xl overflow-hidden">
                            {[
                              { icon: Mail,   label: "Email updates",        desc: "Weekly digests and important account activity.",  enabled: prefs.emailAlerts,   key: "emailAlerts"   },
                              { icon: Bell,   label: "Browser notifications", desc: "Instant push alerts for recruiter inquiries.",    enabled: prefs.browserAlerts, key: "browserAlerts" },
                              { icon: Shield, label: "Recruiter inquiries",   desc: "Allow employers to contact you directly.",        enabled: prefs.jobInvites,    key: "jobInvites"    },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-4 px-4 py-3.5 bg-white">
                                <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="flex-1">
                                  <Toggle enabled={item.enabled} setEnabled={(val) => setPrefs({...prefs, [item.key]: val})} label={item.label} description={item.desc} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {settingsSection === "privacy" && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">Privacy</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Control your video CV visibility and data.</p>
                          </div>
                          <div className="divide-y divide-[gainsboro] border border-[gainsboro] rounded-xl overflow-hidden">
                            <div className="px-4 py-3.5 bg-white">
                              <Toggle enabled={prefs.videoPublic} setEnabled={(val) => setPrefs({...prefs, videoPublic: val})} label="Public VidioCV" description="Make your video resume visible to employers on the network." />
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3.5 bg-white border border-red-100 rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-slate-800">Delete VidioCV</p>
                              <p className="text-xs text-slate-400 mt-0.5">Permanently remove your video resume from your profile.</p>
                            </div>
                            <button className="px-4 py-2 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer shrink-0">Delete</button>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3.5 bg-white border border-red-100 rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-slate-800">Deactivate Account</p>
                              <p className="text-xs text-slate-400 mt-0.5">Permanently delete your profile and all associated data.</p>
                            </div>
                            <button onClick={() => setIsLogoutModalOpen(true)} className="px-4 py-2 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer shrink-0">Deactivate</button>
                          </div>
                        </div>
                      )}

                      {settingsSection === "security" && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">Security</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Manage your password, email, and active sessions.</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Password</label>
                              <div className="relative">
                                <input type="password" defaultValue="********" disabled className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 pr-20" />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#F7B980] hover:text-[#F0A060] transition-colors cursor-pointer">Change</button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Email</label>
                              <div className="relative">
                                <input type="email" defaultValue="johndoe@example.com" disabled className="w-full px-3 py-2.5 bg-white border border-[gainsboro] rounded-xl outline-none text-sm text-slate-700 pr-20" />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#F7B980] hover:text-[#F0A060] transition-colors cursor-pointer">Update</button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-xs font-medium text-slate-500">Active Sessions</h5>
                              <button className="text-xs font-medium text-red-400 hover:text-red-500 transition-colors cursor-pointer">Disconnect all</button>
                            </div>
                            <div className="space-y-2">
                              {[
                                { device: "MacBook Pro M2", location: "San Francisco, US", time: "Active now",  current: true,  Icon: Monitor    },
                                { device: "iPhone 15 Pro",  location: "Austin, TX",         time: "2 hours ago", current: false, Icon: Smartphone },
                              ].map((session, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white border border-[gainsboro] rounded-xl">
                                  <session.Icon className="w-4 h-4 text-slate-400 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{session.device}</p>
                                    <p className="text-xs text-slate-400">{session.location} · {session.time}</p>
                                  </div>
                                  <div className="shrink-0">
                                    {session.current ? (
                                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-medium">Current</span>
                                    ) : (
                                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
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
          label: "Submit VidioCV",
          onClick: () => {
             setModalConfig({
               isOpen: true,
               title: "Application Synced",
               message: "Your VidioCV has been successfully transmitted to " + selectedJob?.company + ". Good luck!",
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
                             <p className="text-xs font-bold" style={{ color: "#334155" }}>VidioCV Presence Established</p>
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
function InterviewTypeBadge({ type }: { type: string }) {
  const t = type.toLowerCase();
  const styles =
    t.includes("video") || t.includes("remote")
      ? "bg-blue-50 text-blue-600 border-blue-100"
      : t.includes("onsite") || t.includes("in-person")
      ? "bg-violet-50 text-violet-600 border-violet-100"
      : t.includes("phone")
      ? "bg-slate-50 text-slate-500 border-slate-200"
      : "bg-amber-50 text-amber-600 border-amber-100";
  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 ${styles}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
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
    <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 ${styles}`}>
      {status}
    </span>
  );
}

const CustomOption = (props: OptionProps<{ value: string; label: string }, false>) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0 }} className="rounded-sm" />
      <span className="text-sm text-slate-600 truncate">{props.data.label}</span>
    </div>
  );
};

const CustomSingleValue = (props: SingleValueProps<{ value: string; label: string }, false>) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-2 text-sm text-slate-700">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0 }} className="rounded-sm" />
      <span className="truncate">{props.data.label}</span>
    </div>
  );
};
