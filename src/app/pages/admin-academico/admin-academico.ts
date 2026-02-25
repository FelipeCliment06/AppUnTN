import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ModalService } from '../../services/modal.service';
import { environment } from '../../../environments/environment';

interface University {
  id: number;
  name: string;
  location: string;
}

interface Career {
  id: number;
  name: string;
  university: { id: number; name: string };
}

interface Subject {
  id: number;
  name: string;
  career: { id: number; name: string };
}

@Component({
  selector: 'app-admin-academico',
  standalone: true,
  templateUrl: './admin-academico.html',
  styleUrls: ['./admin-academico.css'],
  imports: [FormsModule],
})
export class AdminAcademico implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly modal = inject(ModalService);

  // ── Datos ──
  universities = signal<University[]>([]);
  careers = signal<Career[]>([]);
  subjects = signal<Subject[]>([]);

  // ── Selección cascading ──
  selectedUniversity = signal<University | null>(null);
  selectedCareer = signal<Career | null>(null);

  // ── Computed: filtrar por padre seleccionado ──
  filteredCareers = computed(() => {
    const uni = this.selectedUniversity();
    if (!uni) return [];
    return this.careers().filter(c => c.university?.id === uni.id);
  });

  filteredSubjects = computed(() => {
    const career = this.selectedCareer();
    if (!career) return [];
    return this.subjects().filter(s => s.career?.id === career.id);
  });

  // ── Formularios para agregar ──
  newUniName = '';
  newUniLocation = '';
  newCareerName = '';
  newSubjectName = '';

  // ── Edición inline ──
  editingUniId: number | null = null;
  editUniName = '';
  editUniLocation = '';

  editingCareerId: number | null = null;
  editCareerName = '';

  editingSubjectId: number | null = null;
  editSubjectName = '';

  // ── Headers ──
  private get headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`,
      'Content-Type': 'application/json',
    });
  }

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarUniversidades();
  }

  // ═══════════════════════════════════════
  //  UNIVERSIDADES
  // ═══════════════════════════════════════

  cargarUniversidades(): void {
    this.http
      .get<University[]>(`${environment.apiUrl}/admin/universities/getAll`, { headers: this.headers })
      .subscribe({
        next: (data) => {
          this.universities.set(data);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando universidades:', err),
      });
  }

  selectUniversity(uni: University): void {
    if (this.selectedUniversity()?.id === uni.id) {
      this.selectedUniversity.set(null);
      this.selectedCareer.set(null);
      return;
    }
    this.selectedUniversity.set(uni);
    this.selectedCareer.set(null);
    this.cargarCarreras();
  }

  agregarUniversidad(): void {
    if (!this.newUniName.trim()) {
      this.modal.alert('El nombre de la universidad es obligatorio.');
      return;
    }

    const body = { name: this.newUniName.trim(), location: this.newUniLocation.trim() };

    this.http
      .post<University>(`${environment.apiUrl}/admin/universities/create`, body, { headers: this.headers })
      .subscribe({
        next: () => {
          this.newUniName = '';
          this.newUniLocation = '';
          this.cargarUniversidades();
        },
        error: (err) => {
          console.error('Error creando universidad:', err);
          this.modal.alert(err.error || 'Error al crear la universidad.');
        },
      });
  }

  startEditUni(uni: University): void {
    this.editingUniId = uni.id;
    this.editUniName = uni.name;
    this.editUniLocation = uni.location || '';
  }

  cancelEditUni(): void {
    this.editingUniId = null;
  }

  saveEditUni(uni: University): void {
    if (!this.editUniName.trim()) {
      this.modal.alert('El nombre no puede estar vacío.');
      return;
    }

    const body = { id: uni.id, name: this.editUniName.trim(), location: this.editUniLocation.trim() };

    this.http
      .put<University>(`${environment.apiUrl}/admin/universities/update`, body, { headers: this.headers })
      .subscribe({
        next: () => {
          this.editingUniId = null;
          this.cargarUniversidades();
          if (this.selectedUniversity()?.id === uni.id) {
            this.selectedUniversity.set({ ...uni, name: body.name, location: body.location });
          }
        },
        error: (err) => {
          console.error('Error editando universidad:', err);
          this.modal.alert(err.error || 'Error al editar la universidad.');
        },
      });
  }

  async eliminarUniversidad(uni: University): Promise<void> {
    const ok = await this.modal.confirm(
      `¿Eliminar "${uni.name}"? Se eliminarán todas sus carreras y materias.`
    );
    if (!ok) return;

    this.http
      .delete(`${environment.apiUrl}/admin/universities/delete/${uni.id}`, {
        headers: this.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          if (this.selectedUniversity()?.id === uni.id) {
            this.selectedUniversity.set(null);
            this.selectedCareer.set(null);
          }
          this.cargarUniversidades();
        },
        error: (err) => {
          console.error('Error eliminando universidad:', err);
          this.modal.alert('Error al eliminar la universidad.');
        },
      });
  }

  // ═══════════════════════════════════════
  //  CARRERAS
  // ═══════════════════════════════════════

  cargarCarreras(): void {
    this.http
      .get<Career[]>(`${environment.apiUrl}/admin/careers/getAll`, { headers: this.headers })
      .subscribe({
        next: (data) => {
          this.careers.set(data);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando carreras:', err),
      });
  }

  selectCareer(career: Career): void {
    if (this.selectedCareer()?.id === career.id) {
      this.selectedCareer.set(null);
      return;
    }
    this.selectedCareer.set(career);
    this.cargarMaterias();
  }

  agregarCarrera(): void {
    const uni = this.selectedUniversity();
    if (!uni) return;
    if (!this.newCareerName.trim()) {
      this.modal.alert('El nombre de la carrera es obligatorio.');
      return;
    }

    const body = { name: this.newCareerName.trim(), university: { id: uni.id } };

    this.http
      .post<Career>(`${environment.apiUrl}/admin/careers/create`, body, { headers: this.headers })
      .subscribe({
        next: () => {
          this.newCareerName = '';
          this.cargarCarreras();
        },
        error: (err) => {
          console.error('Error creando carrera:', err);
          this.modal.alert(err.error || 'Error al crear la carrera.');
        },
      });
  }

  startEditCareer(career: Career): void {
    this.editingCareerId = career.id;
    this.editCareerName = career.name;
  }

  cancelEditCareer(): void {
    this.editingCareerId = null;
  }

  saveEditCareer(career: Career): void {
    if (!this.editCareerName.trim()) {
      this.modal.alert('El nombre no puede estar vacío.');
      return;
    }

    const body = { id: career.id, name: this.editCareerName.trim(), university: { id: career.university.id } };

    this.http
      .put<Career>(`${environment.apiUrl}/admin/careers/update`, body, { headers: this.headers })
      .subscribe({
        next: () => {
          this.editingCareerId = null;
          this.cargarCarreras();
          if (this.selectedCareer()?.id === career.id) {
            this.selectedCareer.set({ ...career, name: body.name });
          }
        },
        error: (err) => {
          console.error('Error editando carrera:', err);
          this.modal.alert(err.error || 'Error al editar la carrera.');
        },
      });
  }

  async eliminarCarrera(career: Career): Promise<void> {
    const ok = await this.modal.confirm(
      `¿Eliminar "${career.name}"? Se eliminarán todas sus materias.`
    );
    if (!ok) return;

    this.http
      .delete(`${environment.apiUrl}/admin/careers/delete/${career.id}`, {
        headers: this.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          if (this.selectedCareer()?.id === career.id) {
            this.selectedCareer.set(null);
          }
          this.cargarCarreras();
        },
        error: (err) => {
          console.error('Error eliminando carrera:', err);
          this.modal.alert('Error al eliminar la carrera.');
        },
      });
  }

  // ═══════════════════════════════════════
  //  MATERIAS
  // ═══════════════════════════════════════

  cargarMaterias(): void {
    this.http
      .get<Subject[]>(`${environment.apiUrl}/admin/subjects/getAll`, { headers: this.headers })
      .subscribe({
        next: (data) => {
          this.subjects.set(data);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando materias:', err),
      });
  }

  agregarMateria(): void {
    const career = this.selectedCareer();
    if (!career) return;
    if (!this.newSubjectName.trim()) {
      this.modal.alert('El nombre de la materia es obligatorio.');
      return;
    }

    const body = { name: this.newSubjectName.trim(), career: { id: career.id } };

    this.http
      .post<Subject>(`${environment.apiUrl}/admin/subjects/create`, body, { headers: this.headers })
      .subscribe({
        next: () => {
          this.newSubjectName = '';
          this.cargarMaterias();
        },
        error: (err) => {
          console.error('Error creando materia:', err);
          this.modal.alert(err.error || 'Error al crear la materia.');
        },
      });
  }

  startEditSubject(subject: Subject): void {
    this.editingSubjectId = subject.id;
    this.editSubjectName = subject.name;
  }

  cancelEditSubject(): void {
    this.editingSubjectId = null;
  }

  saveEditSubject(subject: Subject): void {
    if (!this.editSubjectName.trim()) {
      this.modal.alert('El nombre no puede estar vacío.');
      return;
    }

    const body = { id: subject.id, name: this.editSubjectName.trim(), career: { id: subject.career.id } };

    this.http
      .put<Subject>(`${environment.apiUrl}/admin/subjects/update`, body, { headers: this.headers })
      .subscribe({
        next: () => {
          this.editingSubjectId = null;
          this.cargarMaterias();
        },
        error: (err) => {
          console.error('Error editando materia:', err);
          this.modal.alert(err.error || 'Error al editar la materia.');
        },
      });
  }

  async eliminarMateria(subject: Subject): Promise<void> {
    const ok = await this.modal.confirm(`¿Eliminar la materia "${subject.name}"?`);
    if (!ok) return;

    this.http
      .delete(`${environment.apiUrl}/admin/subjects/delete/${subject.id}`, {
        headers: this.headers,
        responseType: 'text',
      })
      .subscribe({
        next: () => this.cargarMaterias(),
        error: (err) => {
          console.error('Error eliminando materia:', err);
          this.modal.alert('Error al eliminar la materia.');
        },
      });
  }

  // ── Navegación ──
  volverPerfil(): void {
    this.router.navigate(['/profile']);
  }
}
