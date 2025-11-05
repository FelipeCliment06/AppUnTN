import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../../services/document-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class Documents implements OnInit {
  documents: any[] = [];
  selectedSubject: string = '';
  errorMessage = '';
  subjects = [
    'PROGRAMACION_I', 'ARQUITECTURA_Y_SISTEMAS_OPERATIVOS', 'MATEMATICA',
    'ORGANIZACION_EMPRESARIAL', 'PROGRAMACION_II', 'PROBABILIDAD_Y_ESTADISTICA',
    'BASE_DE_DATOS_II', 'INGLES_I', 'PROGRAMACION_III', 'BASE_DE_DATOS_I',
    'METODOLOGIA_DE_SISTEMAS_I', 'INGLES_II', 'PROGRAMACION_IV',
    'METODOLOGIA_DE_SISTEMAS_II', 'INTRODUCCION_AL_ANALISIS_DE_DATOS',
    'LEGISLACION', 'GESTION_DE_DESARROLLO_DE_SOFTWARE'
  ];

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (!token) {
      alert('Token no encontrado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }
    this.loadDocuments();
  }

  loadDocuments() {
    this.errorMessage = '';
    this.documentService.getDocuments(this.selectedSubject).subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: () => {
        this.errorMessage = 'Error cargando documentos.';
      }
    });
  }

  onFilterChange() {
    this.loadDocuments();
  }

  goToPreview(docId: number) {
    localStorage.setItem('docIdSeleccionado', docId.toString());
    this.router.navigate(['/document-preview']);
  }
}
