import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = {
    username: "",
    email: "",
    phone: "",
    country_code: "+91",
    gender: "",
    dob: "",
    address: "",
  };
  password: string = "";
  strengthMessage: string = "";
  errorMessage: string = "";
  errors: any = {};
  showSuccessToast: boolean = false;
  toastMessage: string = "";

  constructor(private router: Router, private apiService: ApiService) {}

  handleChange(e: any) {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        (this.form as any)[name] = value;
      }
    } else if (name === "username") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        (this.form as any)[name] = value;
      }
    } else {
      (this.form as any)[name] = value;
    }
  }

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

  validateForm(): boolean {
    let newErrors: any = {};

    if (!this.form.username || this.form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(this.form.username)) {
      newErrors.username = "Username must contain only letters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(this.form.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits.";
    }

    if (!this.form.gender) {
      newErrors.gender = "Please select gender.";
    }

    if (!this.form.dob) {
      newErrors.dob = "Date of birth is required.";
    } else {
      const today = new Date();
      const dobDate = new Date(this.form.dob);
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 14) {
        newErrors.dob = "You must be at least 14 years old to register.";
      }
    }

    if (!this.form.address || this.form.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      newErrors.password = "Password must be 8+ chars, 1 uppercase, 1 number, 1 special char.";
    }

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  handleSubmit() {
    if (!this.validateForm()) return;

    this.apiService.post<any>("api/user/register", {
      ...this.form,
      password: this.password,
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastMessage = "Registration successful ✅";
          this.showSuccessToast = true;
          setTimeout(() => this.showSuccessToast = false, 3000);
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 1000);
        }
      },
      error: (err) => {
        console.error("Signup error:", err);
        this.errorMessage = err.error?.message || "User Already Exists.";
      }
    });
  }
}
