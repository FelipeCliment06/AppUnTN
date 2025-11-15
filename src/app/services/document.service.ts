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
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 📌 Traer TODOS los documentos
  getAllDocuments(token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAll`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 Traer documento por ID
  getDocumentById(id: string, token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 Descargar archivo
  download(id: number, token: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      headers: this.createHeaders(token),
      responseType: 'blob'
    });
  }

  // 📌 GET puntuaciones
  getPuntuaciones(id: string, token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ratings/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 POST puntuación
  enviarPuntuacion(id: string, value: number, token: string) {
    return this.http.post(`${this.apiUrl}/ratings/${id}`, { value }, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 DELETE puntuación
  eliminarPuntuacion(puntuacionId: number, token: string) {
    return this.http.delete(`${this.apiUrl}/ratings/delete/${puntuacionId}`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 GET comentarios
  getComentarios(id: string, token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 POST comentario
  enviarComentario(id: string, content: string, token: string) {
    return this.http.post(`${this.apiUrl}/comments/${id}`, { content }, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 DELETE comentario
  eliminarComentario(comentarioId: number, token: string) {
    return this.http.delete(`${this.apiUrl}/comments/delete/${comentarioId}`, {
      headers: this.createHeaders(token)
    });
  }
}

