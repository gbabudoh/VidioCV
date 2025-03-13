import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-employer',
  standalone: true,
  templateUrl: './login-employer.component.html',
  styleUrls: ['./login-employer.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginEmployerComponent {
  email = '';
  password = '';
  loginError = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (this.authService.login(this.email, this.password, 'employer')) {
      this.router.navigate(['/employer-dashboard']);
    } else {
      this.loginError = 'Invalid email or password';
    }
  }

  redirectToRegister() {
    this.router.navigate(['/register-employer']);  // ✅ Redirect to Register Employer Page
  }
}
