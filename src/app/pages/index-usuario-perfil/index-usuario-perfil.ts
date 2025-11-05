import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-user',
  templateUrl: './index-usuario-perfil.html',
  styleUrls: ['./index-usuario-perfil.css']
})
export class HomeUserComponent implements OnInit {

  username: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');

    if (!token) {
      alert('Token no encontrado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.getUsernameFromToken(token);
  }

  private getUsernameFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Error decodificando JWT', e);
      return null;
    }
  }
}
