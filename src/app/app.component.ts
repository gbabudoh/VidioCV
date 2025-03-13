import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [NavbarComponent, RouterOutlet, RouterModule]   // ✅ Added RouterOutlet and RouterModule
})
export class AppComponent {
  title = 'vidiocv';   // ✅ Keep this line for the title
}
