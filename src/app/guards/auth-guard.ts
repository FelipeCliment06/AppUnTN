import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  // ✅ Validamos directamente el token del localStorage
  const token = auth.getToken();

  if (token && token.trim() !== '') {
    return true; // el usuario está autenticado
  }

  // ❌ No hay token → redirigir al login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

