import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

interface AppUser {
  id?: number;
  username: string;
  name: string;
  lastname: string;
  mail: string;
  role: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css'],
  imports: [FormsModule],
})
export class AdminUsuarios implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  
  users = signal<AppUser[]>([]);
  filtroUsername = signal('');
  filtroNombre = signal('');
  filtroEmail = signal('');
  filtroRol = signal('');

  
  filteredUsers = computed(() => {
  const username = this.filtroUsername().toLowerCase();
  const nombre   = this.filtroNombre().toLowerCase();
  const email    = this.filtroEmail().toLowerCase();
  const rol      = this.filtroRol().toUpperCase(); 

  return this.users().filter((u) => {
    const fullName = `${u.name || ''} ${u.lastname || ''}`.toLowerCase();
    const userRol  = (u.role || '').toUpperCase();

    const matchRol =
      rol === '' ||
      (rol === 'PROFESSOR' && (userRol === 'PROFESSOR' || userRol === 'ROLE_PROFESSOR')) ||
      (rol === 'STUDENT'  && (userRol === 'STUDENT'  || userRol === 'ROLE_STUDENT'));

    return (
      (u.username || '').toLowerCase().includes(username) &&
      fullName.includes(nombre) &&
      (u.mail || '').toLowerCase().includes(email) &&
      matchRol
    );
  });
});


  usernameActual = '';


  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      alert('Token no encontrado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }

    const payload = this.decodeToken(token);
    this.usernameActual = (payload?.sub || '').toLowerCase();
    this.cargarUsuarios();
  }

  changeRole(user: AppUser, newRole: string): void {
    const label = newRole === 'PROFESSOR' ? 'Profesor' : 'Alumno';
    if (!confirm(`¿Seguro que querés cambiar el rol de ${user.username} a ${label}?`)) {
      return;
    }

    // El backend espera el username y el nuevo rol
    this.http
      .patch(`${environment.apiUrl}/users/updateRole`, { 
        username: user.username, 
        newRole: newRole 
      }, {
        headers: this.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          // Actualizamos el signal localmente para que el cambio sea instantáneo
          this.users.update((prevUsers) =>
            prevUsers.map((u) =>
              u.username === user.username ? { ...u, role: newRole } : u
            )
          );
          alert(`El usuario ahora es ${label}`);
        },
        error: (err) => {
          console.error('Error al cambiar rol:', err);
          alert('No se pudo cambiar el rol.');
        },
      });
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

  cargarUsuarios(): void {
    this.http
      .get<AppUser[]>(`${environment.apiUrl}/users/getAllUsers`, {
        headers: this.headers,
      })
      .subscribe({
        next: (users) => {
          // ❗ Acá filtramos SOLO usuarios que NO sean admin
          const soloUsuarios = users.filter(
            (u) => u.role !== 'ADMIN' && u.role !== 'ROLE_ADMIN'
          );
          this.users.set(soloUsuarios);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          alert('Error al cargar usuarios o acceso no autorizado.');
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

    if (!confirm(`¿Seguro que querés eliminar al usuario ${usernameToDeleteRaw}?`)) {
      return;
    }

    this.http
      .delete(`${environment.apiUrl}/users/deleteUser`, {
        headers: this.headers,
        body: { username: usernameToDeleteRaw },
        responseType: 'text',
      })
      .subscribe({
        next: (msg) => {
          alert(msg || 'Usuario eliminado correctamente.');
          this.users.set(
            this.users().filter(
              (u) => u.username.toLowerCase() !== usernameToDelete
            )
          );
        },
        error: (err) => {
          console.error('Error eliminando usuario:', err);
          alert('Error al eliminar el usuario.');
        },
      });
  }

 onFiltroChange(tipo: string, event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    if (tipo === 'username') this.filtroUsername.set(valor);
    if (tipo === 'nombre') this.filtroNombre.set(valor);
    if (tipo === 'email') this.filtroEmail.set(valor);
    if (tipo === 'rol') this.filtroRol.set(valor);
  }


  volverPerfil(): void {
    this.router.navigate(['/profile']);
  }

  getRolLegible(role: string): string {
    if (!role) return 'Desconocido';
    const r = role.toUpperCase();
    if (r === 'PROFESSOR' || r === 'ROLE_PROFESSOR') return 'Profesor';
    if (r === 'STUDENT' || r === 'ROLE_STUDENT') return 'Alumno';
    return role;
  }

}
