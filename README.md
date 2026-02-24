# VidioCV - Transform Recruitment with Video CVs

VidioCV is a revolutionary recruitment platform that replaces static resumes with dynamic, AI-enhanced video profiles. It combines video CVs with structured data profiles and AI-powered insights to create a more efficient, human, and data-driven hiring experience.

## Features

- **Hybrid Candidate Profiles**: Video CV + structured data profile combining personality assessment with skill verification
- **Guided Video Creation Suite**: Built-in video recording with simple editing tools and structured prompts
- **AI-Powered Insights**: Automatic transcription, keyword tagging, and skill extraction
- **Interactive Engagement**: Video stories, AI-assisted interview prep, and smart scheduling
- **Collaborative Hiring**: Team-based screening with real-time feedback
- **Anonymized Screening**: Optional bias-reduction feature for initial screening
- **Video Conferencing**: Built-in interview suite with recording capabilities
- **Analytics Dashboard**: Data-driven insights to improve hiring funnel

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB (configure in `.env.local`)
- **Authentication**: JWT-based auth with jsonwebtoken
- **Real-time**: Socket.IO
- **Video Storage**: Cloudinary
- **UI Components**: Lucide React icons

## Project Structure

```
/app
├── /api                    # API routes
│   ├── /auth              # Authentication endpoints
│   ├── /job               # Job posting endpoints
│   ├── /video             # Video upload endpoints
│   └── /interview         # Interview scheduling & feedback
├── /components            # Reusable React components
│   ├── /common            # Button, Input, Modal
│   ├── /dashboard         # CandidateList, InterviewCalendar, AdminPanel
│   ├── /video-tools       # VideoCreator, VideoPlayer
│   └── /interview-suite   # VideoConference, FeedbackForm
├── /dashboard             # Dashboard pages
│   ├── /candidate         # Candidate dashboard
│   └── /employer          # Employer dashboard
├── /auth                  # Authentication pages
│   ├── /signup            # Sign up page
│   └── /login             # Login page
├── /jobs                  # Job listing pages
│   ├── page.tsx           # Jobs listing
│   └── /[id]              # Job detail page
├── /lib                   # Utilities
│   ├── mongodb.ts         # MongoDB connection
│   ├── auth.ts            # JWT utilities
│   └── ai.ts              # AI service wrappers
└── page.tsx               # Landing page
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd videocv
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/videocv
JWT_SECRET=your-secret-key-change-in-production
CLOUDINARY_URL=your-cloudinary-url
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Pages

- **Landing Page** (`/`): Hero section with two-column layout showcasing video CV concept
- **Candidate Dashboard** (`/dashboard/candidate`): Profile management, video CV creation, applications, interviews
- **Employer Dashboard** (`/dashboard/employer`): Candidate screening, job posting, interview scheduling
- **Jobs Listing** (`/jobs`): Browse and filter job postings
- **Job Detail** (`/jobs/[id]`): View job details and apply
- **Authentication** (`/auth/signup`, `/auth/login`): User registration and login

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Jobs
- `POST /api/job/create` - Post new job (employer only)

### Video
- `POST /api/video/upload` - Upload video CV

### Interviews
- `POST /api/interview/schedule` - Schedule interview
- `POST /api/interview/feedback` - Submit interview feedback

## Components

### Common Components
- **Button**: Customizable button with variants (primary, secondary, outline)
- **Input**: Form input with error handling
- **Modal**: Reusable modal dialog

### Dashboard Components
- **CandidateList**: Display candidates with ratings and actions
- **InterviewCalendar**: Show upcoming interviews
- **AdminPanel**: Platform statistics and analytics

### Video Tools
- **VideoCreator**: Record video CV with browser camera
- **VideoPlayer**: Play and control video playback

### Interview Suite
- **VideoConference**: Video call interface with controls
- **FeedbackForm**: Submit interview feedback with ratings

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Environment Variables

Required environment variables in `.env.local`:

```
MONGODB_URI              # MongoDB connection string
JWT_SECRET              # Secret key for JWT signing
CLOUDINARY_URL          # Cloudinary API URL
NEXT_PUBLIC_API_URL     # Public API URL
```

## Future Enhancements

- AI transcription integration (Google Cloud Speech-to-Text)
- Real-time video conferencing (Jitsi Meet integration)
- Advanced analytics and reporting
- Mobile app (React Native)
- Video anonymization for bias reduction
- Interview recording and playback
- Candidate skill verification tests
- Integration with ATS systems

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub or contact support@videocv.com
