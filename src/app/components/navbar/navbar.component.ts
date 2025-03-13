import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, CommonModule]
})
export class NavbarComponent {
  menuOpen = false;
  loginMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.loginMenuOpen = false;
  }

  toggleLoginMenu() {
    this.loginMenuOpen = !this.loginMenuOpen;
  }

  closeLoginMenu() {
    this.loginMenuOpen = false;
    this.menuOpen = false;
  }

  handlePostJob() {
    if (this.authService.isAuthenticated()) {
      if (this.authService.getRole() === 'employer') {
        this.router.navigate(['/post-job']);
      } else {
        alert('Only employers can post jobs.');
      }
    } else {
      this.router.navigate(['/login-employer']);
    }
  }
}


