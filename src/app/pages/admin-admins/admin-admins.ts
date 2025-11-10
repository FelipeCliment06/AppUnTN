import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

interface AdminUser {
  username: string;
  name: string;
  lastname: string;
  mail: string;
  role: string;
}

@Component({
  selector: 'app-admin-admins',
  standalone: true,
  templateUrl: './admin-admins.html',
  styleUrls: ['./admin-admins.css'],
  imports: [FormsModule, RouterLink],
})
export class AdminAdmins implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // ✅ signals modernas
  admins = signal<AdminUser[]>([]);
  filtroUsername = signal('');
  filtroNombre = signal('');
  filtroEmail = signal('');

  // ✅ computed signal en lugar de método
  filteredAdmins = computed(() => {
    const username = this.filtroUsername().toLowerCase();
    const nombre = this.filtroNombre().toLowerCase();
    const email = this.filtroEmail().toLowerCase();

    return this.admins().filter((u) => {
      const fullName = `${u.name || ''} ${u.lastname || ''}`.toLowerCase();
      return (
        (u.username || '').toLowerCase().includes(username) &&
        fullName.includes(nombre) &&
        (u.mail || '').toLowerCase().includes(email)
      );
    });
  });

  usernameActual = '';
  roleActual = '';

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      alert('Token no encontrado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }

    const payload = this.decodeToken(token);
    this.usernameActual = (payload?.sub || '').toLowerCase();
    this.roleActual = payload?.role || '';

    this.cargarAdmins();
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  cargarAdmins(): void {
    this.http
      .get<AdminUser[]>('http://localhost:8080/api/users/getAllUsers', {
        headers: this.headers,
      })
      .subscribe({
        next: (users) => {
          const soloAdmins = users.filter(
            (u) => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN'
          );
          this.admins.set(soloAdmins);
        },
        error: (err) => {
          console.error('Error cargando administradores:', err);
          alert('Error al cargar administradores o acceso no autorizado.');
        },
      });
  }

  deleteUser(usernameToDeleteRaw: string): void {
    const usernameToDelete = (usernameToDeleteRaw || '').toLowerCase();

    if (usernameToDelete === 'admin0') {
      alert('No se puede eliminar al administrador raíz (admin0).');
      return;
    }
    if (usernameToDelete === this.usernameActual) {
      alert('No podés eliminar tu propio usuario.');
      return;
    }

    if (
      !confirm(`¿Seguro que querés eliminar al administrador ${usernameToDeleteRaw}?`)
    )
      return;

    this.http
      .delete('http://localhost:8080/api/users/deleteUser', {
        headers: this.headers,
        body: { username: usernameToDeleteRaw },
        responseType: 'text',
      })
      .subscribe({
        next: (msg) => {
          alert(msg || 'Administrador eliminado correctamente.');
          this.admins.set(
            this.admins().filter(
              (a) => a.username.toLowerCase() !== usernameToDelete
            )
          );
        },
        error: (err) => {
          console.error('Error eliminando administrador:', err);
          alert('Error al eliminar el administrador.');
        },
      });
  }

  onFiltroChange(tipo: 'username' | 'nombre' | 'email', event: Event): void {
  const valor = (event.target as HTMLInputElement).value;
  if (tipo === 'username') this.filtroUsername.set(valor);
  if (tipo === 'nombre') this.filtroNombre.set(valor);
  if (tipo === 'email') this.filtroEmail.set(valor);
}


  volverPerfil(): void {
    this.router.navigate(['/profile']);
  }
}