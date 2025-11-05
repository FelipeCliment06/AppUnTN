import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'jwt';
  private apiUrl = '/api/auth';

  constructor(private router: Router, private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  /** ✅ Nuevo método para obtener el rol del token */
  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // ⚠️ Ajustá si tu backend lo llama distinto (por ejemplo "roles" o "authorities")
      return payload.role || null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(username: string, password: string): Promise<string> {
    return firstValueFrom(
      this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password })
    ).then(res => res.token);
  }
}
