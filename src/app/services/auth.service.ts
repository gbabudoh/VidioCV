import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly ROLE_KEY = 'userRole';

  constructor(private router: Router) {}

  login(email: string, password: string, role: 'job-seeker' | 'employer'): boolean {
    // Mock login validation
    if (email && password) {  // Simulate a successful login
      localStorage.setItem(this.TOKEN_KEY, 'mock-jwt-token');
      localStorage.setItem(this.ROLE_KEY, role);
      return true;
    }
    return false;  // Login failed
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }
}
