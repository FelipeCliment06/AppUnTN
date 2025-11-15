import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface UserProfile {
  name: string;
  lastname: string;
  mail: string;
  city: string;
  about: string;
  role: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';

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
  return this.http.post('http://localhost:8080/api/auth/login', credentials);
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

addSubject(subject: string): Observable<string> {
  return this.http.put(
    `${this.baseUrl}/subjects/update`,
    { subjects: [subject] },
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
}
