import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal.service';
import { environment } from '../../../environments/environment';

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
  private readonly modal = inject(ModalService);

  admins = signal<AdminUser[]>([]);
  filtroUsername = signal('');
  filtroNombre = signal('');
  filtroEmail = signal('');

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
      this.modal.alert('Token no encontrado. Redirigiendo al login...').then(() => {
        this.router.navigate(['/login']);
      });
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
      .get<AdminUser[]>(`${environment.apiUrl}/users/getAllUsers`, {
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
          this.modal.alert('Error al cargar administradores o acceso no autorizado.');
        },
      });
  }

  async deleteUser(usernameToDeleteRaw: string): Promise<void> {
    const usernameToDelete = (usernameToDeleteRaw || '').toLowerCase();

    if (usernameToDelete === 'admin0') {
      this.modal.alert('No se puede eliminar al administrador raíz (admin0).');
      return;
    }
    if (usernameToDelete === this.usernameActual) {
      this.modal.alert('No podés eliminar tu propio usuario.');
      return;
    }

    const ok = await this.modal.confirm(
      `¿Seguro que querés eliminar al administrador ${usernameToDeleteRaw}?`
    );
    if (!ok) return;

    this.http
      .delete(`${environment.apiUrl}/users/deleteUser`, {
        headers: this.headers,
        body: { username: usernameToDeleteRaw },
        responseType: 'text',
      })
      .subscribe({
        next: (msg) => {
          this.modal.alert(msg || 'Administrador eliminado correctamente.');
          this.admins.set(
            this.admins().filter(
              (a) => a.username.toLowerCase() !== usernameToDelete
            )
          );
        },
        error: (err) => {
          console.error('Error eliminando administrador:', err);
          this.modal.alert('Error al eliminar el administrador.');
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
