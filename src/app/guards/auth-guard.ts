import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  // ✅ Validamos token + expiración
  if (auth.isLoggedIn()) {
    return true;
  }

  // ❌ No hay token o está expirado → limpiar y redirigir al login
  auth.logout();
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

