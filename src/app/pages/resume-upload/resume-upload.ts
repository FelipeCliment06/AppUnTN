import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resume-upload.html',
  styleUrls: ['./resume-upload.css']
})
export class ResumeUpload implements OnInit {

  selectedFile: File | null = null;
  title = '';
  description = '';
  subject = '';
  successMessage = '';
  errorMessage = '';
  apiUrl = 'http://localhost:8080/api/documents/add';

  allUniversities: any[] = [];
  allCareers: any[] = [];
  allSubjects: any[] = [];

  filteredCareers: any[] = [];
  filteredSubjects: any[] = [];

  selectedUniversityId: number | null = null;
  selectedCareerId: number | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private documentService = inject(DocumentService);

  ngOnInit(): void {
    const token = localStorage.getItem('token') || '';
    if (token) {
      this.documentService.getUniversities(token).subscribe(data => this.allUniversities = data);
      this.documentService.getCareers(token).subscribe(data => this.allCareers = data);
      this.documentService.getSubjects(token).subscribe(data => this.allSubjects = data);
    }
  }

  onUniversityChange(): void {
    this.selectedCareerId = null;
    this.subject = ''; 
    this.filteredSubjects = [];
    this.filteredCareers = this.allCareers.filter(c => c.university?.id == this.selectedUniversityId);
  }

  onCareerChange(): void {
    this.subject = ''; 
    this.filteredSubjects = this.allSubjects.filter(s => s.career?.id == this.selectedCareerId);
  }

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
    // Ahora this.subject trae el nombre de la materia seleccionada dinámicamente
    formData.append('subject', this.subject); 
    formData.append('fileType', this.selectedFile.type);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>(this.apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.successMessage = '✅ Resumen subido correctamente 🎉';
        this.errorMessage = '';
        this.cdr.detectChanges(); 

        const docId = response.id;
        setTimeout(() => {
          this.router.navigate(['/document-preview', docId]);
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = '❌ Ocurrió un error al subir el resumen.';
        this.successMessage = '';
        this.cdr.detectChanges(); 
      }
    });
  }
}