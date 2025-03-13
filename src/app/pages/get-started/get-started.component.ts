import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-get-started',
  standalone: true,
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.css'],
  imports: [CommonModule, RouterModule]
})
export class GetStartedComponent {}

