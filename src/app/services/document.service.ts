import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiDocuments = `${environment.apiUrl}/documents`;
  private apiPunctuations = `${environment.apiUrl}/punctuations`;
  private apiCommentaries = `${environment.apiUrl}/commentaries`;

  constructor(private http: HttpClient) {}

  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // DOCUMENTS
  getAllDocuments(token: string, orden: string = 'recientes') {
    return this.http.get<any[]>(`${this.apiDocuments}/getAll?orden=${orden}`, {
      headers: this.createHeaders(token)
    });
  }

  getDocumentById(id: string, token: string) {
    return this.http.post<any>(`${this.apiDocuments}/getById`, { id }, {
      headers: this.createHeaders(token)
    });
  }

  download(id: string, token: string) {
    return this.http.post(`${this.apiDocuments}/download`, { id }, {
      headers: this.createHeaders(token),
      responseType: 'blob'
    });
  }
  deleteDocument(id: string, token: string) {
  return this.http.delete(`${this.apiDocuments}/delete`, {
    headers: this.createHeaders(token),
    body: { id: id }
  });
}

  // PUNCTUATIONS
  getPuntuaciones(id: string, token: string) {
    return this.http.get<any[]>(`${this.apiPunctuations}/document/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  enviarPuntuacion(documentId: string, value: number, token: string) {
    return this.http.post(`${this.apiPunctuations}/add`, 
      { documentId, value },
      { headers: this.createHeaders(token) }
    );
  }

  eliminarPuntuacion(puntuacionId: number, token: string) {
    return this.http.post(`${this.apiPunctuations}/delete`, 
      { id: puntuacionId }, 
      { headers: this.createHeaders(token) }
    );
  }

  // COMMENTARIES
  getComentarios(id: string, token: string) {
    return this.http.get<any[]>(`${this.apiCommentaries}/document/${id}`, {
      headers: this.createHeaders(token)
    });
  }

  enviarComentario(documentId: string, content: string, token: string) {
    return this.http.post(`${this.apiCommentaries}/add`, 
      { documentId, content }, 
      { headers: this.createHeaders(token) }
    );
  }

  eliminarComentario(comentarioId: number, token: string) {
    return this.http.post(`${this.apiCommentaries}/delete`, 
      { id: comentarioId }, 
      { headers: this.createHeaders(token) }
    );
  }
}
