import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/profile`, { username }, { headers: this.getHeaders() });
  }

  updateUser(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateUser`, userData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  getSubjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/subjects/get`, { headers: this.getHeaders() });
  }

  addSubject(subject: string): Observable<string> {
    return this.http.put(`${this.baseUrl}/subjects/update`, { subjects: [subject] }, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  deleteSubject(subject: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/subjects/delete`, {
      headers: this.getHeaders(),
      body: { subject },
      responseType: 'text'
    });
  }

  // ✅ NUEVOS MÉTODOS PARA ADMINISTRAR USUARIOS

  /** Obtiene todos los usuarios (solo visible para ADMIN) */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAllUsers`, { headers: this.getHeaders() });
  }

  /** Elimina un usuario por username */
  deleteUser(username: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteUser`, {
      headers: this.getHeaders(),
      body: { username },
      responseType: 'text'
    });
  }

  
}
