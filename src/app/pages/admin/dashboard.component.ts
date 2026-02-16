import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  orderId: string;
  username: string;
  total: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  };
  recentOrders: RecentOrder[] = [];
  loading: boolean = false;
  error: string | null = null;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.loading = false;
    this.error = null;
    this.stats = {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0
    };
    this.recentOrders = [];
    
    // Always try to fetch dashboard data - let API call determine authentication
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    // Clear any previous errors
    this.error = null;
    
    // Make the API request immediately
    const request = this.apiService.get<any>('api/admin/stats', true);
    
    // Subscribe to the request
    request.subscribe({
      next: (res) => {
        if (res) {
          this.stats = {
            totalUsers: res.totalUsers || 0,
            totalOrders: res.totalOrders || 0,
            totalRevenue: res.totalRevenue || 0
          };
          this.recentOrders = res.recentOrders || [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        
        // Check if error is due to authentication issues
        if (err.status === 401 || err.status === 403) {
          // Token is invalid/expired, redirect to login
          this.router.navigate(['/admin/login']);
          return;
        }
        
        // Only show error message for real server/network issues
        this.error = "Failed to load dashboard data. Please try again later.";
        this.stats = {
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0
        };
        this.recentOrders = [];
        this.cdr.detectChanges();
      }
    });
  }

  getStatusBadge(status: string): string {
    const statusClasses: { [key: string]: string } = {
      completed: 'status-completed',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      Approved: 'status-completed',
      Cancelled: 'status-cancelled',
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  }
}
