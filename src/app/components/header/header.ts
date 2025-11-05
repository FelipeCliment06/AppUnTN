import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(public router: Router, public auth: Auth) {}

  goToUpload() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/resumeUpload']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/resumeUpload' } });
    }
  }

  goToExplorar() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/documents']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/documents' } });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
