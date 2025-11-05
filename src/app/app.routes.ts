import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { ResumeUpload } from './pages/resume-upload/resume-upload';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { DocumentPreview } from './pages/document-preview/document-preview';
import { authGuard } from './guards/auth-guard';
import { Profile } from './pages/profile/profile';
import { Documents } from './pages/documents/documents';
import { AboutUs } from './pages/about-us/about-us';

export const routes: Routes = [
  // Página principal pública
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'aboutUs', component: AboutUs },

  // Rutas protegidas (requieren estar logeado)
  { path: 'resumeUpload', component: ResumeUpload, canActivate: [authGuard] },
  { path: 'documents', component: Documents, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  // Rutas públicas
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Ruta comodín (404)
  { path: '**', redirectTo: 'home' }
];
