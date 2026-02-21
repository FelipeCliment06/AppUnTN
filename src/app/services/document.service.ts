import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private apiDocuments = 'http://localhost:8080/api/documents';
  private apiPunctuations = 'http://localhost:8080/api/punctuations';
  private apiCommentaries = 'http://localhost:8080/api/commentaries';
  private apiUniversities = 'http://localhost:8080/api/admin/universities';
  private apiCareers = 'http://localhost:8080/api/admin/careers';
  private apiSubjects = 'http://localhost:8080/api/admin/subjects';

  constructor(private http: HttpClient) {}

  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // DOCUMENTS
  getAllDocuments(token: string) {
    return this.http.get<any[]>(`${this.apiDocuments}/getAll`, {
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

  getUniversities(token: string) {
    return this.http.get<any[]>(`${this.apiUniversities}/getAll`, {
      headers: this.createHeaders(token)
    });
  }

  getCareers(token: string) {
    return this.http.get<any[]>(`${this.apiCareers}/getAll`, {
      headers: this.createHeaders(token)
    });
  }

  getSubjects(token: string) {
    return this.http.get<any[]>(`${this.apiSubjects}/getAll`, {
      headers: this.createHeaders(token)
    });
  }

  filterDocumentsBySubject(subjectName: string, token: string) {
    return this.http.post<any[]>(`${this.apiDocuments}/filterBySubject`, 
      { subject: subjectName }, 
      { headers: this.createHeaders(token) }
    );
  }
}
