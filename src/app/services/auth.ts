import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private TOKEN_KEY = 'token';
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoggedInSignal = signal<boolean>(this.hasToken());

  constructor() {
    // Al iniciar la app, validar el token contra el backend
    this.validateToken();

    //Escuchador para que si se cierra sesion en una pestaña te cierre sesion en todas las que estan abiertas.
    window.addEventListener('storage', (event) => {
      if (event.key === this.TOKEN_KEY) {
        if (!event.newValue) {
          console.warn('Sesión cerrada en otra pestaña. Redirigiendo al login...');
          this.isLoggedInSignal.set(false);
          this.router.navigate(['/login']);
        } else {
          this.isLoggedInSignal.set(true);
          this.validateToken();
        }
      }
    });
  }

  private validateToken(): void {
    const token = this.getToken();
    if (!token) return;

    this.http.get(`${environment.apiUrl}/users/me`).subscribe({
      next: () => {
        this.isLoggedInSignal.set(true);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          console.warn('Validación fallida: Token rechazado por el servidor.');
          this.logout();
        } else {
          console.warn('Error de red validando token, pero mantenemos la sesión abierta.');
        }
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
