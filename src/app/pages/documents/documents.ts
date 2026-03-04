import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class Documents implements OnInit {

  token: string = '';
  allDocs: any[] = [];
  filtrados: any[] = [];
  nombre: string = '';
  autor: string = '';

  allUniversities: any[] = [];
  allCareers: any[] = [];
  allSubjects: any[] = [];

  filteredCareers: any[] = [];
  filteredSubjects: any[] = [];

  selectedUniversityId: number | null = null;
  selectedCareerId: number | null = null;
  selectedSubjectId: number | null = null;
  orden: string = 'recientes';

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token') ?? '';

    this.documentService.getAllDocuments(this.token).subscribe({
      next: (data) => {
        this.allDocs = data;
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al precargar documentos')
    });

    this.documentService.getUniversities(this.token).subscribe(data => {
      this.allUniversities = data;
      this.cdr.detectChanges();
    });

    this.documentService.getCareers(this.token).subscribe(data => {
      this.allCareers = data;
      this.cdr.detectChanges();
    });

    this.documentService.getSubjects(this.token).subscribe(data => {
      this.allSubjects = data;
      this.cdr.detectChanges();
    });
  }

  onUniversityChange(): void {
    this.selectedCareerId = null;
    this.selectedSubjectId = null;
    this.filteredSubjects = [];
    this.filteredCareers = this.allCareers.filter(c => c.university?.id == this.selectedUniversityId);
  }

  onCareerChange(): void {
    this.selectedSubjectId = null;
    this.filteredSubjects = this.allSubjects.filter(s => s.career?.id == this.selectedCareerId);
  }

  filtrar(): void {
    if (!this.selectedSubjectId && !this.nombre && !this.autor) {
      this.filtrados = [];
      return;
    }

    this.filtrados = this.allDocs.filter(doc => {
      const coincideMateria = !this.selectedSubjectId ||
        doc.subjectId === this.selectedSubjectId;

      const coincideNombre = !this.nombre ||
        (doc.title && doc.title.toLowerCase().includes(this.nombre.toLowerCase().trim()));

      const coincideAutor = !this.autor ||
        (doc.authorUsername && doc.authorUsername.toLowerCase().includes(this.autor.toLowerCase().trim()));

      return coincideMateria && coincideNombre && coincideAutor;
    });

    this.cdr.detectChanges();
  }

  cambiarOrden(): void {
    this.documentService.getAllDocuments(this.token, this.orden).subscribe({
      next: (data) => {
        this.allDocs = data;
        this.filtrar();
        this.cdr.detectChanges();
      },
      error: () => console.error('Error al cargar documentos')
    });
  }

  seleccionarDocumento(id: number) {
    this.router.navigate(['/document-preview', id]);
  }
}
