import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.html',
  styleUrls: ['./document-preview.css']
})
export class DocumentPreview implements OnInit {
  document: any = null;
  isLoading = true;
  username !:string|null;
  puntuacionSeleccionada = 0;

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = this.authService.getToken();

    if (!id || !token) {
      console.error('Falta id o token');
      return;
    }

    this.username = this.authService.getUsername();

    this.documentService.getDocumentById(id, token).subscribe({
      next: (doc) => {
        this.document = doc;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener documento:', err);
        this.isLoading = false;
      }
    });
  }

  selectStar(n: number): void {
    this.puntuacionSeleccionada = n;
  }

  enviarPuntuacion(): void {
    const token = this.authService.getToken();
    if (!token || !this.document?.id) return;
    if (!this.puntuacionSeleccionada) {
      alert('Seleccioná una puntuación');
      return;
    }

    this.documentService.addPunctuation(this.document.id, this.puntuacionSeleccionada, token).subscribe({
      next: () => {
        alert('Puntuación enviada');
        this.ngOnInit(); // recarga
      },
      error: (err) => console.error('Error al enviar puntuación:', err)
    });
  }

  eliminarPuntuacion(id: number): void {
    const token = this.authService.getToken();
    if (!token) return;
    if (!confirm('¿Querés eliminar esta puntuación?')) return;

    this.documentService.deletePunctuation(id, token).subscribe({
      next: () => {
        alert('Puntuación eliminada');
        this.ngOnInit();
      },
      error: (err) => console.error('Error al eliminar puntuación:', err)
    });
  }

  enviarComentario(content: string): void {
    const token = this.authService.getToken();
    if (!token || !this.document?.id) return;
    if (!content.trim()) {
      alert('El comentario no puede estar vacío.');
      return;
    }

    this.documentService.addComment(this.document.id, content, token).subscribe({
      next: () => {
        alert('Comentario enviado');
        this.ngOnInit();
      },
      error: (err) => console.error('Error al enviar comentario:', err)
    });
  }

  eliminarComentario(id: number): void {
    const token = this.authService.getToken();
    if (!token) return;
    if (!confirm('¿Querés eliminar este comentario?')) return;

    this.documentService.deleteComment(id, token).subscribe({
      next: () => {
        alert('Comentario eliminado');
        this.ngOnInit();
      },
      error: (err) => console.error('Error al eliminar comentario:', err)
    });
  }

  descargarResumen(): void {
    const token = this.authService.getToken();
    if (!token || !this.document?.id) return;

    this.documentService.downloadDocument(this.document.id, token).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.document.title}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error al descargar documento:', err)
    });
  }
}
