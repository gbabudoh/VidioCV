import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-cv',
  standalone: true,
  templateUrl: './upload-cv.component.html',
  styleUrls: ['./upload-cv.component.css'],
  imports: [CommonModule, FormsModule]
})
export class UploadCvComponent {
  youtubeLink = '';
  name = '';
  email = '';
  phone = '';
  country = '';
  city = '';
  portfolio = '';
  isSubmitting = false;

  uploadCV() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      setTimeout(() => {
        alert('CV uploaded successfully!');
        this.isSubmitting = false;
      }, 2000);
    } else {
      alert('Please fill in all required fields.');
    }
  }

  isFormValid(): boolean {
    return this.youtubeLink && this.name && this.email && this.phone && this.country ? true : false;
  }
}
