import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
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

  constructor(private userService: UserService, private auth: Auth, private router: Router) {}

  onLogin() {
    const credentials = { username: this.username, password: this.password };

    this.userService.login(credentials).subscribe({
      next: (data: any) => {
        // ✅ Guardar token con el servicio Auth
        this.auth.login(data.token);

        // ✅ Guardar también el rol si viene en la respuesta
        if (data.role) {
          localStorage.setItem('role', data.role);
        }

        // ✅ Redirigir según el rol
        if (data.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']); // o la ruta que uses para admin
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.error = true;
      }
    });
  }
}
