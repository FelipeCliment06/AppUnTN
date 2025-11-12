import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { Auth } from '../../services/auth';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './documents.html',
  styleUrl: './documents.css',
})
export class Documents implements OnInit {
  documents: any[] = [];
  filteredDocs: any[] = [];
  subjects: string[] = [
    'PROGRAMACION_I', 'ARQUITECTURA_Y_SISTEMAS_OPERATIVOS', 'MATEMATICA',
    'ORGANIZACION_EMPRESARIAL', 'PROGRAMACION_II', 'PROBABILIDAD_Y_ESTADISTICA',
    'BASE_DE_DATOS_I', 'BASE_DE_DATOS_II', 'INGLES_I', 'PROGRAMACION_III',
    'METODOLOGIA_DE_SISTEMAS_I', 'INGLES_II', 'PROGRAMACION_IV',
    'METODOLOGIA_DE_SISTEMAS_II', 'INTRODUCCION_AL_ANALISIS_DE_DATOS',
    'LEGISLACION', 'GESTION_DE_DESARROLLO_DE_SOFTWARE'
  ];

  filterSubject = '';
  filterName = '';
  filterAuthor = '';
  message = '';
  isLoading = false;

  constructor(private documentService: DocumentService, private auth: Auth) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.message = 'Debe iniciar sesión para ver los documentos.';
      return;
    }

    this.isLoading = true;
    this.documentService.getAllDocuments(token).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.filteredDocs = docs;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener documentos:', err);
        this.message = 'Error al cargar los documentos.';
        this.isLoading = false;
      },
    });
  }

  filterDocuments(): void {
    this.filteredDocs = this.documents.filter(doc => {
      const bySubject = !this.filterSubject || doc.subject === this.filterSubject;
      const byName = !this.filterName || doc.title.toLowerCase().includes(this.filterName.toLowerCase());
      const byAuthor = !this.filterAuthor || (doc.authorUsername && doc.authorUsername.toLowerCase().includes(this.filterAuthor.toLowerCase()));
      return bySubject && byName && byAuthor;
    });
  }

  clearFilters(): void {
    this.filterSubject = '';
    this.filterName = '';
    this.filterAuthor = '';
    this.filteredDocs = [...this.documents];
  }
}
