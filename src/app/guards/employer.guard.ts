import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployerGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.getRole() === 'employer') {
      return true;
    } else {
      this.router.navigate(['/login-employer']);  // ✅ Redirect to Employer Login
      return false;
    }
  }
}
