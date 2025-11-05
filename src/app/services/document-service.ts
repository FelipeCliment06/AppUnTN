import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private baseUrl = '/api/documents';
  private baseComments = '/api/commentaries';
  private basePunctuations = '/api/punctuations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // 📄 Obtener todos o por materia
  getDocuments(subject: string = ''): Observable<any[]> {
    const headers = this.getAuthHeaders();
    if (subject) {
      return this.http.post<any[]>(`${this.baseUrl}/filterBySubject`, { subject }, { headers });
    }
    return this.http.get<any[]>(`${this.baseUrl}/getAll`, { headers });
  }

  // 📘 Obtener documento por ID
  getById(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}/getById`, { id }, { headers });
  }

  // ⭐ Agregar puntuación
  addPuntuacion(documentId: number, value: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.basePunctuations}/add`, { documentId, value }, { headers });
  }

  // ❌ Eliminar puntuación
  deletePuntuacion(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.basePunctuations}/delete`, { id }, { headers });
  }

  // 💬 Agregar comentario
  addComentario(documentId: number, content: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseComments}/add`, { documentId, content }, { headers });
  }

  // ❌ Eliminar comentario
  deleteComentario(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.baseComments}/delete`, { id }, { headers });
  }

  // ⬇️ Descargar resumen
  download(id: number): Observable<Blob> {
  const headers = this.getAuthHeaders();
  return this.http.post(
    `${this.baseUrl}/download`,
    { id },
    { headers, responseType: 'blob' as const }
  );
}


  uploadDocument(file: File, title: string, description: string, subject: string): Observable<any> {
  const headers = this.getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('subject', subject);
  formData.append('fileType', file.type);

  return this.http.post(`${this.baseUrl}/add`, formData, { headers });
}


}
