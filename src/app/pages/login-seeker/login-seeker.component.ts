import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-seeker',
  standalone: true,
  templateUrl: './login-seeker.component.html',
  styleUrls: ['./login-seeker.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginSeekerComponent {
  email = '';
  password = '';
  loginError = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (this.authService.login(this.email, this.password, 'job-seeker')) {
      this.router.navigate(['/seeker-dashboard']);
    } else {
      this.loginError = 'Invalid email or password';
    }
  }

  redirectToRegister() {
    this.router.navigate(['/register-seeker']);  // ✅ Redirect to Register Seeker Page
  }
}



