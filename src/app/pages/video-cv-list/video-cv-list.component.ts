import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-video-cv-list',
  standalone: true,
  templateUrl: './video-cv-list.component.html',
  styleUrls: ['./video-cv-list.component.css'],
  imports: [CommonModule, FormsModule, SafeUrlPipe]
})
export class VideoCvListComponent {
  filterSkill = '';
  filterCountry = '';

  videoCVs = [
    {
      name: 'John Doe',
      skillset: 'Frontend Developer',
      youtubeLink: 'https://www.youtube.com/embed/your-video-id',
      profileImage: 'https://via.placeholder.com/50',
      email: 'johndoe@example.com',
      contact: '+123456789',
      location: 'Remote'
    },
    {
      name: 'Jane Smith',
      skillset: 'Digital Marketing Specialist',
      youtubeLink: 'https://www.youtube.com/embed/your-video-id',
      profileImage: '',
      email: 'janesmith@example.com',
      contact: '+1987654321',
      location: 'New York, USA'
    }
  ];

  get filteredVideoCVs() {
    return this.videoCVs.filter(cv =>
      (this.filterSkill === '' || cv.skillset.toLowerCase().includes(this.filterSkill.toLowerCase())) &&
      (this.filterCountry === '' || cv.location.toLowerCase().includes(this.filterCountry.toLowerCase()))
    );
  }
}
