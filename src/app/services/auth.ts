import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private TOKEN_KEY = 'token';
  isLoggedInSignal = signal<boolean>(this.hasToken());

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
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
}
