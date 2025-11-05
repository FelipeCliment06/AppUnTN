import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth'; // <-- Importá tu servicio Auth

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.isLoggedIn()) {
    // ✅ Usuario autenticado → permitir acceso
    return true;
  } else {
    // ❌ No autenticado → redirigir al login y guardar URL para volver luego
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
