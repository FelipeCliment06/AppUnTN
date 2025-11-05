import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';
  error = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = false;
    try {
      const token = await this.authService.login(this.username, this.password);
      localStorage.setItem('jwt', token);
      await this.router.navigate(['/profile']);
    } catch {
      this.error = true;
    }
  }
}
