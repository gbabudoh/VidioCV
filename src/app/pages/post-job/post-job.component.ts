import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-job',
  standalone: true,
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PostJobComponent {
  title = '';
  company = '';
  location = '';
  jobType = 'Full-time';
  salary = '';
  description = '';
  contactEmail = '';
  isSubmitting = false;

  postJob() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      setTimeout(() => {
        alert('Job posted successfully!');
        this.isSubmitting = false;
      }, 2000);
    } else {
      alert('Please fill in all required fields.');
    }
  }

  isFormValid(): boolean {
    return this.title && this.company && this.location && this.description && this.contactEmail ? true : false;
  }
}

