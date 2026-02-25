// src/app/pages/profile/profile.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';
import { UserService, UserProfile } from '../../services/user-service';
import { ModalService } from '../../services/modal.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {

  private readonly router      = inject(Router);
  private readonly cdr         = inject(ChangeDetectorRef);
  public  readonly auth        = inject(Auth);
  private readonly userService = inject(UserService);
  private readonly modal       = inject(ModalService);

  userData: UserProfile | null = null;
  subjects: string[] = [];
  nuevaMateria = '';
  updateMessage = '';
  loading = false;
  myDocuments: any[] = [];

  universidades = signal<any[]>([]);
  carreras = signal<any[]>([]);
  materiasFiltradas = signal<any[]>([]);

  selectedUniId: number | null = null;
  selectedCareerId: number | null = null;
  selectedSubjectId: number | null = null;

  isAdmin = false;
  isProfessor = false;

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargarPerfil();
    this.cargarMisDocumentos();
    this.cargarUniversidades();
  }

  // Navegación paneles admin
  goToAdmins(): void {
    this.router.navigate(['/admin-admins']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin-usuarios']);
  }

  goToAcademico(): void {
    this.router.navigate(['/admin-academico']);
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

        this.isAdmin     = this.userService.isAdminRole(role);
        this.isProfessor = this.userService.isProfessorRole(role);

        if (this.isProfessor) {
          this.cargarMateriasProfesor();
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
  cargarUniversidades(): void {
    this.userService.getUniversities().subscribe({
      next: (unis) => this.universidades.set(unis),
      error: (err) => console.error('Error cargando universidades', err)
    });
  }

  onUniversityChange(id: string): void {
    this.selectedUniId = id ? Number(id) : null;
    this.selectedCareerId = null;
    this.selectedSubjectId = null;
    this.carreras.set([]);
    this.materiasFiltradas.set([]);

    if (this.selectedUniId) {
      this.userService.getCareersByUniversity(this.selectedUniId).subscribe({
        next: (data) => this.carreras.set(data),
        error: (err) => console.error('Error cargando carreras', err)
      });
    }
  }

  onCareerChange(id: string): void {
    this.selectedCareerId = id ? Number(id) : null;
    this.selectedSubjectId = null;
    this.materiasFiltradas.set([]);

    if (this.selectedCareerId) {
      this.userService.getSubjectsByCareer(this.selectedCareerId).subscribe({
        next: (data) => this.materiasFiltradas.set(data),
        error: (err) => console.error('Error cargando materias', err)
      });
    }
  }

  cargarMateriasProfesor(): void {
    this.userService.getSubjects().subscribe({
      next: (res) => {
        this.subjects = res.map((s: any) => s.name || s);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener materias del profesor:', err);
        this.subjects = [];
        this.cdr.detectChanges();
      },
    });
  }

  agregarMateria(): void {
    if (!this.selectedSubjectId) {
      this.modal.alert('Por favor, seleccioná una materia del listado escalonado.');
      return;
    }

    this.userService.addSubjectById(this.selectedSubjectId).subscribe({
      next: (msg) => {
        this.modal.alert(msg);
        this.cargarMateriasProfesor();
        this.selectedSubjectId = null;
      },
      error: () => this.modal.alert('Error al asignar la materia.'),
    });
  }

  async eliminarMateria(materia: string): Promise<void> {
    const ok = await this.modal.confirm('¿Seguro que querés eliminar esta materia?');
    if (!ok) return;

    this.userService.deleteSubject(materia).subscribe({
      next: (msg) => {
        this.modal.alert(msg);
        this.cargarMateriasProfesor();
      },
      error: () => this.modal.alert('Error al eliminar la materia.'),
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

  // ============ Documents ==========
  cargarMisDocumentos(): void {
    this.userService.getMyDocuments().subscribe({
      next: (docs) => {
        this.myDocuments = docs;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('STATUS:', err.status);
        console.error('BODY:', err.error);
        console.error('RAW ERROR:', err);
      }
    });
  }

  async eliminarDocumento(id: number): Promise<void> {
    const ok = await this.modal.confirm('¿Seguro que querés eliminar este documento?');
    if (!ok) return;

    this.userService.deleteDocument(id).subscribe({
      next: (msg) => {
        this.modal.alert(msg);
        this.cargarMisDocumentos();
      },
      error: (err) => {
        this.modal.alert('Error al eliminar el documento.');
        console.error(err);
      }
    });
  }
}
