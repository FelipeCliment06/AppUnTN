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
  materia: string = '';

  allUniversities: any[] = [];
  allCareers: any[] = [];
  allSubjects: any[] = [];

  filteredCareers: any[] = [];
  filteredSubjects: any[] = [];

  selectedUniversityId: number | null = null;
  selectedCareerId: number | null = null;
  orden: string = 'recientes';

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private auth: Auth // Ojo, vi que lo inyectaste pero en tu archivo no estaba el import de Auth. Asegurate de tenerlo.
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

    // 2. Cargar listas para los filtros en cascada
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

  // 🔥 NUEVO: Lógica de cascada
  onUniversityChange(): void {
    this.selectedCareerId = null;
    this.materia = ''; 
    this.filteredSubjects = [];
    this.filteredCareers = this.allCareers.filter(c => c.university?.id == this.selectedUniversityId);
  }

  onCareerChange(): void {
    this.materia = ''; 
    this.filteredSubjects = this.allSubjects.filter(s => s.career?.id == this.selectedCareerId);
  }

  // Lógica de filtrado adaptada al nuevo Backend
  filtrar(): void {
    // 🕵️‍♂️ 1. Imprimimos en consola para ver qué está pasando
    console.log("Filtros -> Materia:", this.materia, "| Nombre:", this.nombre, "| Autor:", this.autor);
    console.log("Todos los documentos traídos del back:", this.allDocs);

    if (!this.materia && !this.nombre && !this.autor) {
      this.filtrados = [];
      return;
    }

    this.filtrados = this.allDocs.filter(doc => {
      // 🛡️ 2. BLINDAJE: Extraemos el nombre de la materia sin importar si el back manda un Objeto o un String
      const nombreMateriaDoc = doc.subject?.name ? doc.subject.name : doc.subject;

      // Comparamos sin importar mayúsculas, minúsculas o espacios extra
      const coincideMateria = !this.materia || 
        (nombreMateriaDoc && nombreMateriaDoc.toString().toLowerCase().trim() === this.materia.toLowerCase().trim());
      
      const coincideNombre = !this.nombre || 
        (doc.title && doc.title.toLowerCase().includes(this.nombre.toLowerCase().trim()));
      
      const coincideAutor = !this.autor || 
        (doc.authorUsername && doc.authorUsername.toLowerCase().includes(this.autor.toLowerCase().trim()));

      return coincideMateria && coincideNombre && coincideAutor;
    });

    console.log("Resultados después de filtrar:", this.filtrados);
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
