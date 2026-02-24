import { notFound } from "next/navigation";
import ReactPlayer from "react-player/lazy";
import {
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Mail,
  Phone,
  Heart,
  Share2,
  Eye,
} from "lucide-react";

async function getCVProfile(slug: string) {
  // Mock data for initial render until DB is hooked up
  return {
    id: "123",
    slug,
    title: "Senior Full Stack Developer",
    summary:
      "Passionate developer with 8+ years of experience building scalable web applications.",
    videoUrl: "https://example.com/video.mp4",
    videoThumbnail: "/placeholder-video.jpg",
    videoDuration: 180,
    fullName: "John Doe",
    location: "Lagos, Nigeria",
    email: "john@example.com",
    phone: "+234 123 456 7890",
    website: "https://johndoe.com",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe",
    yearsOfExperience: 8,
    availability: "Open to opportunities",
    remotePreference: "Remote or Hybrid",
    viewsCount: 1234,
    likesCount: 89,
    skills: [
      { name: "React", proficiency: "Expert", years: 5 },
      { name: "Node.js", proficiency: "Expert", years: 6 },
      { name: "TypeScript", proficiency: "Advanced", years: 4 },
      { name: "PostgreSQL", proficiency: "Advanced", years: 5 },
    ],
    workExperiences: [
      {
        company: "Tech Corp",
        position: "Senior Developer",
        location: "Remote",
        startDate: "2020-01",
        endDate: null,
        isCurrent: true,
        description: "Leading development of microservices architecture",
      },
      {
        company: "StartupXYZ",
        position: "Full Stack Developer",
        location: "Lagos, Nigeria",
        startDate: "2017-06",
        endDate: "2019-12",
        isCurrent: false,
        description: "Built and maintained multiple client projects",
      },
    ],
    education: [
      {
        institution: "University of Lagos",
        degree: "Bachelor's",
        fieldOfStudy: "Computer Science",
        startDate: "2012",
        endDate: "2016",
        grade: "First Class",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuingOrganization: "Amazon Web Services",
        issueDate: "2021-05",
      },
    ],
  };
}

export default async function CVProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const cv = await getCVProfile(params.slug);

  if (!cv) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-primary-100 dark:border-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500">
              VidioCV
            </h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                <Heart className="h-5 w-5 text-accent-500" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                <Share2 className="h-5 w-5 text-primary-500" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg shadow-soft hover:shadow-medium transition-all transform hover:-translate-y-0.5">
                Contact
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video & Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="glass-panel rounded-2xl overflow-hidden overflow-hidden">
              <div className="aspect-video bg-black/5 dark:bg-black/40">
                <ReactPlayer
                  url={cv.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  light={cv.videoThumbnail}
                />
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-4xl font-extrabold tracking-tight">
                    {cv.fullName}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300">
                      <Eye className="h-4 w-4" />
                      {cv.viewsCount}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-accent-50 dark:bg-accent-900/30 rounded-full text-accent-700 dark:text-accent-300">
                      <Heart className="h-4 w-4" />
                      {cv.likesCount}
                    </span>
                  </div>
                </div>
                <p className="text-2xl text-primary-600 dark:text-primary-400 font-medium mb-6">
                  {cv.title}
                </p>
                <p className="text-lg text-secondary-700 dark:text-secondary-300 leading-relaxed">
                  {cv.summary}
                </p>
              </div>
            </div>

            {/* Work Experience */}
            <div className="glass-panel rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-secondary-900 dark:text-white">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                Work Experience
              </h2>
              <div className="space-y-8">
                {cv.workExperiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="relative pl-6 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-gradient-to-b before:from-primary-400 before:to-transparent"
                  >
                    <h3 className="font-bold text-xl text-secondary-900 dark:text-white">
                      {exp.position}
                    </h3>
                    <p className="text-lg text-primary-600 dark:text-primary-400 font-medium">
                      {exp.company}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3 mt-1 flex items-center gap-2">
                      {exp.startDate} -{" "}
                      {exp.isCurrent ? "Present" : exp.endDate}{" "}
                      <span className="w-1 h-1 rounded-full bg-secondary-300"></span>{" "}
                      {exp.location}
                    </p>
                    <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="glass-panel rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-secondary-900 dark:text-white">
                <div className="p-2 bg-accent-100 dark:bg-accent-900/50 rounded-lg text-accent-600 dark:text-accent-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                Education
              </h2>
              <div className="space-y-6">
                {cv.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-white/50 dark:bg-secondary-900/20 hover:shadow-soft transition-shadow"
                  >
                    <h3 className="font-bold text-xl text-secondary-900 dark:text-white">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-lg text-accent-600 dark:text-accent-400 font-medium">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                      {edu.startDate} - {edu.endDate} • Grade: {edu.grade}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {cv.certifications.length > 0 && (
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-secondary-900 dark:text-white">
                  <div className="p-2 bg-success-100 dark:bg-success-900/50 rounded-lg text-success-600 dark:text-success-400">
                    <Award className="h-6 w-6" />
                  </div>
                  Certifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cv.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-white/50 dark:bg-secondary-900/20"
                    >
                      <Award className="h-6 w-6 text-success-500 mt-1 shrink-0" />
                      <div>
                        <h3 className="font-bold text-secondary-900 dark:text-white">
                          {cert.name}
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                          {cert.issuingOrganization}
                          <br />
                          Issued: {cert.issueDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold text-xl mb-6 text-secondary-900 dark:text-white border-b border-secondary-200 dark:border-secondary-800 pb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                {cv.email && (
                  <a
                    href={`mailto:${cv.email}`}
                    className="flex items-center gap-4 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="truncate">{cv.email}</span>
                  </a>
                )}
                {cv.phone && (
                  <a
                    href={`tel:${cv.phone}`}
                    className="flex items-center gap-4 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span>{cv.phone}</span>
                  </a>
                )}
                {cv.location && (
                  <div className="flex items-center gap-4 text-secondary-700 dark:text-secondary-300">
                    <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span>{cv.location}</span>
                  </div>
                )}
                {cv.website && (
                  <a
                    href={cv.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                      <Globe className="h-5 w-5" />
                    </div>
                    <span>Portfolio / Website</span>
                  </a>
                )}
                {cv.linkedinUrl && (
                  <a
                    href={cv.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                      <Linkedin className="h-5 w-5" />
                    </div>
                    <span>LinkedIn Profile</span>
                  </a>
                )}
                {cv.githubUrl && (
                  <a
                    href={cv.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                      <Github className="h-5 w-5" />
                    </div>
                    <span>GitHub Profile</span>
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold text-xl mb-6 text-secondary-900 dark:text-white border-b border-secondary-200 dark:border-secondary-800 pb-4">
                Skills & Expertise
              </h3>
              <div className="space-y-5">
                {cv.skills.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-secondary-800 dark:text-secondary-200">
                        {skill.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400">
                        {skill.proficiency}
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-400 to-primary-600 h-1.5 rounded-full"
                        style={{
                          width:
                            skill.proficiency === "Expert"
                              ? "100%"
                              : skill.proficiency === "Advanced"
                                ? "80%"
                                : skill.proficiency === "Intermediate"
                                  ? "60%"
                                  : "40%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-medium relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Briefcase className="w-24 h-24 transform rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2 text-white/90">
                  Availability
                </h3>
                <p className="text-2xl font-semibold mb-2">{cv.availability}</p>
                <div className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium border border-white/30">
                  {cv.remotePreference}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
