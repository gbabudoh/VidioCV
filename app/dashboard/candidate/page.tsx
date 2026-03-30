"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, LogOut, Bell, Search, MapPin, Briefcase, Video, 
  Building2, UserCircle, Shield, Trash2, 
  Mail, Lock, Plus, X, ChevronRight, Link as LinkIcon
} from "lucide-react";

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
import Modal from "@/app/components/common/Modal";
import Toggle from "@/app/components/common/Toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    subject: string;
    preview: string;
    body: string;
    time: string;
    unread: boolean;
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
    expectedSalary: string;
  }

  // Detailed Settings States
  const [prefs, setPrefs] = useState<UserPreferences>({
    emailAlerts: true,
    browserAlerts: true,
    jobInvites: true,
    videoPublic: true,
    remoteOnly: false,
    openToRelocate: true,
    expectedSalary: "120k - 150k"
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      company: "TechNova Solutions",
      sender: "Sarah Jenkins (Senior Recruiter)",
      subject: "Regarding your application for Senior React Developer",
      preview: "Hello John, we were really impressed by your Video CV! We'd like to schedule a quick...",
      body: `Hello John,\n\nWe were really impressed by your Video CV and your background in React and TypeScript! Your projects showcase a high level of expertise that aligns perfectly with what we're looking for at TechNova Solutions.\n\nWe would like to schedule a quick 15-minute introductory call to discuss the Senior React Developer role and learn more about your career goals.\n\nPlease let us know your availability for later this week.\n\nBest regards,\nSarah Jenkins\nSenior Recruiter @ TechNova`,
      time: "2h ago",
      unread: true
    },
    {
      id: "2",
      company: "Global Stream Inc.",
      sender: "Mark Williams (Hiring Manager)",
      subject: "Interview Invitation",
      preview: "Hi John, we've reviewed your profile and would like to invite you for a first round interview...",
      body: `Hi John,\n\nAfter reviewing your profile and Video CV, our team at Global Stream Inc. is excited to invite you for a first-round technical interview.\n\nThe interview will focus on your experience with system design and frontend performance optimization. It will be a 60-minute video call.\n\nAre you available on Monday next week at 10:00 AM PST?\n\nLooking forward to hearing from you,\nMark Williams\nHiring Manager`,
      time: "Yesterday",
      unread: false
    },
    {
      id: "3",
      company: "CreativeFlow",
      sender: "Emily Chen (Lead Designer)",
      subject: "Follow up on your recent inquiry",
      preview: "Thanks for reaching out! Regarding the remote policy at CreativeFlow...",
      body: `Hi John,\n\nThanks for reaching out and for your interest in CreativeFlow! \n\nRegarding the remote policy: Yes, we are a "Remote First" company. We have optional hub offices in London and New York, but there is no requirement for in-office presence. We also provide a stipend for your home office setup.\n\nLet me know if you have any other questions!\n\nCheers,\nEmily Chen\nLead Designer`,
      time: "3 days ago",
      unread: false
    }
  ]);
  
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

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e.type === 'click' || (e as React.KeyboardEvent).key === 'Enter') && newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Experience State
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", role: "Senior Developer", company: "TechNova Inc.", duration: "2021 - Present • 3 yrs" },
    { id: "2", role: "Full Stack Developer", company: "StartUp Flow", duration: "2018 - 2021 • 3 yrs" }
  ]);
  const [newExperience, setNewExperience] = useState({ role: "", company: "", duration: "" });

  const handleAddExperience = () => {
    if (newExperience.role.trim() && newExperience.company.trim()) {
      setExperiences([...experiences, { ...newExperience, id: Date.now().toString() }]);
      setNewExperience({ role: "", company: "", duration: "" });
    }
  };

  const handleRemoveExperience = (idToRemove: string) => {
    setExperiences(experiences.filter(exp => exp.id !== idToRemove));
  };

  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior Full Stack Engineer",
      company: "TechNova Solutions",
      countryCode: "US",
      location: "San Francisco, CA (Remote)",
      type: "Full-time",
      salary: "$140k - $180k",
      description: "We are looking for an experienced Full Stack Engineer to lead the development of our core platform. You will be working with React, TypeScript, Node.js, and AWS to build highly scalable microservices.",
    },
    {
      id: "2",
      title: "Product Designer",
      company: "CreativeFlow",
      countryCode: "GB",
      location: "London, UK",
      type: "Full-time",
      salary: "£70k - £90k",
      description: "Join our dynamic design team to create stunning user experiences. You'll be responsible for end-to-end product design, wireframing, prototyping, and working closely with engineers.",
    },
    {
      id: "3",
      title: "Frontend Developer (React)",
      company: "Pinnacle Software",
      countryCode: "DE",
      location: "Berlin, Germany",
      type: "Contract",
      salary: "€80k - €100k",
      description: "We need a React specialist to help us revamp our main web application. Experience with Next.js, Framer Motion, and TailwindCSS is highly required for this 6-month contract role.",
    },
    {
      id: "4",
      title: "Backend Go Developer",
      company: "ScaleTech",
      countryCode: "CA",
      location: "Toronto, Canada",
      type: "Full-time",
      salary: "$120k - $150k CAD",
      description: "ScaleTech is migrating from Python to Go. We need strong Go developers to write performant microservices, handle concurrent data pipelines, and scale our cloud infrastructure on GCP.",
    },
  ];

  const filteredJobs = mockJobs.filter((job) => {
    const matchesCountry = selectedCountry ? job.countryCode === selectedCountry.value : true;
    const matchesQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
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
        background: "linear-gradient(135deg, #F2F4F4 0%, #F9F9F9 45%, #F9F5F1 100%)",
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
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <Link href="/" className="flex items-center group cursor-pointer">
            <Image
              src="/logo.png"
              alt="VidioCV Logo"
              width={110}
              height={48}
              className="object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <span 
               className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border shadow-sm"
               style={{ 
                 background: "rgba(255,255,255,0.8)", 
                 borderColor: "#E0E4E3", 
                 color: "#ACBAC4" 
               }}
             >
                 Candidate Workspace
             </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("notifications")} 
              className="p-2.5 rounded-xl transition-all hover:bg-[#F2F4F4] group cursor-pointer"
              style={{ color: "#ACBAC4" }}
            >
              <Bell className="w-5 h-5 group-hover:text-[#57595B] transition-colors" />
            </button>
            <button 
              onClick={() => setActiveTab("settings")} 
              className="p-2.5 rounded-xl transition-all hover:bg-[#F2F4F4] group cursor-pointer"
              style={{ color: "#ACBAC4" }}
            >
              <Settings className="w-5 h-5 group-hover:text-[#57595B] transition-colors" />
            </button>
            <div className="h-6 w-px bg-[#E0E4E3] mx-1" />
            <button 
              onClick={() => setIsLogoutModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold text-sm cursor-pointer"
              style={{ 
                background: "#FFFFFF", 
                border: "1px solid #E0E4E3", 
                color: "#EF4444",
                boxShadow: "0 2px 8px rgba(239,68,68,0.05)"
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = "#FEF2F2";
                e.currentTarget.style.borderColor = "#FCA5A5";
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.borderColor = "#E0E4E3";
              }}
            >
              <LogOut className="w-4 h-4" /> 
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10 font-sans">
        <AnimatePresence mode="wait">
          {activeTab !== "settings" ? (
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
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#57595B" }}>{userName}</h2>
            <p className="font-semibold text-sm mb-6 px-4 py-1 rounded-full" style={{ background: "#F2F4F4", color: "#ACBAC4" }}>{userRole}</p>
            <div className="w-full space-y-4 text-sm text-left px-2">
              <div className="flex items-center gap-4 py-3 border-b border-[#F2F4F4]">
                <div className="p-2 rounded-xl" style={{ background: "rgba(172,186,196,0.1)" }}>
                  <MapPin className="w-4 h-4" style={{ color: "#ACBAC4" }} />
                </div>
                <span className="font-medium" style={{ color: "#8A8C8E" }}>Global / Remote</span>
              </div>
              <div className="flex items-center gap-4 py-3">
                <div className="p-2 rounded-xl" style={{ background: "rgba(172,186,196,0.1)" }}>
                  <Briefcase className="w-4 h-4" style={{ color: "#ACBAC4" }} />
                </div>
                <span className="font-medium" style={{ color: "#8A8C8E" }}>5+ years experience</span>
              </div>
            </div>
          </motion.div>

          {/* KPI Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Profile Views", value: "342", color: "from-[#8A8C8E] to-[#ACBAC4]" },
              { label: "Active Applications", value: "12", color: "from-[#F7B980] to-[#F0A060]" },
              { label: "Interview Invites", value: "4", color: "from-[#57595B] to-[#8A8C8E]" },
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
                <p className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: "#ACBAC4" }}>{stat.label}</p>
                <p className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.color} tracking-tighter`}>
                  {stat.value}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold" style={{ color: "#10B981" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  +12% vs last month
                </div>
              </motion.div>
            ))}
          </div>
          </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-3 text-sm font-bold mb-3" style={{ color: "#ACBAC4" }}>
                  <button onClick={() => setActiveTab("profile")} className="hover:text-[#F7B980] transition-colors cursor-pointer">Dashboard</button>
                  <ChevronRight className="w-4 h-4" />
                  <span style={{ color: "#57595B" }}>Workspace Settings</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight" style={{ color: "#57595B" }}>Account Workspace</h1>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setActiveTab("profile")} className="px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all hover:bg-[#F2F4F4] cursor-pointer" style={{ borderColor: "#E0E4E3", color: "#8A8C8E" }}>
                   Discard Changes
                 </button>
                 <Button onClick={() => setSuccessMessage({ title: "Workspace Synced", message: "All your global preferences and security protocols have been successfully localized." })} size="lg" className="px-10 shadow-lg shadow-[#F7B980]/20">
                   Sync Global Preferences
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== "settings" && (
          <div className="flex gap-2 mb-10 p-1.5 rounded-2xl max-w-fit overflow-x-auto border border-white shadow-lg" style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(10px)" }}>
            {(["profile", "jobs", "applications", "interviews", "messages", "settings"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-8 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-500 cursor-pointer whitespace-nowrap"
                style={activeTab === tab ? {
                  background: "#57595B",
                  color: "#FFFFFF",
                  boxShadow: "0 8px 20px rgba(87,89,91,0.2)"
                } : {
                  color: "#ACBAC4"
                }}
                onMouseOver={e => {
                  if(activeTab !== tab) {
                    e.currentTarget.style.color = "#57595B";
                    e.currentTarget.style.background = "rgba(255,255,255,0.5)";
                  }
                }}
                onMouseOut={e => {
                  if(activeTab !== tab) {
                    e.currentTarget.style.color = "#ACBAC4";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {tab === "jobs" ? "Global Search" : tab}
              </button>
            ))}
          </div>
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
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#F2F4F4]">
                    <h3 className="text-3xl font-bold flex items-center gap-4" style={{ color: "#57595B" }}>
                      <div className="p-2.5 rounded-2xl bg-[#F7B980]/10">
                        <Mail className="w-7 h-7 text-[#F7B980]" />
                      </div>
                      Communications
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {messages.map((msg) => (
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
                            style={{ background: "#F2F4F4", color: "#F7B980" }}
                          >
                            {msg.company.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-base transition-colors group-hover:text-[#F7B980]" style={{ color: "#57595B" }}>
                              {msg.company}
                              {msg.unread && <span className="ml-3 inline-block w-2 h-2 rounded-full bg-[#F7B980]" />}
                            </h4>
                            <p className="text-sm font-medium" style={{ color: "#ACBAC4" }}>{msg.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ACBAC4" }}>{msg.time}</p>
                          <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "#57595B" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-10 border-t border-[#F2F4F4] text-center">
                    <button className="text-sm font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer" style={{ color: "#57595B" }}>
                      Archive History
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Video CV Section */}
                <div 
                  className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.7)", 
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-10 mb-10 border-b border-[#F2F4F4]">
                    <div className="mb-6 md:mb-0">
                      <h3 className="text-3xl font-bold mb-3 flex items-center gap-4" style={{ color: "#57595B" }}>
                        <div className="p-2.5 rounded-2xl bg-[#F7B980]/10">
                          <Video className="w-7 h-7 text-[#F7B980]" />
                        </div>
                        Video Portfolio
                      </h3>
                      <p className="max-w-xl text-base font-medium" style={{ color: "#ACBAC4" }}>
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
                           onVideoUpload={(file, url) => {
                             console.log("Uploaded:", file.name);
                             if (url) setActiveVideoUrl(url);
                             setShowVideoCreator(false);
                           }} 
                           onVideoDelete={() => setActiveVideoUrl(null)}
                        />
                      </div>
                    </motion.div>
                  ) : activeVideoUrl ? (
                    <div className="w-full aspect-video md:aspect-[21/9] bg-[#57595B] rounded-[32px] border-4 border-white overflow-hidden relative shadow-2xl group">
                        <video
                          src={activeVideoUrl}
                          controls
                          className="w-full h-full absolute inset-0 object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                          title="Video CV"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#57595B]/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
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
                          className="absolute top-6 right-6 bg-red-500/90 hover:bg-red-600 text-white p-3.5 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-xl opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                    </div>
                  ) : (
                    <div 
                      className="w-full aspect-video md:aspect-[21/9] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center text-center p-12 group transition-all cursor-pointer" 
                      style={{ background: "#F9F9F9", borderColor: "#E0E4E3" }}
                      onClick={() => setShowVideoCreator(true)}
                    >
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform cursor-pointer border border-[#E0E4E3]">
                        <PlayIcon className="w-10 h-10 translate-x-1" style={{ color: "#F7B980" }} />
                      </div>
                      <h4 className="text-2xl font-bold mb-3" style={{ color: "#57595B" }}>Bring your profile to life</h4>
                      <p className="max-w-md font-medium" style={{ color: "#ACBAC4" }}>You haven&apos;t added a Video CV yet. Launch the studio to record your 60-second elevator pitch.</p>
                      <button 
                        className="mt-8 px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
                        style={{ background: "#57595B", color: "white" }}
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
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ color: "#57595B" }}>
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
                        style={{ borderColor: "#E0E4E3", color: "#57595B" }}
                      />
                      <button 
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="p-3 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                        style={{ background: "#57595B", color: "white" }}
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
                              className="p-1 hover:bg-[#F2F4F4] rounded-lg text-[#ACBAC4] hover:text-[#EF4444] transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {skills.length === 0 && (
                        <span className="text-sm font-medium italic" style={{ color: "#ACBAC4" }}>Define your stack...</span>
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
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3" style={{ color: "#57595B" }}>
                      Work Experience
                    </h4>
                    
                    {/* Add Experience Form */}
                    <div className="p-6 rounded-[24px] border border-dashed mb-10 space-y-4" style={{ background: "rgba(242, 244, 244, 0.4)", borderColor: "#E0E4E3" }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#ACBAC4" }}>Add New Milestone</p>
                      <input 
                        type="text" 
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({...newExperience, role: e.target.value})}
                        placeholder="Role / Position" 
                        className="w-full px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium mb-2"
                        style={{ borderColor: "#E0E4E3", color: "#57595B" }}
                      />
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          placeholder="Company" 
                          className="flex-1 px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                          style={{ borderColor: "#E0E4E3", color: "#57595B" }}
                        />
                        <input 
                          type="text" 
                          value={newExperience.duration}
                          onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                          placeholder="Duration" 
                          className="flex-1 px-5 py-3 bg-white border rounded-2xl outline-none transition-all text-sm font-medium"
                          style={{ borderColor: "#E0E4E3", color: "#57595B" }}
                        />
                      </div>
                      <button 
                        onClick={handleAddExperience}
                        disabled={!newExperience.role.trim() || !newExperience.company.trim()}
                        className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                        style={{ background: "#57595B", color: "white" }}
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
                                background: "linear-gradient(135deg, #F9F9F9, #F2F4F4)", 
                                border: "1px solid #E0E4E3",
                                color: "#F7B980" 
                              }}
                            >
                              {exp.company.substring(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 pr-10">
                              <p className="font-bold text-lg leading-tight mb-1" style={{ color: "#57595B" }}>{exp.role}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-xs uppercase tracking-wider" style={{ color: "#F7B980" }}>{exp.company}</span>
                                <span className="w-1 h-1 rounded-full bg-[#E0E4E3]" />
                                <span className="text-xs font-semibold" style={{ color: "#ACBAC4" }}>{exp.duration}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-2 text-[#ACBAC4] hover:text-[#EF4444] transition-all cursor-pointer"
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
                  className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                  style={{ 
                    background: "rgba(255, 255, 255, 0.7)", 
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                  }}
                >
                  <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-3" style={{ color: "#57595B" }}>Global Job Search</h3>
                    <p className="font-medium text-base" style={{ color: "#ACBAC4" }}>Find your dream role and instantly apply using your verified Video Portfolio.</p>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[#F7B980]" style={{ color: "#ACBAC4" }}>
                        <Search className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search roles or companies..."
                        className="w-full pl-14 pr-6 py-4 bg-white border rounded-[20px] outline-none transition-all font-medium"
                        style={{ borderColor: "#E0E4E3", color: "#57595B" }}
                      />
                    </div>
                    <div className="relative z-20">
                      <Select
                        options={countryOptions}
                        onChange={(newValue) => setSelectedCountry(newValue as SingleValue<{ value: string; label: string }>)}
                        value={selectedCountry}
                        isClearable
                        placeholder="Filter by Location..."
                        className="react-select-container text-left font-medium"
                        classNamePrefix="react-select"
                        components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            height: "56px",
                            paddingLeft: "8px",
                            backgroundColor: "#FFFFFF",
                            borderColor: state.isFocused ? "#F7B980" : "#E0E4E3",
                            borderRadius: "20px",
                            boxShadow: "none",
                            "&:hover": { borderColor: "#F7B980" }
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            backdropFilter: "blur(20px)",
                            borderRadius: "20px",
                            padding: "8px",
                            border: "1px solid #E0E4E3",
                            boxShadow: "0 10px 30px rgba(87,89,91,0.1)"
                          }),
                        }}
                      />
                    </div>
                  </div>

                  {/* Job List */}
                  <div className="space-y-6">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="group bg-white/40 border-2 rounded-[32px] p-8 transition-all hover:bg-white hover:border-[#F7B980]/30 hover:shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden"
                          style={{ borderColor: "rgba(224, 228, 227, 0.5)" }}
                        >
                          <div className="flex gap-6 items-start z-10">
                            <div 
                              className="w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 shadow-lg"
                              style={{ background: "#F9F9F9", border: "1px solid #E0E4E3" }}
                            >
                               <Building2 className="w-8 h-8" style={{ color: "#ACBAC4" }} />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold mb-1 transition-colors group-hover:text-[#F7B980]" style={{ color: "#57595B" }}>{job.title}</h4>
                              <p className="font-bold text-sm tracking-wide mb-4" style={{ color: "#ACBAC4" }}>{job.company.toUpperCase()}</p>
                              <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider" style={{ color: "#8A8C8E" }}>
                                <span className="flex items-center gap-2 bg-[#F2F4F4] px-3 py-1.5 rounded-lg"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                                <span className="flex items-center gap-2 bg-[#F2F4F4] px-3 py-1.5 rounded-lg"><Briefcase className="w-3.5 h-3.5" /> {job.type}</span>
                                <span className="bg-[#10B981]/10 text-[#10B981] px-3 py-1.5 rounded-lg">{job.salary}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
                            <button 
                              onClick={() => setSelectedJob(job)} 
                              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:bg-[#F2F4F4] cursor-pointer"
                              style={{ background: "transparent", color: "#57595B", border: "1px solid #E0E4E3" }}
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
                      ))
                    ) : (
                      <div 
                        className="text-center py-24 rounded-[32px] border-2 border-dashed flex flex-col items-center" 
                        style={{ borderColor: "#E0E4E3", background: "rgba(249, 249, 249, 0.4)" }}
                        onClick={() => { setSearchQuery(""); setSelectedCountry(null); }}
                      >
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl border border-[#E0E4E3]">
                          <Search className="w-10 h-10" style={{ color: "#ACBAC4" }} />
                        </div>
                        <p className="text-xl font-bold mb-2" style={{ color: "#57595B" }}>No matching opportunities</p>
                        <p className="font-medium mb-8" style={{ color: "#ACBAC4" }}>Try adjusting your filters or search terms.</p>
                        <button 
                          onClick={() => { setSearchQuery(""); setSelectedCountry(null); }} 
                          className="font-bold text-sm underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                          style={{ color: "#57595B" }}
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div 
                className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                <h3 className="text-3xl font-bold mb-10 flex items-center gap-4" style={{ color: "#57595B" }}>
                  <div className="p-2.5 rounded-2xl bg-[#F7B980]/10">
                    <Briefcase className="w-7 h-7 text-[#F7B980]" />
                  </div>
                  Applied Opportunities
                </h3>
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedApplication(app)}
                      className="bg-white/40 border-2 border-transparent rounded-[32px] p-8 transition-all hover:bg-white hover:border-[#F7B980]/30 hover:shadow-2xl flex flex-col md:flex-row justify-between md:items-center gap-6 cursor-pointer group"
                      style={{ background: "rgba(255, 255, 255, 0.4)", border: "1px solid #E0E4E3" }}
                    >
                      <div>
                        <h4 className="text-xl font-bold mb-1 group-hover:text-[#F7B980] transition-colors" style={{ color: "#57595B" }}>{app.title}</h4>
                        <p className="font-bold text-sm" style={{ color: "#ACBAC4" }}>{app.company} <span className="mx-2">•</span> {app.date}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${app.color}`}>
                          {app.status}
                        </span>
                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "#57595B" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "interviews" && (
              <div 
                className="border border-white rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden text-center py-32"
                style={{ 
                  background: "rgba(255, 255, 255, 0.7)", 
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 64px rgba(87,89,91,0.06)"
                }}
              >
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl border border-[#F2F4F4]">
                   <Bell className="w-10 h-10" style={{ color: "#F7B980" }} />
                 </div>
                 <h3 className="text-2xl font-bold mb-4" style={{ color: "#57595B" }}>Ready for the spotlight?</h3>
                 <p className="max-w-md mx-auto font-medium" style={{ color: "#ACBAC4" }}>Your upcoming interview schedule is currently clear. Keep your portfolio updated to attract global hiring teams.</p>
                 <button onClick={() => setActiveTab("jobs")} className="mt-10 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-xl hover:-translate-y-1 active:scale-95" style={{ background: "#57595B", color: "white" }}>
                   Browse Roles
                 </button>
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
                <h3 className="text-3xl font-bold mb-10" style={{ color: "#57595B" }}>Alerts & Activity</h3>
                <div className="space-y-6">
                  <div className="bg-white/40 border border-[#E0E4E3] rounded-[32px] p-8 flex items-start gap-6 transition-all hover:bg-white cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: "#F2F4F4" }}>
                      <Bell className="w-6 h-6 text-[#F7B980]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold" style={{ color: "#57595B" }}>Welcome to VidioCV</h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ACBAC4" }}>Just now</span>
                      </div>
                      <p className="font-medium text-base" style={{ color: "#ACBAC4" }}>Your account is verified. Start by customizing your profile and recording your first intro.</p>
                    </div>
                  </div>
                </div>
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
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#F2F4F4]/60 p-10 space-y-3">
                   <div className="mb-10 px-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#ACBAC4" }}>Configuration</p>
                     <h3 className="text-xl font-bold" style={{ color: "#57595B" }}>Workspace</h3>
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
                       className={`w-full flex items-center gap-5 px-6 py-5 rounded-[28px] transition-all cursor-pointer group text-left`}
                       style={settingsSection === item.id ? {
                         background: "white",
                         color: "#F7B980",
                         boxShadow: "0 12px 32px rgba(247,185,128,0.15)"
                       } : {
                         color: "#ACBAC4",
                       }}
                     >
                       <div className={`p-3 rounded-2xl transition-colors ${settingsSection === item.id ? "bg-[#F7B980]/10 text-[#F7B980]" : "bg-[#F2F4F4] text-[#ACBAC4] group-hover:text-[#57595B]"}`}>
                         <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-sm leading-tight">{item.label}</p>
                         <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                       </div>
                     </button>
                   ))}

                   <div className="pt-10 mt-10 border-t border-[#F2F4F4] px-4">
                      <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-3 text-red-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all group cursor-pointer">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out Workspace
                      </button>
                   </div>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 p-10 lg:p-20 overflow-y-auto bg-white/30">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={settingsSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-4xl mx-auto space-y-16"
                      >
                        {settingsSection === "general" && (
                          <div className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#F2F4F4]">
                               <div>
                                 <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#57595B" }}>Identity & Presence</h3>
                                 <p className="font-medium text-base leading-relaxed" style={{ color: "#ACBAC4" }}>Manage your global professional footprint and verified identifier.</p>
                               </div>
                               <div className="flex -space-x-3">
                                  {[1,2,3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F2F4F4] flex items-center justify-center text-[10px] font-bold" style={{ color: "#ACBAC4" }}>
                                      {i===3 ? "+4" : "JD"}
                                    </div>
                                  ))}
                               </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#ACBAC4" }}>Legal Identifier</label>
                                <input type="text" defaultValue={userName} className="w-full px-8 py-5 bg-white border-2 rounded-3xl outline-none transition-all font-bold focus:border-[#F7B980] shadow-sm" style={{ borderColor: "#F2F4F4", color: "#57595B" }} />
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#ACBAC4" }}>Main Connection</label>
                                <input type="tel" defaultValue="+1 (555) 782-0192" className="w-full px-8 py-5 bg-white border-2 rounded-3xl outline-none transition-all font-bold focus:border-[#F7B980] shadow-sm" style={{ borderColor: "#F2F4F4", color: "#57595B" }} />
                              </div>
                              <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#ACBAC4" }}>Professional Narrative</label>
                                <textarea rows={5} defaultValue="Senior Software Engineer with a passion for high-fidelity UI/UX and scalable distributed systems. Currently optimizing video delivery at scale." className="w-full px-8 py-6 bg-white border-2 rounded-[32px] outline-none transition-all font-medium text-lg leading-relaxed focus:border-[#F7B980] shadow-sm resize-none" style={{ borderColor: "#F2F4F4", color: "#57595B" }} />
                              </div>
                            </div>

                            <div className="pt-4 space-y-10">
                                <div>
                                  <h4 className="text-xl font-bold mb-2" style={{ color: "#57595B" }}>Ecosystem Hub</h4>
                                  <p className="text-sm font-medium" style={{ color: "#ACBAC4" }}>Connect your external professional nodes for deeper verification.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                  {[
                                    { label: "LinkedIn Domain", val: "linkedin.com/in/johndoe", icon: LinkIcon },
                                    { label: "Architecture Portfolio", val: "johndoe.dev", icon: LinkIcon }
                                  ].map((hub, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-[28px] bg-white border border-[#F2F4F4] shadow-sm group hover:border-[#F7B980] transition-all">
                                      <div className="p-3 rounded-2xl bg-[#F2F4F4] text-[#ACBAC4] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors">
                                        <hub.icon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#ACBAC4" }}>{hub.label}</p>
                                        <input type="text" defaultValue={hub.val} className="w-full bg-transparent outline-none font-bold text-sm" style={{ color: "#57595B" }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "career" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#F2F4F4]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#57595B" }}>Career Strategy</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#ACBAC4" }}>Configure your employment mobility and signal your availability to the network.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                               <div className="space-y-8">
                                  <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] mb-6 block" style={{ color: "#ACBAC4" }}>Mobility Protocols</label>
                                    <div className="space-y-6">
                                      <Toggle 
                                        enabled={prefs.remoteOnly} 
                                        setEnabled={(val) => setPrefs({...prefs, remoteOnly: val})} 
                                        label="Remote Operations" 
                                        description="Prioritize opportunities with distributed workspace culture."
                                      />
                                      <Toggle 
                                        enabled={prefs.openToRelocate} 
                                        setEnabled={(val) => setPrefs({...prefs, openToRelocate: val})} 
                                        label="Global Relocation" 
                                        description="Willing to move for the right high-impact mission."
                                      />
                                    </div>
                                  </div>
                               </div>
                               <div className="space-y-8">
                                  <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#ACBAC4" }}>Compensation Blueprint</label>
                                  <div className="p-8 rounded-[32px] bg-[#F7B980]/5 border border-[#F7B980]/10 space-y-6">
                                    <div className="flex justify-between items-end">
                                      <p className="text-sm font-bold" style={{ color: "#57595B" }}>Target Range</p>
                                      <p className="text-2xl font-black" style={{ color: "#F7B980" }}>{prefs.expectedSalary}</p>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="50000" 
                                      max="300000" 
                                      step="5000"
                                      value={parseInt(prefs.expectedSalary.replace(/[^0-9]/g, "")) || 150000} 
                                      onChange={(e) => setPrefs({...prefs, expectedSalary: `$${(parseInt(e.target.value)/1000).toFixed(0)}k+ USD`})} 
                                      className="w-full accent-[#F7B980] cursor-pointer" 
                                    />
                                    <div className="flex justify-between text-[10px] font-bold" style={{ color: "#ACBAC4" }}>
                                      <span>$50k</span>
                                      <span>$175k (Avg)</span>
                                      <span>$300k+</span>
                                    </div>
                                  </div>
                               </div>
                            </div>

                            <div className="pt-4 space-y-8">
                               <div>
                                 <h4 className="text-xl font-bold mb-2" style={{ color: "#57595B" }}>Mission Targets</h4>
                                 <p className="text-sm font-medium" style={{ color: "#ACBAC4" }}>Tag the sectors where you want to make the most professional impact.</p>
                               </div>
                               <div className="flex flex-wrap gap-4">
                                  {["FinTech", "HealthTech", "AI / ML", "Cybersecurity", "E-commerce", "SaaS", "Web3"].map(tag => (
                                    <button 
                                      key={tag} 
                                      className="px-8 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all hover:bg-[#F7B980] hover:text-white hover:border-[#F7B980] hover:shadow-lg hover:shadow-[#F7B980]/20 cursor-pointer"
                                      style={{ borderColor: "#F2F4F4", color: "#8A8C8E", backgroundColor: "white" }}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                  <button className="px-8 py-3.5 rounded-2xl border-2 border-dashed font-bold text-sm flex items-center gap-3 cursor-pointer group hover:bg-white transition-all" style={{ borderColor: "#E0E4E3", color: "#ACBAC4" }}>
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> New Target
                                  </button>
                               </div>
                            </div>
                          </div>
                        )}
                        {settingsSection === "notifications" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#F2F4F4]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#57595B" }}>Alert Protocols</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#ACBAC4" }}>Configure your real-time signal preferences for the dashboard.</p>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-white border border-[#F2F4F4] rounded-[32px] p-8 flex items-start gap-8 shadow-sm group hover:shadow-md transition-all">
                                <div className="p-4 rounded-2xl bg-[#F2F4F4] text-[#ACBAC4] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors">
                                  <Mail className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <Toggle 
                                    enabled={prefs.emailAlerts} 
                                    setEnabled={(val) => setPrefs({...prefs, emailAlerts: val})} 
                                    label="Email Sync" 
                                    description="Weekly digests and mission-critical updates."
                                  />
                                </div>
                              </div>

                              <div className="bg-white border border-[#F2F4F4] rounded-[32px] p-8 flex items-start gap-8 shadow-sm group hover:shadow-md transition-all">
                                <div className="p-4 rounded-2xl bg-[#F2F4F4] text-[#ACBAC4] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors">
                                  <Bell className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <Toggle 
                                    enabled={prefs.browserAlerts} 
                                    setEnabled={(val) => setPrefs({...prefs, browserAlerts: val})} 
                                    label="Desktop Signals" 
                                    description="Instant push notifications for recruiter inquiries."
                                  />
                                </div>
                              </div>

                              <div className="bg-white border border-[#F2F4F4] rounded-[32px] p-8 flex items-start gap-8 shadow-sm group hover:shadow-md transition-all">
                                <div className="p-4 rounded-2xl bg-[#F2F4F4] text-[#ACBAC4] group-hover:bg-[#F7B980]/10 group-hover:text-[#F7B980] transition-colors">
                                  <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <Toggle 
                                    enabled={prefs.jobInvites} 
                                    setEnabled={(val) => setPrefs({...prefs, jobInvites: val})} 
                                    label="Private Inquiries" 
                                    description="Allow high-tier recruiters to reach out directly."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "privacy" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#F2F4F4]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#57595B" }}>Privacy Guard</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#ACBAC4" }}>Control your video resume discoverability and narrative data.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="bg-[#57595B] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                      <div className="max-w-md space-y-4">
                                         <h4 className="text-2xl font-black">Spotlight Visibility</h4>
                                         <p className="text-white/60 font-medium leading-relaxed">When active, your high-fidelity Video Resume is promoted to the global recruiter network.</p>
                                         <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 border border-white/10">
                                            <Shield className="w-5 h-5 text-[#F7B980]" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Secured by VidioCV Privacy Protocols</p>
                                         </div>
                                      </div>
                                      <div className="bg-white/10 p-8 rounded-[32px] border border-white/20">
                                        <Toggle 
                                          enabled={prefs.videoPublic} 
                                          setEnabled={(val) => setPrefs({...prefs, videoPublic: val})} 
                                          label="Go Public" 
                                          description="Enable for recruiters"
                                          dark
                                        />
                                      </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7B980]/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                                </div>

                                <div className="p-8 rounded-[32px] border-2 border-dashed border-[#F2F4F4] flex items-center justify-between">
                                   <div className="flex items-center gap-6">
                                      <div className="p-4 rounded-2xl bg-[#F2F4F4] text-[#ACBAC4]">
                                        <Trash2 className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm" style={{ color: "#57595B" }}>Narrative Data Wipe</p>
                                        <p className="text-xs font-medium" style={{ color: "#ACBAC4" }}>Irreversibly delete your active Video CV and local metadata.</p>
                                      </div>
                                   </div>
                                   <button className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer">Execute Wipe</button>
                                </div>
                            </div>
                          </div>
                        )}

                        {settingsSection === "security" && (
                          <div className="space-y-12">
                            <div className="pb-8 border-b border-[#F2F4F4]">
                               <h3 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#57595B" }}>Security Hub</h3>
                               <p className="font-medium text-base leading-relaxed" style={{ color: "#ACBAC4" }}>Manage authentication hardware and active workspace sessions.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#ACBAC4" }}>Access Key</label>
                                <div className="relative group">
                                  <input type="password" defaultValue="********" disabled className="w-full px-8 py-5 bg-white border-2 rounded-3xl transition-all font-bold" style={{ borderColor: "#F2F4F4", color: "#ACBAC4" }} />
                                  <button className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[10px] uppercase tracking-widest text-[#F7B980] hover:scale-105 transition-transform cursor-pointer">Rotate Key</button>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "#ACBAC4" }}>Verified Terminal</label>
                                <div className="relative group">
                                  <input type="email" defaultValue="johndoe@example.com" disabled className="w-full px-8 py-5 bg-white border-2 rounded-3xl transition-all font-bold" style={{ borderColor: "#F2F4F4", color: "#ACBAC4" }} />
                                  <button className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[10px] uppercase tracking-widest text-[#F7B980] hover:scale-105 transition-transform cursor-pointer">Update</button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-8">
                               <div className="flex items-center justify-between">
                                 <h4 className="text-xl font-bold" style={{ color: "#57595B" }}>Active Terminals</h4>
                                 <button className="text-[10px] font-black uppercase tracking-widest text-[#F7B980] hover:underline cursor-pointer">Disconnect All</button>
                               </div>
                               <div className="grid grid-cols-1 gap-4">
                                  {[
                                    { device: "MacBook Pro M2 - San Francisco, US", time: "Active Workspace", current: true, icon: "💻" },
                                    { device: "iPhone 15 Pro - Austin, TX", time: "Last check-in 2h ago", current: false, icon: "📱" }
                                  ].map((session, i) => (
                                    <div key={i} className="flex justify-between items-center p-6 rounded-[32px] bg-white border border-[#F2F4F4] shadow-sm hover:shadow-md transition-all">
                                      <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-[#F2F4F4] flex items-center justify-center text-2xl shadow-inner">
                                          {session.icon}
                                        </div>
                                        <div>
                                          <p className="font-bold text-base" style={{ color: "#57595B" }}>{session.device}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${session.current ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-[#ACBAC4]"}`} />
                                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ACBAC4" }}>{session.time}</p>
                                          </div>
                                        </div>
                                      </div>
                                      {!session.current && <button className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Trash2 className="w-5 h-5" /></button>}
                                    </div>
                                  ))}
                               </div>
                            </div>

                            <div className="pt-10 border-t border-[#F2F4F4]">
                               <div className="p-10 rounded-[40px] bg-red-50 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-10">
                                  <div className="max-w-md text-center md:text-left">
                                     <h5 className="text-xl font-black text-red-500 mb-2">Danger Zone</h5>
                                     <p className="text-sm font-semibold text-red-400">Permanently deactivate your professional profile and erase all narrative history across the VidioCV network.</p>
                                  </div>
                                  <button onClick={() => setIsLogoutModalOpen(true)} className="px-10 py-5 bg-red-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                                    Deactivate Profile
                                  </button>
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
            <div className="flex flex-col sm:flex-row justify-between border-b border-[#F2F4F4] pb-8 gap-6">
               <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F2F4F4] flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-[#57595B]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#57595B" }}>{selectedJob.company}</p>
                    <div className="flex items-center gap-3 text-sm font-bold" style={{ color: "#ACBAC4" }}>
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
               <h4 className="text-xl font-bold" style={{ color: "#57595B" }}>Opportunity Blueprint</h4>
               <p className="text-lg leading-relaxed font-medium" style={{ color: "#8A8C8E" }}>
                 {selectedJob.description}
               </p>
            </div>

            <div className="p-6 rounded-3xl flex items-start gap-5 border border-[#F2F4F4]" style={{ background: "rgba(242, 244, 244, 0.3)" }}>
               <div className="p-3 rounded-2xl bg-white shadow-sm">
                 <Shield className="w-6 h-6 text-[#10B981]" />
               </div>
               <div>
                  <p className="font-bold text-sm mb-1" style={{ color: "#57595B" }}>Verified Selection Process</p>
                  <p className="text-xs font-medium" style={{ color: "#ACBAC4" }}>Applying will securely transmit your active Video Resume. Your data is protected by global encryption standards.</p>
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
        onClose={() => setSelectedMessage(null)}
        type="info"
        closeActionLabel="Back to Inbox"
        maxWidth="max-w-3xl"
        align="left"
      >
        {selectedMessage && (
          <div className="space-y-4 -mt-2">
            <div className="flex justify-between items-center border-b border-[#F2F4F4] pb-5">
              <div className="flex gap-3 items-center">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{ background: "linear-gradient(135deg, #F7B980, #F0A060)", color: "white" }}
                >
                  {selectedMessage.company.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-black leading-tight" style={{ color: "#57595B" }}>{selectedMessage.company}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: "#ACBAC4" }}>{selectedMessage.sender}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{selectedMessage.time}</p>
                <div className="px-2 py-0.5 bg-[#10B981]/5 text-[#10B981] rounded-full text-[8px] font-black uppercase tracking-widest inline-block border border-[#10B981]/10">Verified</div>
              </div>
            </div>
            
            <div className="p-6 rounded-[24px] border border-[#F2F4F4] relative overflow-hidden group shadow-inner" style={{ background: "rgba(249, 249, 249, 0.4)" }}>
              <div className="text-sm font-medium whitespace-pre-wrap relative z-10 leading-relaxed" style={{ color: "#57595B" }}>
                {selectedMessage.body}
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7B980]/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
            </div>
 
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button className="flex-[2] py-3.5" size="lg">
                Quick Reply
              </Button>
              <button 
                onClick={() => setSelectedMessage(null)} 
                className="flex-1 py-3.5 rounded-2xl font-bold text-[9px] tracking-[0.2em] uppercase transition-all border-2 border-[#F2F4F4] hover:bg-white hover:border-[#F7B980]/20 hover:text-[#F7B980] cursor-pointer"
                style={{ color: "#ACBAC4" }}
              >
                Archive
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Application Details Modal */}
      <Modal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        type="info"
        closeActionLabel="Back to Applications"
        maxWidth="max-w-3xl"
        align="left"
      >
        {selectedApplication && (
          <div className="space-y-8 pb-4">
            <div className="flex justify-between items-start border-b border-[#F2F4F4] pb-8 -mt-2">
               <div className="flex gap-5 items-center">
                  <div className="w-16 h-16 rounded-[24px] bg-[#F2F4F4] flex items-center justify-center shadow-inner">
                    <Building2 className="w-8 h-8 text-[#ACBAC4]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: "#57595B" }}>{selectedApplication.company}</h3>
                    <p className="text-sm font-bold opacity-60 uppercase tracking-[0.15em]">{selectedApplication.title}</p>
                  </div>
               </div>
               <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedApplication.color}`}>
                 {selectedApplication.status}
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: "#ACBAC4" }}>Role Blueprint</h4>
                    <p className="text-base font-medium leading-relaxed" style={{ color: "#57595B" }}>{selectedApplication.description}</p>
                  </div>
                  
                  <div className="p-8 rounded-[32px] bg-[#F2F4F4]/30 border border-[#F2F4F4] flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <Video className="w-6 h-6 text-[#F7B980]" />
                        <p className="text-sm font-bold" style={{ color: "#57595B" }}>Video Portfolio Linked</p>
                     </div>
                     <button className="text-[10px] font-black uppercase tracking-widest text-[#F7B980] hover:underline cursor-pointer">Preview Reel</button>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "#ACBAC4" }}>Life Cycle</h4>
                  <div className="relative pl-6 space-y-6">
                     <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#F2F4F4]" />
                     {selectedApplication.timeline.map((item, i) => (
                       <div key={i} className="relative">
                         <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: i === 0 ? "#F7B980" : "#ACBAC4" }} />
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{item.date}</p>
                         <p className="text-xs font-bold" style={{ color: "#57595B" }}>{item.event}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="flex-1 py-4 shadow-xl shadow-[#F7B980]/15" size="lg">
                Recruiter Workspace
              </Button>
              <button 
                className="flex-1 py-4 rounded-2xl font-bold text-[10px] tracking-[0.2em] uppercase transition-all border-2 border-[#F2F4F4] hover:bg-white hover:border-red-500/20 hover:text-red-500 cursor-pointer"
                style={{ color: "#ACBAC4" }}
              >
                Withdraw Intent
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

// Helpers System
const CustomOption = (props: OptionProps<{ value: string; label: string }>) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F2F4F4] cursor-pointer transition-colors group">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.5rem", height: "1.5rem" }} className="rounded-sm shadow-sm" />
      <span className="font-bold text-sm group-hover:text-[#57595B]" style={{ color: "#8A8C8E" }}>{props.data.label}</span>
    </div>
  );
};

const CustomSingleValue = (props: SingleValueProps<{ value: string; label: string }>) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-3 font-bold text-sm" style={{ color: "#57595B" }}>
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.5rem", height: "1.5rem" }} className="rounded-sm shadow-sm" />
      <span>{props.data.label}</span>
    </div>
  );
};
