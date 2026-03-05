import { Component, ChangeDetectorRef, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { UserService } from '../../services/user-service';
import { Auth } from '../../services/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  username = '';
  password = '';
  error = false;

  private cdr = inject(ChangeDetectorRef);
  private routerSub!: Subscription;

  constructor(private userService: UserService, private auth: Auth, private router: Router) {}

  ngOnInit(): void {
    this.resetForm();

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.resetForm();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private resetForm(): void {
    this.username = '';
    this.password = '';
    this.error = false;
  }

  onLogin() {
    const credentials = { username: this.username, password: this.password };

    this.userService.login(credentials).subscribe({
      next: (data: any) => {
        this.auth.login(data.token);

        if (data.role) {
          localStorage.setItem('role', data.role);
        }

        if (data.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }
}
