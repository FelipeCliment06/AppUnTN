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

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      mail: ['', [Validators.required, Validators.email], [this.mailExistsValidator()]],
      username: ['', [Validators.required, Validators.minLength(4)], [this.usernameExistsValidator()]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      city: [''],
      about: [''],
      role: ['STUDENT', Validators.required]
    });
  }

  // === VALIDADORES ===
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

    this.userService.register(this.registerForm.value).subscribe({
      next: () => {
        this.message = 'Registro exitoso. Redirigiendo...';
        this.error = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.message = err.status === 409 ? 'El usuario o email ya existen.' : 'Error al registrarse.';
        this.error = true;
      }
    });
  }
}
