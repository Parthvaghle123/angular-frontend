import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  createdAt: string;
  status?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = "";
  statusFilter: string = "all";
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.loading = false;
    this.error = null;
    this.users = [];
    this.filteredUsers = [];
    
    // Fetch users immediately - ensure it happens
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = false;
    this.error = null;
    
    // Ensure we're making the request
    const request = this.apiService.get<User[]>('api/admin/users', true);
    
    request.subscribe({
      next: (data) => {
        this.users = data || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching users:", err);
        this.error = "Failed to fetch users. Check connection.";
        this.users = [];
        this.filteredUsers = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let filtered = this.users;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.username?.toLowerCase() || "").includes(term) ||
          (user.email?.toLowerCase() || "").includes(term) ||
          (user.phone?.toLowerCase() || "").includes(term)
      );
    }

    if (this.statusFilter !== "all") {
      filtered = filtered.filter(
        (user) => (user.status || "active").toLowerCase() === this.statusFilter
      );
    }

    this.filteredUsers = filtered;
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  getGenderBadge(gender: string): string {
    const genderClasses: { [key: string]: string } = {
      male: "status-badge status-male",
      female: "status-badge status-female",
      other: "status-badge status-other",
    };
    return genderClasses[gender?.toLowerCase()] || "status-badge";
  }

  get totalUsersCount(): number {
    return this.users.length;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => (u.status || "active").toLowerCase() === 'active').length;
  }

  get newThisMonthCount(): number {
    const now = new Date();
    return this.users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }

  get thisWeekCount(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.users.filter(u => new Date(u.createdAt) >= weekAgo).length;
  }
}
