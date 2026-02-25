"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Settings, LogOut, Bell, Filter, Video, Users, Calendar as CalendarIcon, MapPin, Building2, Briefcase, Search } from "lucide-react";
import Button from "@/app/components/common/Button";
import CandidateList from "@/app/components/dashboard/CandidateList";
import InterviewCalendar from "@/app/components/dashboard/InterviewCalendar";
import Modal from "@/app/components/common/Modal";
import VideoPlayer from "@/app/components/video-tools/VideoPlayer";
import Select from "react-select";
import ReactCountryFlag from "react-country-flag";
import countryList from "country-list";
import { useRouter } from "next/navigation";
import { useSessionSync } from "@/app/lib/hooks/useSessionSync";

type Tab = "overview" | "candidates" | "jobs" | "interviews";

const countryOptions = countryList.getData().map((country) => ({
  value: country.code,
  label: country.name,
}));

export default function EmployerDashboard() {
  const router = useRouter();
  useSessionSync();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string } | null>(null);

  // Interaction States
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCandidateVideo, setSelectedCandidateVideo] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCandidateMessage, setSelectedCandidateMessage] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCandidateSchedule, setSelectedCandidateSchedule] = useState<any | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mockCandidates = [
    {
      id: "1",
      name: "Alice Johnson",
      title: "Senior React Developer",
      skills: ["React", "TypeScript", "Node.js"],
      videoUrl: "#",
      rating: 5,
    },
    {
      id: "2",
      name: "Bob Smith",
      title: "Full Stack Engineer",
      skills: ["Python", "Django", "PostgreSQL"],
      videoUrl: "#",
      rating: 4,
    },
    {
      id: "3",
      name: "Carol White",
      title: "DevOps Engineer",
      skills: ["Kubernetes", "AWS", "Docker"],
      videoUrl: "#",
      rating: 5,
    },
  ];

  const mockInterviews = [
    {
      id: "1",
      candidateName: "Alice Johnson",
      date: "2024-12-20",
      time: "2:00 PM",
      status: "scheduled" as const,
    },
    {
      id: "2",
      candidateName: "Bob Smith",
      date: "2024-12-22",
      time: "10:00 AM",
      status: "scheduled" as const,
    },
  ];

  const handlePostJob = () => {
    setIsPostJobModalOpen(false);
    setSuccessMessage({
      title: "Job Posted",
      message: "Your new job has been successfully published to the candidate network."
    });
  };

  const filteredCandidates = mockCandidates.filter(c => 
     c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
                 Employer Dashboard
             </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white/50 dark:bg-secondary-800/50 hover:bg-white dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-xl backdrop-blur-sm border border-secondary-200 dark:border-secondary-700 shadow-sm transition-all cursor-pointer">
              <Bell className="w-5 h-5 cursor-pointer" />
            </button>
            <button className="p-2.5 bg-white/50 dark:bg-secondary-800/50 hover:bg-white dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 rounded-xl backdrop-blur-sm border border-secondary-200 dark:border-secondary-700 shadow-sm transition-all cursor-pointer">
              <Settings className="w-5 h-5 cursor-pointer" />
            </button>
            <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-2 p-2.5 px-4 bg-error-50 dark:bg-error-500/10 hover:bg-error-100 dark:hover:bg-error-500/20 text-error-600 dark:text-error-400 rounded-xl backdrop-blur-sm border border-error-200 dark:border-error-500/20 transition-all cursor-pointer font-semibold">
              <LogOut className="w-4 h-4 cursor-pointer" /> <span className="hidden sm:inline cursor-pointer">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        
        {/* Top Company Hero Block */}
        <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 lg:p-10 shadow-xl shadow-secondary-200/30 dark:shadow-black/40 mb-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl shadow-lg flex items-center justify-center shrink-0 border-4 border-white/50 dark:border-secondary-800/50">
               <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-secondary-900 dark:text-white mb-2 tracking-tight">TechNova Solutions</h2>
              <p className="text-lg text-primary-600 dark:text-primary-400 font-semibold mb-4">Enterprise Software Development</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 500+ employees</span>
                <span className="flex items-center gap-1.5 text-success-600 dark:text-success-400"><Briefcase className="w-4 h-4" /> Actively Hiring</span>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsPostJobModalOpen(true)} className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30 flex items-center gap-2 py-3.5 px-6 rounded-xl cursor-pointer w-full md:w-auto shrink-0 font-bold">
            <Plus className="w-5 h-5" /> Post New Job
          </Button>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white/50 dark:bg-secondary-900/50 p-1.5 rounded-2xl backdrop-blur-md border border-white/60 dark:border-secondary-800 shadow-sm w-full overflow-x-auto hide-scrollbar">
          {(["overview", "candidates", "jobs", "interviews"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold text-sm rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white shadow-sm"
                  : "text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-secondary-800/40"
              }`}
            >
              {tab === "overview" ? "Dashboard Overview" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Active Jobs", value: "5", color: "from-blue-500 to-cyan-500", icon: <Briefcase className="w-6 h-6 text-white" /> },
                  { label: "New Candidates", value: "42", color: "from-indigo-500 to-purple-500", icon: <Users className="w-6 h-6 text-white" /> },
                  { label: "Interviews This Week", value: "8", color: "from-emerald-400 to-green-600", icon: <CalendarIcon className="w-6 h-6 text-white" /> }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (idx + 1) }}
                    onClick={() => {
                        if (stat.label === "Active Jobs") setActiveTab("jobs");
                        if (stat.label === "New Candidates") setActiveTab("candidates");
                        if (stat.label === "Interviews This Week") setActiveTab("interviews");
                    }}
                    className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40 flex flex-col justify-center relative overflow-hidden group cursor-pointer"
                  >
                    <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity rounded-full blur-2xl`} />
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg flex items-center justify-center mb-6`}>
                      {stat.icon}
                    </div>
                    <p className="text-secondary-500 dark:text-secondary-400 font-bold mb-1 uppercase tracking-wider text-xs">{stat.label}</p>
                    <p className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} tracking-tight`}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "candidates" && (
              <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-secondary-200 dark:border-secondary-800 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Talent Pool</h3>
                    <p className="text-secondary-600 dark:text-secondary-400">Review matched candidates and their gorgeous Video CVs.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => setIsFilterModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 font-semibold rounded-xl text-secondary-900 dark:text-white transition cursor-pointer">
                      <Filter className="w-4 h-4 cursor-pointer" /> Filter
                    </button>
                    <div className="relative flex-1 md:w-64">
                       <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 cursor-pointer" />
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Search talent..." 
                         className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-text" 
                       />
                    </div>
                  </div>
                </div>
                <CandidateList 
                  candidates={filteredCandidates} 
                  onViewVideo={(c) => setSelectedCandidateVideo(c)}
                  onMessage={(c) => setSelectedCandidateMessage(c)}
                  onSchedule={(c) => setSelectedCandidateSchedule(c)}
                />
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-secondary-200 dark:border-secondary-800 pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Active Job Postings</h3>
                    <p className="text-secondary-600 dark:text-secondary-400">Manage your open roles and track inbound Pipeline.</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {[
                    { title: "Senior React Developer", views: 245, applicants: 12, days: 5 },
                    { title: "DevOps Engineer", views: 180, applicants: 8, days: 3 },
                    { title: "Product Manager", views: 420, applicants: 22, days: 12 },
                  ].map((job) => (
                    <div
                      key={job.title}
                      className="group bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                            {job.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4"/> Posted {job.days} days ago</span>
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/> {job.applicants} applications</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                           <span className="px-4 py-1.5 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 rounded-full text-sm font-bold text-success-600 dark:text-success-400 uppercase tracking-wider">
                             Active
                           </span>
                           <Button onClick={() => setSelectedJob(job)} className="bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white font-bold py-2 px-4 rounded-xl cursor-pointer ml-auto sm:ml-0">
                             Manage
                           </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "interviews" && (
              <div className="bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border border-white/50 dark:border-secondary-800 rounded-3xl p-8 shadow-xl shadow-secondary-200/30 dark:shadow-black/40">
                <InterviewCalendar interviews={mockInterviews} />
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
        <p className="text-secondary-600 dark:text-secondary-300 font-medium text-center">
          {successMessage?.message}
        </p>
      </Modal>

      {/* Post Job Modal */}
      <Modal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        title="Post a New Job"
        type="default"
        primaryAction={{
          label: "Publish Job",
          onClick: handlePostJob
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Job Title</label>
            <input type="text" placeholder="e.g. Senior Product Designer" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Location (Country)</label>
                <Select
                  options={countryOptions}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(selected: any) => setSelectedCountry(selected)}
                  value={selectedCountry}
                  isClearable
                  placeholder="Select Country..."
                  className="react-select-container text-left relative z-50"
                  classNamePrefix="react-select"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  components={{ Option: CustomOption as any, SingleValue: CustomSingleValue as any }}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      height: "50px",
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
                      className: "dark:bg-secondary-900/95 dark:border-secondary-800 z-50",
                    }),
                  }}
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2 cursor-pointer">Type</label>
                <select className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none cursor-pointer">
                  <option className="cursor-pointer">Full-time</option>
                  <option className="cursor-pointer">Part-time</option>
                  <option className="cursor-pointer">Contract</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2 cursor-pointer">Workplace</label>
                <select className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none cursor-pointer">
                  <option className="cursor-pointer">Remote</option>
                  <option className="cursor-pointer">Hybrid</option>
                  <option className="cursor-pointer">Office-based</option>
                </select>
             </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Job Description</label>
            <textarea rows={4} placeholder="Describe the role and requirements..." className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"></textarea>
          </div>
        </div>
      </Modal>

      {/* Action Modals */}
      <Modal 
        isOpen={!!selectedCandidateVideo} 
        onClose={() => setSelectedCandidateVideo(null)} 
        type="default" 
        title={`Video CV: ${selectedCandidateVideo?.name}`}
        closeActionLabel=" Watch Video "
      >
        <div className="bg-secondary-900 rounded-xl overflow-hidden shadow-2xl">
           {selectedCandidateVideo?.videoUrl && selectedCandidateVideo.videoUrl !== "#" ? (
             <VideoPlayer src={selectedCandidateVideo.videoUrl} />
           ) : (
             <div className="aspect-video flex flex-col items-center justify-center gap-4">
               <Video className="w-16 h-16 text-secondary-700" />
               <p className="text-secondary-400 text-sm font-medium">No video CV available for this candidate.</p>
             </div>
           )}
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedCandidateMessage} 
        onClose={() => setSelectedCandidateMessage(null)} 
        type="default" 
        title={`Message ${selectedCandidateMessage?.name}`}
        primaryAction={{ label: "Send Message", onClick: () => {
           setSelectedCandidateMessage(null);
           setSuccessMessage({ title: "Message Sent", message: `Your message to ${selectedCandidateMessage?.name} was sent successfully.` });
        }}}
      >
        <textarea rows={4} placeholder="Type your message here..." className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"></textarea>
      </Modal>

      <Modal 
        isOpen={!!selectedCandidateSchedule} 
        onClose={() => setSelectedCandidateSchedule(null)} 
        type="default" 
        title={`Schedule Interview with ${selectedCandidateSchedule?.name}`}
        primaryAction={{ label: "Send Invite", onClick: () => {
           setSelectedCandidateSchedule(null);
           setSuccessMessage({ title: "Interview Scheduled", message: `An interview invitation has been sent to ${selectedCandidateSchedule?.name}.` });
        }}}
      >
        <div className="space-y-4">
           <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Date & Time</label>
              <input type="datetime-local" className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer" />
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        type="default" 
        title="Confirm Logout"
        primaryAction={{ label: "Logout", onClick: handleLogout }}
      >
        <p className="text-secondary-600 dark:text-secondary-300 font-medium">Are you sure you want to log out of your Employer account?</p>
      </Modal>

      <Modal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        type="default" 
        title="Filter Candidates"
        primaryAction={{ label: "Apply Filters", onClick: () => setIsFilterModalOpen(false) }}
      >
        <div className="space-y-4">
           <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Minimum Rating</label>
              <select className="w-full px-4 py-3 bg-white/50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-700 rounded-xl text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none cursor-pointer">
                 <option>Any</option>
                 <option>4+ Stars</option>
                 <option>5 Stars</option>
              </select>
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        type="default" 
        title={`Manage Job: ${selectedJob?.title}`}
        primaryAction={{ label: "Save Changes", onClick: () => {
           setSelectedJob(null);
           setSuccessMessage({ title: "Job Updated", message: "Your changes have been saved." });
        }}}
      >
        <div className="space-y-4">
           <p className="text-secondary-600 dark:text-secondary-300 font-medium">Manage details for this active job posting.</p>
           <div className="flex gap-2">
             <Button onClick={() => setSelectedJob(null)} className="flex-1 bg-error-50 hover:bg-error-100 text-error-600 border border-error-200 dark:bg-error-500/10 dark:hover:bg-error-500/20 font-bold py-2.5 rounded-xl transition cursor-pointer">Close Job</Button>
           </div>
        </div>
      </Modal>

    </div>
  );
}

// Helpers for React-Select Custom Options
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

