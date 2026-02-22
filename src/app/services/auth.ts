import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private TOKEN_KEY = 'token';
  private http = inject(HttpClient);
  isLoggedInSignal = signal<boolean>(this.hasToken());

  constructor() {
    // Al iniciar la app, validar el token contra el backend
    this.validateToken();
  }

  private validateToken(): void {
    const token = this.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get(`${environment.apiUrl}/users/me`, { headers }).subscribe({
      next: () => {
        // Token válido, todo bien
        this.isLoggedInSignal.set(true);
      },
      error: () => {
        // Backend no responde o token inválido → logout
        this.logout();
      },
    });
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }
    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      // exp está en segundos, Date.now() en milisegundos
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // si no se puede decodificar, lo tratamos como expirado
    }
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSignal();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isLoggedInSignal.set(true);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedInSignal.set(false);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Error decodificando JWT', e);
      return null;
    }
  }
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.roles;
      if (roles && roles.length > 0) {
        return roles[0];
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
