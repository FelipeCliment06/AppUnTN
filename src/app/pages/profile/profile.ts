import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  name: string;
  lastname: string;
  mail: string;
  city: string;
  about: string;
  role: string;
  password?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  public readonly auth = inject(Auth);

  userData: UserProfile | null = null;
  subjects: string[] = [];
  nuevaMateria = '';
  updateMessage = '';
  loading = false;

  isAdmin = false;
  isProfessor = false;

  materiasDisponibles = [
    { value: 'PROGRAMACION_I', label: 'Programación I' },
    { value: 'ARQUITECTURA_Y_SISTEMAS_OPERATIVOS', label: 'Arquitectura y Sistemas Operativos' },
    { value: 'MATEMATICA', label: 'Matemática' },
    { value: 'ORGANIZACION_EMPRESARIAL', label: 'Organización Empresarial' },
    { value: 'PROGRAMACION_II', label: 'Programación II' },
    { value: 'PROBABILIDAD_Y_ESTADISTICA', label: 'Probabilidad y Estadística' },
    { value: 'BASE_DE_DATOS_II', label: 'Base de Datos II' },
    { value: 'INGLES_I', label: 'Inglés I' },
    { value: 'PROGRAMACION_III', label: 'Programación III' },
    { value: 'BASE_DE_DATOS_I', label: 'Base de Datos I' },
    { value: 'METODOLOGIA_DE_SISTEMAS_I', label: 'Metodología de Sistemas I' },
    { value: 'INGLES_II', label: 'Inglés II' },
    { value: 'PROGRAMACION_IV', label: 'Programación IV' },
    { value: 'METODOLOGIA_DE_SISTEMAS_II', label: 'Metodología de Sistemas II' },
    { value: 'INTRODUCCION_AL_ANALISIS_DE_DATOS', label: 'Introducción al Análisis de Datos' },
    { value: 'LEGISLACION', label: 'Legislación' },
    { value: 'GESTION_DE_DESARROLLO_DE_SOFTWARE', label: 'Gestión de Desarrollo de Software' },
  ];

  ngOnInit(): void {
    const token = this.auth.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPerfil();
  }

  goToAdmins(): void {
    this.router.navigate(['/admin/admins']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  cargarPerfil(): void {
    const username = this.auth.getUsername();
    if (!username) return;

    this.loading = true;

    this.http.post<UserProfile>(
      'http://localhost:8080/api/users/profile',
      { username },
      { headers: this.headers }
    ).subscribe({
      next: (data) => {
        this.userData = data;
        this.loading = false;

        const role = (data.role || '').toUpperCase();
        console.log('Rol recibido:', role);

        this.isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN';
        this.isProfessor = role === 'PROFESSOR' || role === 'ROLE_PROFESSOR';

        if (this.isProfessor) {
          this.cargarMateriasProfesor();
        }
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.loading = false;
        this.auth.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  cargarMateriasProfesor(): void {
    this.http.get<string[]>('http://localhost:8080/api/users/subjects/get', { headers: this.headers })
      .subscribe({
        next: (subjects) => (this.subjects = subjects),
        error: () => (this.subjects = []),
      });
  }

  agregarMateria(): void {
    if (!this.nuevaMateria) {
      alert('Seleccioná una materia.');
      return;
    }

    this.http.put(
      'http://localhost:8080/api/users/subjects/update',
      { subjects: [this.nuevaMateria] },
      { headers: this.headers, responseType: 'text' }
    ).subscribe({
      next: (msg) => {
        alert(msg);
        this.cargarMateriasProfesor();
        this.nuevaMateria = '';
      },
      error: () => alert('Error al asignar la materia.'),
    });
  }

  eliminarMateria(materia: string): void {
    if (!confirm('¿Seguro que querés eliminar esta materia?')) return;

    this.http.delete('http://localhost:8080/api/users/subjects/delete', {
      headers: this.headers,
      body: { subject: materia },
      responseType: 'text',
    }).subscribe({
      next: (msg) => {
        alert(msg);
        this.cargarMateriasProfesor();
      },
      error: () => alert('Error al eliminar la materia.'),
    });
  }

  actualizarPerfil(): void {
    if (!this.userData) return;

    this.http.put(
      'http://localhost:8080/api/users/updateUser',
      this.userData,
      { headers: this.headers, responseType: 'text' }
    ).subscribe({
      next: (msg) => (this.updateMessage = msg),
      error: () => (this.updateMessage = 'Error actualizando el perfil.'),
    });
  }
}