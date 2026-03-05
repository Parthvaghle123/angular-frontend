import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  username = "";
  password = "";
  error = "";
  loading = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAdmin) {
      this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
    }
  }

  handleSubmit() {
    this.loading = true;
    this.error = "";
    this.apiService.post<any>('api/admin/login', {
      username: this.username,
      password: this.password,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.authService.setAdminToken(res.token);
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.error = res.message || "Login failed";
        }
      },
      error: () => {
        this.error = "Server error";
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
