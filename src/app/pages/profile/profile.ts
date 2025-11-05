import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  user: any = null;
  subjects: string[] = [];
  updateMessage = '';
  selectedSubject = '';

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const username = this.auth.getUsernameFromToken();
    if (!username) {
      this.auth.logout();
      return;
    }

    this.loadProfile(username);
  }

  loadProfile(username: string): void {
    this.userService.getProfile(username).subscribe({
      next: data => {
        this.user = data;
        if (this.isProfessor()) this.loadSubjects();
      },
      error: () => this.auth.logout()
    });
  }

  loadSubjects(): void {
    this.userService.getSubjects().subscribe({
      next: subs => this.subjects = subs,
    });
  }

  updateUser(): void {
    this.userService.updateUser(this.user).subscribe({
      next: msg => this.updateMessage = msg,
      error: () => this.updateMessage = 'Error actualizando el perfil.'
    });
  }

  addSubject(): void {
    if (!this.selectedSubject) return;
    this.userService.addSubject(this.selectedSubject).subscribe({
      next: msg => {
        alert(msg);
        this.loadSubjects();
      }
    });
  }

  deleteSubject(sub: string): void {
    if (!confirm('¿Seguro que querés eliminar esta materia?')) return;
    this.userService.deleteSubject(sub).subscribe({
      next: msg => {
        alert(msg);
        this.loadSubjects();
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }

  isAdmin(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'ROLE_ADMIN';
  }

  isProfessor(): boolean {
    return this.user?.role === 'PROFESSOR' || this.user?.role === 'ROLE_PROFESSOR';
  }
}
