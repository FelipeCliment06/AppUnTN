import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user-service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {
  username: string = '';
  profile: any = null;
  documents: any[] = [];
  subjects: any[] = [];
  errorMessage: string = '';
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private auth: Auth,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.username = params.get('username') || '';
      this.loading = true;
      this.profile = null;
      this.loadProfile();
    });
  }

  loadProfile() {
    this.userService.getProfile(this.username).subscribe({
      next: (data: any) => {
        this.profile = data;
        this.documents = data.documents || [];
        this.subjects = data.subjects || [];
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el perfil del usuario.';
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  formatSubject(subject: string): string {
    return subject.replace(/_/g, ' ');
  }

  getRoleLabel(role: string): string {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'ROLE_ADMIN') return 'Administrador';
    if (r === 'PROFESSOR' || r === 'ROLE_PROFESSOR') return 'Profesor';
    return 'Estudiante';
  }
}
