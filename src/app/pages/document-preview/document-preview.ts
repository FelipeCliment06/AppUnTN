import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-preview.html',
  styleUrls: ['./document-preview.css'],
})
export class DocumentPreview implements OnInit {
  document: any;
  username: string | null = null;
  docId: number | null = null;
  puntuacionSeleccionada = 0;
  nuevoComentario = '';

  constructor(private docService: DocumentService, private authService: AuthService) {}

  ngOnInit() {
    this.username = this.authService.getUsernameFromToken();
    this.docId = Number(localStorage.getItem('docIdSeleccionado'));
    if (this.docId) this.cargarPreview();
  }

  cargarPreview() {
    this.docService.getById(this.docId!).subscribe({
      next: (doc) => (this.document = doc),
      error: () => alert('Error al cargar la vista previa'),
    });
  }

  selectStar(n: number) {
    this.puntuacionSeleccionada = n;
  }

  enviarPuntuacion() {
    if (!this.puntuacionSeleccionada) return alert('Seleccioná una puntuación');
    this.docService.addPuntuacion(this.docId!, this.puntuacionSeleccionada).subscribe(() => {
      alert('Puntuación enviada');
      this.cargarPreview();
    });
  }

  eliminarPuntuacion(id: number) {
    if (!confirm('¿Querés eliminar esta puntuación?')) return;
    this.docService.deletePuntuacion(id).subscribe(() => this.cargarPreview());
  }

  enviarComentario() {
    if (!this.nuevoComentario.trim()) return alert('El comentario no puede estar vacío');
    this.docService.addComentario(this.docId!, this.nuevoComentario).subscribe(() => {
      alert('Comentario enviado');
      this.nuevoComentario = '';
      this.cargarPreview();
    });
  }

  eliminarComentario(id: number) {
    if (!confirm('¿Querés eliminar este comentario?')) return;
    this.docService.deleteComentario(id).subscribe(() => this.cargarPreview());
  }

  descargarResumen() {
    this.docService.download(this.docId!).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resumen.pdf';
      a.click();
    });
  }
}
