import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { map, catchError, debounceTime, switchMap, of } from 'rxjs';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  message = '';
  error = false;
  currentRole: string | null = null;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.currentRole = localStorage.getItem('role');

    const roleControlConfig =
      this.currentRole === 'ADMIN'
        ? { value: 'ADMIN', disabled: true }
        : 'STUDENT';

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      mail: ['', [Validators.required, Validators.email], [this.mailExistsValidator()]],
      username: ['', [Validators.required, Validators.minLength(4)], [this.usernameExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      city: [''],
      about: [''],
      role: [roleControlConfig, Validators.required]
    });
  }

  mailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(400),
        switchMap(value => this.userService.emailExists(value)),
        map(exists => (exists ? { emailTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  usernameExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(400),
        switchMap(value => this.userService.usernameExists(value)),
        map(exists => (exists ? { usernameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  get f() {
    return this.registerForm.controls;
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.getRawValue(); // incluye 'role' aunque esté deshabilitado

    this.userService.register(payload).subscribe({
      next: () => {
        this.message = 'Registro exitoso.';
        this.error = false;

        // 🔹 Si el actual usuario es ADMIN, vuelve al panel de admins
        if (this.currentRole === 'ADMIN') {
          setTimeout(() => this.router.navigate(['/admin-admins']), 1500);
        } else {
          // 🔹 Si es registro normal, va al login
          setTimeout(() => this.router.navigate(['/login']), 1500);
        }
      },
      error: (err) => {
        this.message = err.status === 409 ? 'El usuario o email ya existen.' : 'Error al registrarse.';
        this.error = true;
      }
    });
  }
}
