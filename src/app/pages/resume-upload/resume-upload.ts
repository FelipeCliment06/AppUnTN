import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../../services/document-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-upload.html',
  styleUrls: ['./resume-upload.css']
})
export class UploadComponent implements OnInit {
  titulo = '';
  descripcion = '';
  materia = '';
  archivo!: File;
  mensajeSubida = '';
  subjects = [
    'PROGRAMACION_I', 'ARQUITECTURA_Y_SISTEMAS_OPERATIVOS', 'MATEMATICA',
    'ORGANIZACION_EMPRESARIAL', 'PROGRAMACION_II', 'PROBABILIDAD_Y_ESTADISTICA',
    'BASE_DE_DATOS_II', 'INGLES_I', 'PROGRAMACION_III', 'BASE_DE_DATOS_I',
    'METODOLOGIA_DE_SISTEMAS_I', 'INGLES_II', 'PROGRAMACION_IV',
    'METODOLOGIA_DE_SISTEMAS_II', 'INTRODUCCION_AL_ANALISIS_DE_DATOS',
    'LEGISLACION', 'GESTION_DE_DESARROLLO_DE_SOFTWARE'
  ];

  constructor(
    private authService: AuthService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      alert('Token no encontrado. Redirigiendo al login...');
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: any): void {
    this.archivo = event.target.files[0];
  }

  subirResumen(): void {
    if (!this.titulo || !this.descripcion || !this.materia || !this.archivo) {
      this.mensajeSubida = 'Por favor, completá todos los campos.';
      return;
    }

    this.documentService.uploadDocument(this.archivo, this.titulo, this.descripcion, this.materia)
      .subscribe({
        next: () => {
          this.mensajeSubida = 'Resumen subido con éxito 🎉';
          this.titulo = '';
          this.descripcion = '';
          this.materia = '';
          (document.getElementById('archivo') as HTMLInputElement).value = '';
        },
        error: () => {
          this.mensajeSubida = 'Error al subir el resumen 😔';
        }
      });
  }
}
