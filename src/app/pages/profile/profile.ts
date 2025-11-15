// src/app/pages/profile/profile.ts
import { ChangeDetectorRef, Component, OnInit, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';
import { UserService, UserProfile } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {

  // inyección “estilo Angular moderno”
  private readonly router      = inject(Router);
  private readonly cdr         = inject(ChangeDetectorRef);
  public  readonly auth        = inject(Auth);
  private readonly userService = inject(UserService);

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

    // Igual que en la rama que funciona:
    afterNextRender(() => {
      if (this.isProfessor) {
        this.cargarMateriasProfesor();
      }
    });
  }

  // Navegación paneles admin
  goToAdmins(): void {
    this.router.navigate(['/admin-admins']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin-usuarios']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  // ===== Perfil =====
  cargarPerfil(): void {
    const username = this.auth.getUsername();
    if (!username) return;

    this.loading = true;

    this.userService.getProfile(username).subscribe({
      next: (data) => {
        this.userData = data;
        this.loading = false;

        const role = (data.role || '').toUpperCase();
        console.log('Rol recibido:', role);

        this.isAdmin     = this.userService.isAdminRole(role);
        this.isProfessor = this.userService.isProfessorRole(role);

        // Igual que en la versión que anda:
        if (this.isProfessor) {
          setTimeout(() => {
            this.cargarMateriasProfesor();
          }, 1000);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.loading = false;
        this.auth.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  // ===== Materias (profesor) =====
  cargarMateriasProfesor(): void {
    console.log('Cargando materias del profesor...');

    this.userService.getSubjects().subscribe({
      next: (subjects) => {
        console.log('Materias recibidas desde el backend:', subjects);
        this.subjects = subjects.map((s: any) => s.name || s);
        console.log('Materias procesadas para mostrar:', this.subjects);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener materias:', err);
        this.subjects = [];
        this.cdr.detectChanges();
      },
    });
  }

  agregarMateria(): void {
    if (!this.nuevaMateria) {
      alert('Seleccioná una materia.');
      return;
    }

    this.userService.addSubject(this.nuevaMateria).subscribe({
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

    this.userService.deleteSubject(materia).subscribe({
      next: (msg) => {
        alert(msg);
        this.cargarMateriasProfesor();
      },
      error: () => alert('Error al eliminar la materia.'),
    });
  }

  // ===== Actualizar perfil =====
  actualizarPerfil(): void {
    if (!this.userData) return;

    this.userService.updateProfile(this.userData).subscribe({
      next: (msg) => (this.updateMessage = msg),
      error: () => (this.updateMessage = 'Error actualizando el perfil.'),
    });
  }
}
