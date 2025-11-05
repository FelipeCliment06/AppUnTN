import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { HomeUserComponent } from './pages/index-usuario-perfil/index-usuario-perfil';
import { UploadComponent } from './pages/resume-upload/resume-upload';
import { Documents } from './pages/documents/documents';
import { ProfileComponent } from './pages/profile/profile';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AdminAdminsComponent } from './pages/admin-admins/admin-admins';
import { AdminUsersComponent } from './pages/admin-usuarios/admin-usuarios';
import { DocumentPreview } from './pages/document-preview/document-preview';

export const routes: Routes = [
    {path:'', component:Home},
    { path: 'home-user', component: HomeUserComponent },
    { path: 'resume-upload', component: UploadComponent },
    { path: 'documents', component: Documents },
    { path: 'profile', component: ProfileComponent },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    {path:'admin-admins', component:AdminAdminsComponent},
    {path:'admin-usuarios', component:AdminUsersComponent},
    {path:'**', component:Home}
    

];
