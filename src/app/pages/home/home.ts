import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
constructor(private router: Router) {}

  // 🚀 Si el usuario intenta subir o explorar sin login
  navigateIfLoggedIn(path: string) {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/login']);
    }
  }

}
