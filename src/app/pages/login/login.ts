import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  error = false;

  constructor(private http: HttpClient, private router: Router, private auth: Auth) {}

  onLogin() {
    const credentials = { username: this.username, password: this.password };

    this.http.post('http://localhost:8080/api/auth/login', credentials).subscribe({
      next: (data: any) => {
        // ✅ usar el servicio Auth
        this.auth.login(data.token);

        // Redirigir al home
        this.router.navigate(['/home']);
      },
      error: () => {
        this.error = true;
      }
    });
  }
}
