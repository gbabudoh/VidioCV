import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Job {
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary?: string;
  description: string;
}

@Component({
  selector: 'app-job-list',
  standalone: true,
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css'],
  imports: [CommonModule, FormsModule]
})
export class JobListComponent {
  filterKeyword = '';
  filterJobType = '';
  filterCountry = '';

  jobs: Job[] = [
    { title: 'Frontend Developer', company: 'Tech Corp', location: 'USA', jobType: 'Full-time', salary: '$70,000 - $90,000', description: 'Develop and maintain front-end features.' },
    { title: 'Backend Developer', company: 'Innovate LLC', location: 'UK', jobType: 'Part-time', salary: '$50,000 - $60,000', description: 'Build scalable backend systems.' },
    { title: 'Digital Marketer', company: 'MarketMinds', location: 'Canada', jobType: 'Remote', description: 'Plan and execute digital marketing campaigns.' },
    { title: 'Data Analyst', company: 'DataWorks', location: 'Australia', jobType: 'Contract', salary: '$60,000 - $75,000', description: 'Analyze and interpret complex data sets.' },
  ];

  get filteredJobs(): Job[] {
    return this.jobs.filter(job =>
      (!this.filterKeyword || job.title.toLowerCase().includes(this.filterKeyword.toLowerCase())) &&
      (!this.filterJobType || job.jobType === this.filterJobType) &&
      (!this.filterCountry || job.location.toLowerCase().includes(this.filterCountry.toLowerCase()))
    );
  }
}

