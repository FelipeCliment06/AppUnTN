import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { UserService } from '../../services/user-service'; // Importar UserService
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-document-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './document-preview.html',
  styleUrls: ['./document-preview.css'],
})
export class DocumentPreview implements OnInit {
  // Inyecciones de dependencias
  private readonly documentService = inject(DocumentService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cd = inject(ChangeDetectorRef);

  docId = '';
  token = '';
  username: string | null = null;
  title = '';
  
  // Variables de control de roles
  isAdmin = false;
  isProfessor = false;

  document: any = null;
  puntuaciones: any[] = [];
  comentarios: any[] = [];
  promedioRating: number = 0;

  puntuacionSeleccionada = signal(0);
  nuevoComentario = '';
  estrellas = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.token = this.auth.getToken() || '';
    this.username = this.auth.getUsername();

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    // 1. Verificar permisos apenas carga el componente
    this.verificarPermisos();

    // 2. Cargar el documento desde la URL
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

  // Lógica replicada de tu Profile.ts
  verificarPermisos(): void {
    if (!this.username) return;

    this.userService.getProfile(this.username).subscribe({
      next: (data) => {
        const role = (data.role || '').toUpperCase();
        this.isAdmin = this.userService.isAdminRole(role);
        this.isProfessor = this.userService.isProfessorRole(role);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al verificar roles en vista previa:', err),
    });
  }

  cargarPreview() {
    this.documentService.getDocumentById(this.docId, this.token).subscribe({
      next: (doc) => {
        this.title = doc.title;
        this.document = doc;
        this.puntuaciones = doc.punctuations || [];
        this.comentarios = doc.commentaries || [];
        this.promedioRating = this.puntuaciones.length > 0
          ? this.puntuaciones.reduce((sum: number, p: any) => sum + p.value, 0) / this.puntuaciones.length
          : 0;
        this.cd.detectChanges();
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
    const mensaje = this.isAdmin ? '¿Deseas moderar (eliminar) este comentario como administrador?' : '¿Querés eliminar este comentario?';
    if (!confirm(mensaje)) return;

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

  eliminarResumenCompleto() {
    if (!confirm('¿ESTÁS SEGURO? Esta acción es irreversible: se borrará el archivo y toda la actividad (comentarios/puntos) asociada.')) return;

    // Asegúrate de que el método en DocumentService se llame eliminarDocumento o deleteDocument
    this.documentService.deleteDocument(this.docId, this.token).subscribe({
      next: () => {
        alert('Resumen eliminado correctamente');
        this.router.navigate(['/home']); 
      },
      error: (err) => alert('Error al eliminar: ' + (err.error || err.message))
    });
  }
}