import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { RedirectLoaderComponent } from '../components/redirect-loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RedirectLoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  emailInput: string = '';
  password: string = '';
  strengthMessage: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {}

  handlePasswordChange() {
    const value = this.password;
    if (value.length < 4) {
      this.strengthMessage = "Weak password ❌";
    } else if (/[A-Z]/.test(value) && /\d/.test(value) && value.length >= 8) {
      this.strengthMessage = "Strong password ✅";
    } else {
      this.strengthMessage = "Moderate password ⚠️";
    }
  }

  handleSubmit() {
    // Validate input before submitting
    if (!this.emailInput || !this.emailInput.trim()) {
      this.errorMessage = "Email is required";
      return;
    }

    if (!this.password || !this.password.trim()) {
      this.errorMessage = "Password is required";
      return;
    }

    // Basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.emailInput)) {
      this.errorMessage = "Please enter a valid email address";
      return;
    }

    this.loading = true;
    this.errorMessage = "";

    this.apiService.post<any>("api/user/login", {
      email: this.emailInput.toLowerCase().trim(),
      password: this.password,
    }).subscribe({
      next: (res) => {
        // Only proceed if response has Success message AND token
        if (res && res.message === "Success" && res.token && res.username) {
          this.authService.setToken(res.token);
          this.authService.setUsername(res.username);
          // Redirection is handled by the loading state and RedirectLoader
        } else {
          // If no token or success message, show error
          this.errorMessage = res?.message || "Login failed. Please check your credentials.";
          this.loading = false;
        }
      },
      error: (err) => {
        console.error("Login error:", err);
        console.error("Error status:", err.status);
        console.error("Error message:", err.error);
        
        // Handle different error status codes
        if (err.status === 404) {
          this.errorMessage = err.error?.message || "User not found. Please register first.";
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = err.error?.message || "Invalid email or password. Please check your credentials.";
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || "Invalid input. Please check your email and password.";
        } else if (err.status === 0 || err.status === undefined) {
          this.errorMessage = "Unable to connect to server. Please try again later.";
        } else {
          this.errorMessage = err.error?.message || "Server error. Please try again later.";
        }
        this.loading = false;
      }
    });
  }
}
