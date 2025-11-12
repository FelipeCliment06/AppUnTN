import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) {}

  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // === 🔹 Subir documento ===
  uploadDocument(formData: FormData, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(`${this.apiUrl}/add`, formData, { headers });
  }

  // === 🔹 Obtener todos los documentos ===
  getAllDocuments(token: string): Observable<any[]> {
    const headers = this.createHeaders(token);
    return this.http.get<any[]>(`${this.apiUrl}/getAll`, { headers });
  }

  // === 🔹 Obtener documento por ID ===
  getDocumentById(id: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.get<any>(`${this.apiUrl}/get/${id}`, { headers });
  }

  // === 🔹 Descargar documento ===
  downloadDocument(id: string, token: string): Observable<Blob> {
    const headers = this.createHeaders(token);
    return this.http.post(`${this.apiUrl}/download`, { id }, { headers, responseType: 'blob' });
  }

  // === 🔹 Comentarios ===
  addComment(documentId: string, content: string, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(`http://localhost:8080/api/commentaries/add`, { documentId, content }, { headers });
  }

  deleteComment(id: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(`http://localhost:8080/api/commentaries/delete`, { id }, { headers });
  }

  // === 🔹 Puntuaciones ===
  addPunctuation(documentId: string, value: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(`http://localhost:8080/api/punctuations/add`, { documentId, value }, { headers });
  }

  deletePunctuation(id: number, token: string): Observable<any> {
    const headers = this.createHeaders(token);
    return this.http.post(`http://localhost:8080/api/punctuations/delete`, { id }, { headers });
  }
}
