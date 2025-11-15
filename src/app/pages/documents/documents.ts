import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Documento {
  id: number;
  title: string;
  description: string;
  subject: string;
  authorUsername: string;
}

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class Documents implements OnInit {

  constructor(private router: Router) {}

  token: string | null = null;

  // filtros
  materia: string = '';
  nombre: string = '';
  autor: string = '';

  // data
  allDocs: Documento[] = [];
  filtrados: Documento[] = [];

  ngOnInit(): void {
    this.token = localStorage.getItem('token');

    if (!this.token) {
      alert("Token no encontrado. Redirigiendo al login...");
      window.location.href = "/login.html";
      return;
    }

    this.cargarDocumentos();
  }

  async cargarDocumentos() {
  // si todavía no cargó la data → cargar SIEMPRE
  if (this.allDocs.length === 0) {
    try {
      const res = await fetch("http://localhost:8080/api/documents/getAll", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + this.token,
          "Content-Type": "application/json"
        }
      });

      this.allDocs = await res.json();
    } catch (err) {
      console.error("Error fetching docs:", err);
      this.filtrados = [];
      return;
    }
  }

  // si NO hay filtros → mostrar TODO
  if (!this.materia && !this.nombre && !this.autor) {
    this.filtrados = [...this.allDocs];
    return;
  }

  // aplicar filtros
  const nombreLower = this.nombre.toLowerCase();
  const autorLower = this.autor.toLowerCase();

  this.filtrados = this.allDocs.filter(doc => {
    const coincideMateria = !this.materia || doc.subject === this.materia;
    const coincideNombre =
      !this.nombre || doc.title.toLowerCase().includes(nombreLower);
    const coincideAutor =
      !this.autor || doc.authorUsername?.toLowerCase().includes(autorLower);

    return coincideMateria && coincideNombre && coincideAutor;
  });
}


  seleccionarDocumento(id: number) {
  this.router.navigate(['/document-preview', id]);
}

}
