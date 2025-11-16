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
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // 📌 Traer TODOS los documentos (GET)
  getAllDocuments(token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAll`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 Traer documento por ID (POST con body {id})
  getDocumentById(id: string, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getById`, { id }, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 Descargar archivo (POST con body {id})
  download(id: string, token: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/download`, { id }, {
      headers: this.createHeaders(token),
      responseType: 'blob'
    });
  }

  // 📌 GET puntuaciones
  getPuntuaciones(id: string, token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/ratings/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 POST puntuación
  enviarPuntuacion(documentId: string, value: number, token: string) {
    return this.http.post(`${this.apiUrl}/punctuations/add`, 
      { documentId, value },
      { headers: this.createHeaders(token) }
    );
  }

  // 📌 DELETE puntuación
  eliminarPuntuacion(puntuacionId: number, token: string) {
    return this.http.post(`${this.apiUrl}/punctuations/delete`, 
      { id: puntuacionId}, 
      { headers: this.createHeaders(token) }
    );
  }

  // 📌 GET comentarios
  getComentarios(id: string, token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  // 📌 POST comentario
  enviarComentario(documentId: string, content: string, token: string) {
    return this.http.post(`${this.apiUrl}/commentaries/add`, 
      { documentId, content }, 
      { headers: this.createHeaders(token) }
    );
  }

  // 📌 DELETE comentario
  eliminarComentario(comentarioId: number, token: string) {
    return this.http.post(`${this.apiUrl}/commentaries/delete`, 
      { id: comentarioId }, 
      { headers: this.createHeaders(token) }
    );
  }
}
