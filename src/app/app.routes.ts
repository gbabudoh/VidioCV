import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UploadCvComponent } from './pages/upload-cv/upload-cv.component';
import { PostJobComponent } from './pages/post-job/post-job.component';
import { VideoCvListComponent } from './pages/video-cv-list/video-cv-list.component';
import { JobListComponent } from './pages/job-list/job-list.component';
import { LoginSeekerComponent } from './pages/login-seeker/login-seeker.component';
import { LoginEmployerComponent } from './pages/login-employer/login-employer.component';
import { RegisterSeekerComponent } from './pages/register-seeker/register-seeker.component';
import { RegisterEmployerComponent } from './pages/register-employer/register-employer.component';
import { SeekerDashboardComponent } from './pages/seeker-dashboard/seeker-dashboard.component';
import { EmployerDashboardComponent } from './pages/employer-dashboard/employer-dashboard.component';
import { GetStartedComponent } from './pages/get-started/get-started.component';
import { AuthGuard } from './guards/auth.guard';  // ✅ Import AuthGuard

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload-cv', component: UploadCvComponent, canActivate: [AuthGuard] },  // 🔒 Protected
  { path: 'post-job', component: PostJobComponent, canActivate: [AuthGuard] },    // 🔒 Protected
  { path: 'video-cvs', component: VideoCvListComponent },
  { path: 'jobs', component: JobListComponent },
  { path: 'login-seeker', component: LoginSeekerComponent },
  { path: 'login-employer', component: LoginEmployerComponent },
  { path: 'register-seeker', component: RegisterSeekerComponent },
  { path: 'register-employer', component: RegisterEmployerComponent },
  { path: 'get-started', component: GetStartedComponent },
  { path: 'seeker-dashboard', component: SeekerDashboardComponent, canActivate: [AuthGuard] },  // 🔒 Protected
  { path: 'employer-dashboard', component: EmployerDashboardComponent, canActivate: [AuthGuard] }  // 🔒 Protected
];



