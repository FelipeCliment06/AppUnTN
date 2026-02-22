import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';
import { environment } from '../../environments/environment';

export interface UserProfile {
  name: string;
  lastname: string;
  mail: string;
  city: string;
  about: string;
  role: string;
  password?: string;
}
export interface DocumentResponse {
  id: number;
  title: string;
  description: string;
  subject: string;
  fileType: string;
  uploadDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private auth: Auth) {}

  private get authHeaders() {
  const token = this.auth.getToken();

  return new HttpHeaders({
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  });
}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  emailExists(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.baseUrl}/exists/email`, { params });
  }

  usernameExists(username: string): Observable<boolean> {
    const params = new HttpParams().set('username', username);
    return this.http.get<boolean>(`${this.baseUrl}/exists/username`, { params });
  }

  login(credentials: { username: string; password: string }) {
  return this.http.post(`${environment.apiUrl}/auth/login`, credentials);
}

  // ========= PERFIL =========
getProfile(username: string): Observable<UserProfile> {
  return this.http.post<UserProfile>(
    `${this.baseUrl}/profile`,
    { username },
    { headers: this.authHeaders }
  );
}

updateProfile(profile: UserProfile): Observable<string> {
  return this.http.put(
    `${this.baseUrl}/updateUser`,
    profile,
    {
      headers: this.authHeaders,
      responseType: 'text' as 'text'
    }
  ) as unknown as Observable<string>;
}


// ========= MATERIAS PROFESOR =========
getSubjects(): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/subjects/get`,
    { headers: this.authHeaders }
  );
}

addSubjectById(subjectId: number): Observable<string> {
  return this.http.put(
    `${this.baseUrl}/subjects/update`, 
    { subjectId: subjectId }, 
    {
      headers: this.authHeaders,
      responseType: 'text' as 'text'
    }
  ) as unknown as Observable<string>;
}


deleteSubject(subject: string): Observable<string> {
  return this.http.delete(
    `${this.baseUrl}/subjects/delete`,
    {
      headers: this.authHeaders,
      body: { subject },
      responseType: 'text' as 'text'
    }
  ) as unknown as Observable<string>;
}


// ========= ROLES =========
isAdminRole(role: string): boolean {
  const r = (role || '').toUpperCase();
  return r === 'ADMIN' || r === 'ROLE_ADMIN';
}

isProfessorRole(role: string): boolean {
  const r = (role || '').toUpperCase();
  return r === 'PROFESSOR' || r === 'ROLE_PROFESSOR';
}


// =========== Documents =============
private documentsUrl = `${environment.apiUrl}/documents`;

getMyDocuments() {
  return this.http.get<DocumentResponse[]>(`${this.documentsUrl}/myDocuments`, {
    headers: this.authHeaders
  });
}

deleteDocument(id: number) {
  return this.http.delete(`${this.documentsUrl}/delete`, {
    headers: this.authHeaders,
    body: { id },
    responseType: 'text' as 'text'  
  });
}

getUniversities(): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiUrl}/admin/universities/getAll`,
    { headers: this.authHeaders }
  );
}

getCareersByUniversity(univId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiUrl}/admin/careers/by-university/${univId}`, 
    { headers: this.authHeaders }
  );
}

getSubjectsByCareer(careerId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${environment.apiUrl}/admin/subjects/by-career/${careerId}`, 
    { headers: this.authHeaders }
  );
}



}
