import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  message: string = '';
  isAdminRole = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const roleParam = new URLSearchParams(window.location.search).get('role');
    this.isAdminRole = roleParam === 'ADMIN';

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      city: [''],
      about: [''],
      role: [this.isAdminRole ? 'ADMIN' : 'STUDENT', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.http.post('/api/users/register', this.registerForm.value, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.message = `<div class="alert alert-success">Registro exitoso. Redirigiendo a inicio de sesión...</div>`;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.message = `<div class="alert alert-danger">Error al registrarse: ${error.error}</div>`;
        }
      });
  }
}
