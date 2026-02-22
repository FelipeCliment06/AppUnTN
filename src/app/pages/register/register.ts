import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  AsyncValidatorFn
} from '@angular/forms';
import { Router } from '@angular/router';
import { map, catchError, debounceTime, switchMap, of } from 'rxjs';
import { UserService } from '../../services/user-service';
import { Auth } from '../../services/auth';

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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private auth: Auth
  ) {

    this.currentRole = this.getRoleFromToken();
    const isAdmin = this.currentRole === 'ADMIN' || this.currentRole === 'ROLE_ADMIN';
    const defaultRole = isAdmin ? 'ADMIN' : 'STUDENT';

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      mail: ['', [Validators.required, Validators.email], [this.mailExistsValidator()]],
      username: ['', [Validators.required, Validators.minLength(4)], [this.usernameExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      city: [''],
      about: [''],
      role: [defaultRole, Validators.required]
    });
  }

  private getRoleFromToken(): string | null {
    const token = this.auth.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.role) return String(payload.role);
      if (Array.isArray(payload?.roles) && payload.roles.length > 0) {
        return String(payload.roles[0]);
      }
      return null;
    } catch (e) {
      console.error('Error decodificando JWT en Register', e);
      return null;
    }
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

    const payload = this.registerForm.getRawValue();

    this.userService.register(payload).subscribe({
      next: () => {
        this.message = 'Registro exitoso.';
        this.error = false;

        const esAdminActual =
          this.currentRole === 'ADMIN' || this.currentRole === 'ROLE_ADMIN';

        if (esAdminActual) {
          setTimeout(() => this.router.navigate(['/admin-admins']), 1500);
        } else {
          setTimeout(() => this.router.navigate(['/login']), 1500);
        }
      },
      error: (err) => {
        this.message =
          err.status === 409
            ? 'El usuario o email ya existen.'
            : 'Error al registrarse.';
        this.error = true;
      }
    });
  }
}