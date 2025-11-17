import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-preview.html',
  styleUrls: ['./document-preview.css'],
})
export class DocumentPreview implements OnInit {
  docId = '';
  token = '';
  username: string | null = null;
  title = '';

  document: any = null;
  puntuaciones: any[] = [];
  comentarios: any[] = [];

  puntuacionSeleccionada = signal(0);
  nuevoComentario = '';
  estrellas = [1, 2, 3, 4, 5];

  constructor(
    private documentService: DocumentService,
    private auth: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef // <-- agregado
  ) {}

  ngOnInit(): void {
    // 📌 Tomamos token y username desde Auth service
    this.token = this.auth.getToken() || '';
    this.username = this.auth.getUsername();

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    // 📌 Tomamos el ID desde la URL usando paramMap.subscribe para detectar cambios
    this.route.paramMap.subscribe(params => {
      this.docId = params.get('id') || '';

      if (!this.docId) {
        alert('ID de documento no encontrado');
        this.router.navigate(['/documents']);
        return;
      }

      this.cargarPreview();
    });
  }

  cargarPreview() {
    this.documentService.getDocumentById(this.docId, this.token).subscribe({
      next: (doc) => {
        this.title = doc.title;
        this.document = doc;
        this.puntuaciones = doc.punctuations || [];
        this.comentarios = doc.commentaries || [];

        this.cd.detectChanges(); // <-- asegura que Angular actualice la vista
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar la vista previa');
      },
    });
  }

  selectStar(n: number) {
    this.puntuacionSeleccionada.set(n);
  }

  enviarPuntuacion() {
    if (!this.puntuacionSeleccionada()) return alert('Seleccioná una puntuación');

    this.documentService.enviarPuntuacion(this.docId, this.puntuacionSeleccionada(), this.token)
      .subscribe({
        next: () => this.cargarPreview(),
        error: (err) => {
  if (err.status === 200) return this.cargarPreview();
  alert('Error al enviar puntuación');
},

      });
  }

  eliminarPuntuacion(id: number) {
    if (!confirm('¿Querés eliminar esta puntuación?')) return;

    this.documentService.eliminarPuntuacion(id, this.token).subscribe({
      next: () => this.cargarPreview(),
      error: (err) => {
  if (err.status === 200) return this.cargarPreview();
  alert('Error al eliminar puntuación');
},

    });
  }

  enviarComentario() {
    const content = this.nuevoComentario.trim();
    if (!content) return alert('El comentario no puede estar vacío.');

    this.documentService.enviarComentario(this.docId, content, this.token).subscribe({
      next: () => {
        this.nuevoComentario = '';
        this.cargarPreview();
      },
      error: (err) => alert('Error al enviar comentario: ' + err),
    });
  }

  eliminarComentario(id: number) {
    if (!confirm('¿Querés eliminar este comentario?')) return;

    this.documentService.eliminarComentario(id, this.token).subscribe({
      next: () => this.cargarPreview(),
      error: (err) => {
  if (err.status === 200) return this.cargarPreview();
  alert('Error al eliminar comentario');
},

    });
  }

  descargarResumen() {
    this.documentService.download(this.docId, this.token).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.title;
        a.click();
      },
      error: (err) => alert('Error al descargar resumen: ' + err),
    });
  }
}
