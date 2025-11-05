import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  errorMessage = '';

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

    const role = this.authService.getRoleFromToken();
    if (role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
      alert('No tenés permiso para acceder a esta página.');
      this.router.navigate(['/profile']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // Filtra solo STUDENT y PROFESSOR
        this.users = data.filter(
          (u: any) => u.role === 'STUDENT' || u.role === 'PROFESSOR'
        );
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error cargando usuarios.';
        this.loading = false;
      }
    });
  }

  deleteUser(username: string): void {
    if (!confirm(`¿Estás seguro que querés eliminar a ${username}? Esta acción es irreversible.`)) return;

    this.userService.deleteUser(username).subscribe({
      next: (msg) => {
        alert(msg);
        this.loadUsers();
      },
      error: () => alert('Error eliminando el usuario.')
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
