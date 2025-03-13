import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-seeker',
  standalone: true,
  template: `
    <section class="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 my-10">
      <h2 class="text-2xl font-bold mb-6 text-center text-blue-600">Job Seeker Registration</h2>
      <form (submit)="register(); $event.preventDefault()">
        <input type="text" placeholder="Full Name" class="border p-2 w-full mb-4 rounded" [(ngModel)]="fullName" name="fullName" required>
        <input type="email" placeholder="Email" class="border p-2 w-full mb-4 rounded" [(ngModel)]="email" name="email" required>
        <input type="password" placeholder="Password" class="border p-2 w-full mb-6 rounded" [(ngModel)]="password" name="password" required>
        <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded w-full">Register</button>
      </form>
    </section>
  `,
  styles: [],
  imports: [CommonModule, FormsModule]
})
export class RegisterSeekerComponent {
  fullName = '';
  email = '';
  password = '';

  register() {
    console.log("Job Seeker Registered:", this.fullName, this.email);
    // Replace with real registration logic
  }
}

