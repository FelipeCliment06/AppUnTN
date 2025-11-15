import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule], // habilita *ngIf y *ngFor
  templateUrl: './document-preview.html',
  styleUrls: ['./document-preview.css']
})
export class DocumentPreview implements OnInit {
  idDocumento!: number;
  documento: any = null;
  cargando: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    // Suscribimos a cambios en los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.idDocumento = Number(idParam);
        this.cargarDocumento();
      }
    });
  }

  cargarDocumento() {
    // Resetear estado antes de cada request
    this.cargando = true;
    this.error = null;
    this.documento = null;

    const token = localStorage.getItem('token') || '';

    this.documentService.getDocumentById(this.idDocumento, token).subscribe({
      next: (data) => {
        console.log("Documento recibido:", data);

        // Simulamos un delay de 500ms
        setTimeout(() => {
          if (data && Object.keys(data).length > 0) {
            // Asignamos documento recibido
            this.documento = data;

            // Robust: si backend devuelve author como objeto, usamos authorUsername
            this.documento.authorUsername =
              data.author?.username || data.authorUsername || "Desconocido";
          } else {
            this.error = "Documento no encontrado.";
          }
          this.cargando = false;
        }, 500);
      },
      error: (err) => {
        console.error("Error HTTP:", err);
        this.error = "No se pudo cargar el documento.";
        this.cargando = false;
      }
    });
  }
}
