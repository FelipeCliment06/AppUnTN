import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './documents.html',
  styleUrls: ['./documents.css']
})
export class Documents implements OnInit {

  token: string = '';
  allDocs: any[] = [];
  filtrados: any[] = [];

  materia: string = '';
  nombre: string = '';
  autor: string = '';
  materias: string[] = [
  "PROGRAMACION_I",
  "ARQUITECTURA_Y_SISTEMAS_OPERATIVOS",
  "MATEMATICA",
  "ORGANIZACION_EMPRESARIAL",
  "PROGRAMACION_II",
  "PROBABILIDAD_Y_ESTADISTICA",
  "BASE_DE_DATOS_II",
  "INGLES_I",
  "PROGRAMACION_III",
  "BASE_DE_DATOS_I",
  "METODOLOGIA_DE_SISTEMAS_I",
  "INGLES_II",
  "PROGRAMACION_IV",
  "METODOLOGIA_DE_SISTEMAS_II",
  "INTRODUCCION_AL_ANALISIS_DE_DATOS",
  "LEGISLACION",
  "GESTION_DE_DESARROLLO_DE_SOFTWARE"
];


  constructor(
    private documentService: DocumentService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token') ?? '';

    // 🔥 cargar documentos al iniciar
    this.documentService.getAllDocuments(this.token).subscribe({
      next: (data) => this.allDocs = data,
      error: () => alert('Error al cargar documentos')
    });
  }

  filtrar(): void {
    if (!this.materia && !this.nombre && !this.autor) {
      this.filtrados = [];
      return;
    }

    this.filtrados = this.allDocs.filter(doc => {
      const coincideMateria = !this.materia || doc.subject === this.materia;
      const coincideNombre = !this.nombre || doc.title.toLowerCase().includes(this.nombre.toLowerCase());
      const coincideAutor = !this.autor || (doc.authorUsername?.toLowerCase().includes(this.autor.toLowerCase()));

      return coincideMateria && coincideNombre && coincideAutor;
    });
  }

  seleccionarDocumento(id: number) {
    this.router.navigate(['/document-preview', id]);
  }
}

