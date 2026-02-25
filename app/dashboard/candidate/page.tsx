"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, LogOut, Bell, Search, MapPin, Briefcase, Video, 
  Building2, UserCircle, Link as LinkIcon, Shield, Trash2, 
  Mail, Lock, Plus, X
} from "lucide-react";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import countryList from "country-list";
import Button from "@/app/components/common/Button";
import VideoCreator from "@/app/components/video-tools/VideoCreator";
import Modal from "@/app/components/common/Modal";
import { useRouter } from "next/navigation";
import { getPeerTubeEmbedUrl } from "@/app/lib/video";
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

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [showVideoCreator, setShowVideoCreator] = useState(false);

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fetchedSkills = data.cvProfile.skills.map((s: any) => s.skill.name);
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
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 font-sans relative overflow-hidden">
      {/* Premium Glassmorphic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary-500/10 dark:bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-accent-500/10 dark:bg-accent-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-secondary-400/10 dark:bg-secondary-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/60 dark:bg-secondary-900/60 backdrop-blur-xl border-b border-white/40 dark:border-white/10 shadow-sm shadow-secondary-200/20 dark:shadow-none">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative bg-transparent">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5 cursor-pointer" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-300 tracking-tight cursor-pointer flex items-center">
              VidioCV
            </span>
          </div>
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-100 dark:text-primary-300 dark:bg-primary-900/50 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm shadow-primary-500/10 backdrop-blur-md">
                 Candidate Dashboard
             </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("notifications")} className="p-2.5 bg-white/50 dark:bg-secondary-800/50 hover:bg-white dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-xl backdrop-blur-sm border border-secondary-200 dark:border-secondary-700 shadow-sm transition-all cursor-pointer">
              <Bell className="w-5 h-5 cursor-pointer" />
            </button>
            <button onClick={() => setActiveTab("settings")} className="p-2.5 bg-white/50 dark:bg-secondary-800/50 hover:bg-white dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-xl backdrop-blur-sm border border-secondary-200 dark:border-secondary-700 shadow-sm transition-all cursor-pointer">
              <Settings className="w-5 h-5 cursor-pointer" />
            </button>
            <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-2 p-2.5 px-4 bg-error-50 dark:bg-error-500/10 hover:bg-error-100 dark:hover:bg-error-500/20 text-error-600 dark:text-error-400 rounded-xl backdrop-blur-sm border border-error-200 dark:border-error-500/20 transition-all cursor-pointer font-semibold">
              <LogOut className="w-4 h-4 cursor-pointer" /> <span className="hidden sm:inline cursor-pointer">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full mb-5 shadow-lg shadow-primary-500/30 p-1">
              <div className="w-full h-full bg-white dark:bg-secondary-800 rounded-full flex items-center justify-center border-2 border-transparent">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500">
                  JD
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">{userName}</h2>
            <p className="text-primary-600 dark:text-primary-400 font-medium mb-5">{userRole}</p>
            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400">
                <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Global / Remote</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400">
                <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>5+ years experience</span>
              </div>
            </div>
          </motion.div>

          {/* KPI Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Profile Views", value: "342", color: "from-blue-500 to-cyan-400" },
              { label: "Active Applications", value: "12", color: "from-primary-500 to-accent-500" },
              { label: "Interview Invites", value: "4", color: "from-emerald-400 to-teal-500" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40 flex flex-col justify-center relative overflow-hidden group"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-full blur-2xl" />
                <p className="text-secondary-500 dark:text-secondary-400 font-medium mb-2">{stat.label}</p>
                <p className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} tracking-tight`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white/50 dark:bg-secondary-900/50 p-1.5 rounded-2xl backdrop-blur-md border border-white/60 dark:border-secondary-800 shadow-sm max-w-fit overflow-x-auto">
          {(["profile", "jobs", "applications", "interviews", "messages"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white shadow-sm"
                  : "text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-secondary-800/40"
              }`}
            >
              {tab === "jobs" ? "Global Job Search" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

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
                <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 lg:p-10 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                  <div className="flex justify-between items-center mb-8 pb-6 border-b border-secondary-200 dark:border-secondary-800">
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
                      <Mail className="w-6 h-6 text-primary-500" /> Message Center
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        onClick={() => {
                          setSelectedMessage(msg);
                          // Mark as read locally
                          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, unread: false } : m));
                        }}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer group ${
                          msg.unread 
                            ? "bg-primary-50/50 dark:bg-primary-500/5 border-primary-200 dark:border-primary-500/30 ring-1 ring-primary-500/10" 
                            : "bg-white/30 dark:bg-secondary-950/30 border-secondary-200 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-primary-700"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-800 dark:to-secondary-700 flex items-center justify-center font-bold text-secondary-700 dark:text-secondary-300">
                              {msg.company.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {msg.company}
                              </h4>
                              <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
                                {msg.sender}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-secondary-400 dark:text-secondary-500 font-semibold uppercase tracking-wider">{msg.time}</p>
                             {msg.unread && <span className="inline-block w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5 shadow-sm shadow-primary-500/50" />}
                          </div>
                        </div>
                        <div>
                          <p className={`text-sm font-bold mb-1 ${msg.unread ? "text-secondary-900 dark:text-white" : "text-secondary-700 dark:text-secondary-300"}`}>
                            {msg.subject}
                          </p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-1">
                            {msg.preview}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-800 text-center">
                    <button className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors cursor-pointer">
                      View All Archived Messages
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Video CV Section */}
                <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 lg:p-10 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-secondary-200 dark:border-secondary-800 mb-8">
                    <div className="mb-6 md:mb-0">
                      <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2 flex items-center gap-3">
                        <Video className="w-6 h-6 text-primary-500" /> Your Video CV
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 max-w-xl">
                        Stand out from the crowd. Record or upload a high-quality video introduction that showcases your personality, communication skills, and passion directly to top employers worldwide.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowVideoCreator(!showVideoCreator)}
                      className="bg-secondary-900 hover:bg-secondary-800 dark:bg-white dark:hover:bg-secondary-100 text-white dark:text-secondary-900 shadow-lg shrink-0 flex items-center gap-2 cursor-pointer"
                    >
                      {showVideoCreator ? "Hide Studio" : "Open Video Studio"}
                    </Button>
                  </div>

                  {showVideoCreator ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-4">
                      <div className="bg-secondary-50 dark:bg-secondary-950/50 rounded-2xl p-6 md:p-8 border border-secondary-200 dark:border-secondary-800">
                        <VideoCreator 
                           initialVideoUrl={activeVideoUrl || undefined}
                           onVideoUpload={(file, url) => {
                             console.log("Uploaded:", file.name);
                             if (url) setActiveVideoUrl(url);
                             // Automatically close studio when done so user can see it
                             setShowVideoCreator(false);
                           }} 
                           onVideoDelete={() => setActiveVideoUrl(null)}
                        />
                      </div>
                    </motion.div>
                  ) : activeVideoUrl ? (
                    <div className="w-full aspect-video md:aspect-[21/9] bg-black rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden relative shadow-xl group">
                        <iframe 
                          src={getPeerTubeEmbedUrl(activeVideoUrl) || ""}
                          allowFullScreen
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                          className="w-full h-full border-0 absolute inset-0"
                          title="Video CV"
                        />
                        <button 
                          onClick={() => {
                            setModalConfig({
                              isOpen: true,
                              title: "Delete Video CV?",
                              message: "Are you sure you want to delete your active Video CV? This cannot be undone.",
                              type: "confirm",
                              onConfirm: async () => {
                                try {
                                  const response = await fetch("/api/profile/video/delete", { 
                                    method: "DELETE",
                                    headers: {
                                      "Authorization": `Bearer ${localStorage.getItem("token")}`
                                    }
                                  });
                                  
                                  if (response.ok) {
                                    setActiveVideoUrl(null);
                                    setModalConfig({
                                      isOpen: true,
                                      title: "Success",
                                      message: "Your Video CV has been permanently deleted.",
                                      type: "success"
                                    });
                                  } else {
                                    const data = await response.json();
                                    setModalConfig({
                                      isOpen: true,
                                      title: "Deletion Failed",
                                      message: data.error || data.details || "Failed to delete video. Please try again.",
                                      type: "error"
                                    });
                                  }
                                } catch (error) {
                                  console.error("Deletion error:", error);
                                  setModalConfig({
                                    isOpen: true,
                                    title: "Error",
                                    message: "An error occurred while deleting your video. Please check your connection.",
                                    type: "error"
                                  });
                                }
                              }
                            });
                          }}
                          className="absolute top-4 right-4 bg-error-500/90 hover:bg-error-600 text-white p-2.5 rounded-xl backdrop-blur-md transition-colors cursor-pointer shadow-lg opacity-0 group-hover:opacity-100"
                          title="Delete Video CV"
                        >
                          <Trash2 className="w-5 h-5 cursor-pointer" />
                        </button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video md:aspect-[21/9] bg-secondary-100 dark:bg-secondary-950 rounded-2xl border border-secondary-200 dark:border-secondary-800 flex flex-col items-center justify-center text-center p-8 group overflow-hidden relative cursor-pointer" onClick={() => setShowVideoCreator(true)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
                        <PlayIcon className="w-8 h-8 text-primary-500 translate-x-1 cursor-pointer" />
                      </div>
                      <h4 className="text-xl font-bold text-secondary-900 dark:text-white mb-2 z-10 cursor-pointer">You don&apos;t have an active Video CV</h4>
                      <p className="text-secondary-500 dark:text-secondary-400 z-10 max-w-md cursor-pointer">Open the Video Studio to record your stunning introduction and unlock global opportunities.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Skills Section */}
                  <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                    <h4 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Verified Skills</h4>
                    
                    <div className="flex gap-2 mb-6">
                      <input 
                        type="text" 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Add a new skill (e.g. Next.js)..." 
                        className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm" 
                      />
                      <button 
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {skills.map((skill) => (
                          <motion.span 
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="group flex items-center gap-1.5 pl-4 pr-2 py-1.5 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-xl text-sm font-semibold text-primary-700 dark:text-primary-300 cursor-default"
                          >
                            {skill}
                            <button 
                              onClick={() => handleRemoveSkill(skill)}
                              className="p-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-lg text-primary-500 hover:text-primary-700 dark:text-primary-400 transition-colors cursor-pointer"
                              title="Remove skill"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {skills.length === 0 && (
                        <span className="text-secondary-500 text-sm">No skills added yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                    <h4 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Experience</h4>
                    
                    {/* Add Experience Form */}
                    <div className="bg-secondary-50 dark:bg-secondary-800/30 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-700/50 mb-8 space-y-3">
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">Add New Experience</p>
                      <input 
                        type="text" 
                        value={newExperience.role}
                        onChange={(e) => setNewExperience({...newExperience, role: e.target.value})}
                        placeholder="Role (e.g. Senior Developer)" 
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm mb-2" 
                      />
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                          placeholder="Company" 
                          className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm" 
                        />
                        <input 
                          type="text" 
                          value={newExperience.duration}
                          onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                          placeholder="Duration (e.g. 2021 - Present)" 
                          className="flex-1 px-4 py-2.5 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm" 
                        />
                      </div>
                      <button 
                        onClick={handleAddExperience}
                        disabled={!newExperience.role.trim() || !newExperience.company.trim()}
                        className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm font-bold"
                      >
                        <Plus className="w-4 h-4" /> Add Experience
                      </button>
                    </div>

                    <div className="space-y-6">
                      <AnimatePresence>
                        {experiences.map((exp) => (
                          <motion.div 
                            key={exp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-4 group relative"
                          >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                              {exp.company.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 pr-8">
                              <p className="font-bold text-secondary-900 dark:text-white text-lg">{exp.role}</p>
                              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">{exp.company}</p>
                              <p className="text-sm text-secondary-500 dark:text-secondary-400">{exp.duration}</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="absolute top-2 right-0 opacity-0 group-hover:opacity-100 p-2 text-secondary-400 hover:text-error-500 dark:hover:text-error-400 transition-all cursor-pointer"
                              title="Delete experience"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {experiences.length === 0 && (
                        <p className="text-secondary-500 text-sm italic">No experiences added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-8">
                <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Global Job Search</h3>
                    <p className="text-secondary-600 dark:text-secondary-400">Find your dream role and instantly apply using your Video CV.</p>
                  </div>
                  
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-400">
                        <Search className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search roles, companies..."
                        className="w-full pl-12 pr-4 py-2.5 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                      />
                    </div>
                    <div className="relative z-20">
                      <Select
                        options={countryOptions}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(selected: any) => setSelectedCountry(selected)}
                        value={selectedCountry}
                        isClearable
                        placeholder="Filter by Country Location..."
                        className="react-select-container text-left"
                        classNamePrefix="react-select"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        components={{ Option: CustomOption as any, SingleValue: CustomSingleValue as any }}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            height: "42px",
                            minHeight: "42px",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                            borderColor: state.isFocused ? "#8b5cf6" : "#e2e8f0",
                            borderRadius: "0.75rem",
                            boxShadow: state.isFocused ? "0 0 0 4px rgba(139, 92, 246, 0.2)" : "none",
                            className: "dark:bg-secondary-950/50 dark:border-secondary-700",
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(16px)",
                            borderRadius: "0.75rem",
                            className: "dark:bg-secondary-900/95 dark:border-secondary-800",
                          }),
                        }}
                      />
                    </div>
                  </div>

                  {/* Job List */}
                  <div className="space-y-4">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <div key={job.id} className="group bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex gap-4 items-start">
                            <div className="w-14 h-14 rounded-xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center shrink-0">
                               <Building2 className="w-7 h-7 text-secondary-500 dark:text-secondary-400" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{job.title}</h4>
                              <p className="text-secondary-600 dark:text-secondary-400 font-medium">{job.company}</p>
                              <div className="flex flex-wrap gap-4 mt-3 text-sm text-secondary-500">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.type}</span>
                                <span className="font-mono bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded text-secondary-700 dark:text-secondary-300">{job.salary}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-4 md:mt-0">
                            <Button 
                              size="sm"
                              onClick={() => setSelectedJob(job)} 
                              className="flex-1 justify-center bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold transition-colors rounded-lg cursor-pointer px-4 py-2 text-sm"
                            >
                              View Details
                            </Button>
                            <Button size="sm" onClick={() => handleApply(job.id)} className="flex-1 shrink-0 bg-primary-600 hover:bg-primary-500 text-white shadow-md flex items-center justify-center gap-2 rounded-lg cursor-pointer px-4 py-2 text-sm">
                              <Video className="w-4 h-4 cursor-pointer" /> 
                              Submit Video CV
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white/30 dark:bg-secondary-950/30 rounded-2xl border border-dashed border-secondary-300 dark:border-secondary-700 cursor-pointer" onClick={() => { setSearchQuery(""); setSelectedCountry(null); }}>
                        <p className="text-secondary-500 dark:text-secondary-400 text-lg mb-2">No jobs match your current filters.</p>
                        <button onClick={() => { setSearchQuery(""); setSelectedCountry(null); }} className="text-primary-600 dark:text-primary-400 font-medium hover:underline cursor-pointer">Clear all filters</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-8">Active Applications</h3>
                <div className="space-y-4">
                  {[
                    { title: "Senior Backend Engineer", company: "DataFlow", status: "Under Review", date: "Applied 2 days ago", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
                    { title: "Full Stack Developer", company: "FinTech Pro", status: "Interview Scheduled", date: "Applied 1 week ago", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" }
                  ].map((app, i) => (
                    <div key={i} className="bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-secondary-900 dark:text-white">{app.title}</h4>
                        <p className="text-secondary-600 dark:text-secondary-400">{app.company} • <span className="text-sm">{app.date}</span></p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${app.color}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "interviews" && (
              <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40 text-center py-20">
                 <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Bell className="w-10 h-10 text-secondary-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">No Upcoming Interviews</h3>
                 <p className="text-secondary-600 dark:text-secondary-400 max-w-sm mx-auto">Keep applying with your stunning Video CV. Your interview schedule will appear here when employers invite you!</p>
              </div>
            )}
            
            {activeTab === "notifications" && (
              <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-8">Notifications</h3>
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-secondary-900 dark:text-white">Welcome to VidioCV!</h4>
                      <p className="text-secondary-600 dark:text-secondary-400">Complete your profile and upload your first Video CV to stand out.</p>
                      <span className="text-xs text-secondary-500 mt-2 block">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-8">
                <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-secondary-200 dark:border-secondary-800">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">Account Settings</h3>
                      <p className="text-secondary-600 dark:text-secondary-400">Manage your profile, preferences, and security.</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-secondary-500" /> Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">First Name</label>
                          <input type="text" defaultValue="John" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Last Name</label>
                          <input type="text" defaultValue="Doe" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Phone Number</label>
                          <input type="tel" defaultValue="+1 (555) 000-0000" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Location</label>
                          <input type="text" defaultValue="San Francisco, CA" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Professional Links */}
                    <div className="space-y-6 pt-6 border-t border-secondary-200 dark:border-secondary-800">
                      <h4 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-secondary-500" /> Professional Links
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">LinkedIn Profile</label>
                          <input type="url" placeholder="https://linkedin.com/in/..." defaultValue="https://linkedin.com/in/johndoe" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Portfolio / Website</label>
                          <input type="url" placeholder="https://..." defaultValue="https://johndoe.dev" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                        </div>
                      </div>
                    </div>

                    {/* Security */}
                     <div className="space-y-6 pt-6 border-t border-secondary-200 dark:border-secondary-800">
                      <h4 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-secondary-500" /> Security & Credentials
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Address
                          </label>
                          <div className="relative">
                            <input type="email" defaultValue="johndoe@example.com" disabled className="w-full px-4 py-3 bg-secondary-100/50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-500 dark:text-secondary-400 cursor-not-allowed" />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 cursor-pointer transition-colors">Change</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Password
                          </label>
                          <div className="relative">
                            <input type="password" defaultValue="********" disabled className="w-full px-4 py-3 bg-secondary-100/50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-500 dark:text-secondary-400 cursor-not-allowed" />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 cursor-pointer transition-colors">Update</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-6 pt-6 border-t border-secondary-200 dark:border-secondary-800">
                      <h4 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-secondary-500" /> Notifications
                      </h4>
                      <div className="space-y-4 max-w-2xl">
                        {[
                          { title: "Email Notifications", desc: "Receive email updates about your applications.", defaultChecked: true },
                          { title: "Interview Invites", desc: "Get instantly notified when an employer invites you.", defaultChecked: true },
                          { title: "Marketing & News", desc: "Receive occasional updates about VidioCV new features.", defaultChecked: false },
                        ].map((pref, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-white/30 dark:bg-secondary-950/30 rounded-xl border border-secondary-200 dark:border-secondary-800">
                             <div>
                               <p className="font-semibold text-secondary-900 dark:text-white">{pref.title}</p>
                               <p className="text-sm text-secondary-500 dark:text-secondary-400">{pref.desc}</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" value="" className="sr-only peer" defaultChecked={pref.defaultChecked} />
                               <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
                             </label>
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-secondary-200 dark:border-secondary-800">
                      <Button onClick={() => { 
                          setActiveTab("profile"); 
                          setSuccessMessage({ title: "Settings Saved", message: "Account settings saved successfully." }); 
                        }} 
                        className="w-full sm:w-auto px-8 bg-primary-600 hover:bg-primary-500 text-white shadow-md flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer">
                        Save All Changes
                      </Button>
                      
                      <button className="flex items-center gap-2 text-error-600 hover:text-error-700 dark:text-error-500 dark:hover:text-error-400 font-semibold cursor-pointer transition-colors px-4 py-2 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg">
                        <Trash2 className="w-5 h-5" /> Delete Account
                      </button>
                    </div>

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
        <p className="text-secondary-600 dark:text-secondary-300 font-medium">
          {successMessage?.message}
        </p>
      </Modal>

      {/* Generic Modal for Confirmations/Alerts */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        type={modalConfig.type === "confirm" ? "default" : modalConfig.type}
        primaryAction={modalConfig.type === "confirm" ? {
          label: "Delete Permanently",
          onClick: () => {
            modalConfig.onConfirm?.();
            setModalConfig({ ...modalConfig, isOpen: false });
          }
        } : undefined}
        closeActionLabel={modalConfig.type === "confirm" ? "Keep Video" : "Close"}
      >
        <div className="py-2">
          {modalConfig.message}
        </div>
      </Modal>

      {/* Job Details Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        type="info"
        primaryAction={{
          label: "Quick Apply with Video CV",
          onClick: () => {
             setModalConfig({
               isOpen: true,
               title: "Application Sent!",
               message: "Your application has been successfully submitted to " + selectedJob?.company,
               type: "success"
             });
             setSelectedJob(null);
          }
        }}
        closeActionLabel="Close"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 border-b border-secondary-200 dark:border-secondary-800 pb-4">
               <div>
                  <p className="font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                     <Building2 className="w-4 h-4 text-secondary-400" />
                     {selectedJob.company}
                  </p>
               </div>
               <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-3 py-1 rounded-lg text-sm">
                 <MapPin className="w-4 h-4" />
                 {selectedJob.location}
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 px-4 py-3 rounded-xl flex-1">
                 <p className="text-secondary-500 dark:text-secondary-400 text-xs uppercase font-bold tracking-wider mb-1">Employment Type</p>
                 <p className="font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-2"><Briefcase className="w-4 h-4" /> {selectedJob.type}</p>
              </div>
              <div className="bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20 px-4 py-3 rounded-xl flex-1">
                 <p className="text-secondary-500 dark:text-secondary-400 text-xs uppercase font-bold tracking-wider mb-1">Salary</p>
                 <p className="font-semibold text-success-700 dark:text-success-400">{selectedJob.salary}</p>
              </div>
            </div>

            <div className="bg-secondary-50 dark:bg-secondary-950/50 p-6 rounded-2xl border border-secondary-200 dark:border-secondary-800">
              <h4 className="font-bold text-secondary-900 dark:text-white mb-3 text-lg">About this role</h4>
              <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed text-sm">
                {selectedJob.description}
              </p>
            </div>
            
            <div className="text-sm text-secondary-500 italic mt-6 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Applying will securely send your active Video CV to the employer.
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        type="default" 
        title="Confirm Logout"
        primaryAction={{ label: "Logout", onClick: handleLogout }}
      >
        <p className="text-secondary-600 dark:text-secondary-300 font-medium">Are you sure you want to log out of your Candidate account?</p>
      </Modal>

      {/* Read Email Modal */}
      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject}
        type="info"
        closeActionLabel="Done"
        maxWidth="max-w-4xl"
        align="left"
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-secondary-200 dark:border-secondary-800 pb-3">
              <div>
                <p className="font-bold text-secondary-900 dark:text-white text-base">{selectedMessage.company}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">{selectedMessage.sender}</p>
              </div>
              <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider">{selectedMessage.time}</p>
            </div>
            
            <div className="bg-secondary-50 dark:bg-secondary-950 p-4 rounded-2xl border border-secondary-100 dark:border-secondary-800">
              <div className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap leading-relaxed text-sm">
                {selectedMessage.body}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-sm">
                Reply to Employer
              </Button>
              <Button onClick={() => setSelectedMessage(null)} className="flex-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 font-bold py-2.5 rounded-xl transition cursor-pointer text-sm">
                Archive
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

// Helpers for React-Select Custom Options
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomOption = (props: any) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-2 px-3 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer text-secondary-900 dark:text-white">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.2rem", height: "1.2rem" }} />
      <span>{props.data.label}</span>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomSingleValue = (props: any) => {
  return (
    <div {...props.innerProps} className="flex items-center gap-2 text-secondary-900 dark:text-white">
      <ReactCountryFlag countryCode={props.data.value} svg style={{ width: "1.2rem", height: "1.2rem" }} />
      <span>{props.data.label}</span>
    </div>
  );
};
