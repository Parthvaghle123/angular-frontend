import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./login.component.css']
})
export class ChangePasswordComponent {
  email: string = "";
  emailVerified: boolean = false;
  newPassword: string = "";
  confirmPassword: string = "";
  redirectCountdown: number = 3;
  showRedirectLoader: boolean = false;
  showEmailLoader: boolean = false;
  emailCountdown: number = 3;
  alertMessage: string = "";
  alertType: string = "";

  constructor(private router: Router, private http: HttpClient) {}

  handleEmailSubmit() {
    if (!this.email) {
      this.alertMessage = "❌ Please enter your email.";
      this.alertType = "danger";
      return;
    }

    this.showEmailLoader = true;
    this.alertMessage = "";
    this.emailVerified = false;
    this.emailCountdown = 3;

    this.http.post<any>("https://backend-l22j.onrender.com/api/user/verify-email", {
      email: this.email.toLowerCase(),
    }).subscribe({
      next: (res) => {
        if (res.exists) {
          this.alertMessage = "✅ Email verified. Enter new password.";
          this.alertType = "success";

          const countdown = setInterval(() => {
            this.emailCountdown--;
            if (this.emailCountdown <= 0) {
              clearInterval(countdown);
              this.emailVerified = true;
              this.showEmailLoader = false;
            }
          }, 1000);
        } else {
          this.alertMessage = "❌ Email not found.";
          this.alertType = "danger";
          this.showEmailLoader = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.alertMessage = "Server error during email verification.";
        this.alertType = "danger";
        this.showEmailLoader = false;
      }
    });
  }

  handlePasswordChange() {
    this.alertMessage = "";

    if (!this.newPassword || !this.confirmPassword) {
      this.alertMessage = "❌ Please fill in all password fields.";
      this.alertType = "danger";
      return;
    }

    if (this.newPassword.length < 8) {
      this.alertMessage = "❌ Password must be at least 8 characters.";
      this.alertType = "danger";
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.alertMessage = "❌ Passwords do not match.";
      this.alertType = "danger";
      return;
    }

    this.showRedirectLoader = false; // Ensure it's false before starting
    this.redirectCountdown = 3;

    this.http.post<any>("https://backend-l22j.onrender.com/api/user/change-password", {
      email: this.email.toLowerCase(),
      newPassword: this.newPassword,
    }).subscribe({
      next: (res) => {
        if (res.message === "Password updated successfully ✅") {
          this.alertMessage = "✅ Password updated successfully.";
          this.alertType = "success";
          this.showRedirectLoader = true;

          const countdown = setInterval(() => {
            this.redirectCountdown--;
            if (this.redirectCountdown <= 0) {
              clearInterval(countdown);
              this.router.navigate(["/login"]);
            }
          }, 1000);
        } else {
          this.alertMessage = res.message;
          this.alertType = "danger";
          this.showRedirectLoader = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.alertMessage = "Server error during password change.";
        this.alertType = "danger";
        this.showRedirectLoader = false;
      }
    });
  }
}
