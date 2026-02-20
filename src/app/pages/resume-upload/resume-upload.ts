import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-upload.html',
  styleUrls: ['./resume-upload.css']
})
export class ResumeUpload {

  selectedFile: File | null = null;
  title = '';
  description = '';
  subject = '';
  successMessage = '';
  errorMessage = '';
  apiUrl = `${environment.apiUrl}/documents/add`;

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // 👈 Angular 20+ inyección moderna

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadResume(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor seleccioná un archivo antes de subir.';
      this.cdr.detectChanges();
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No estás autenticado. Iniciá sesión primero.';
      this.cdr.detectChanges();
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('subject', this.subject);
    formData.append('fileType', this.selectedFile.type);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>(this.apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.successMessage = '✅ Resumen subido correctamente 🎉';
        this.errorMessage = '';
        this.cdr.detectChanges(); // 👈 fuerza refresco inmediato

        const docId = response.id;
        setTimeout(() => {
          this.router.navigate(['/document-preview', docId]);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error || 'Ocurrió un error al subir el resumen.';
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    });
  }
}
