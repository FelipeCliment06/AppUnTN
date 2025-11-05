import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-admins',
  templateUrl: './admin-admins.html',
  styleUrls: ['./admin-admins.css']
})
export class AdminAdminsComponent implements OnInit {
  admins: any[] = [];
  role: string | null = null;
  username: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      alert('Token no encontrado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.authService.getUsernameFromToken();
    this.role = this.authService.getRoleFromToken();

    this.loadAdmins();
  }

  loadAdmins(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.admins = users.filter((u: any) => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN');
      },
      error: (err) => {
        console.error('Error cargando administradores:', err);
        if (err.status === 403) {
          alert('No estás autorizado para acceder a esta función.');
        } else {
          alert('Ocurrió un error cargando administradores.');
        }
      }
    });
  }

  deleteUser(username: string): void {
    if (!confirm(`¿Estás seguro que querés eliminar al administrador ${username}?`)) return;

    this.userService.deleteUser(username).subscribe({
      next: (msg) => {
        alert(msg);
        this.loadAdmins();
      },
      error: () => alert('Error eliminando el administrador.')
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  goToRegisterAdmin(): void {
  this.router.navigate(['/register'], { queryParams: { role: 'ADMIN' } });
  }
}
