import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface OrderItem {
  title: string;
  name?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderId: string;
  username: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchTerm: string = "";
  statusFilter: string = "All Status";
  selectedOrder: Order | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.loading = false;
    this.error = null;
    this.orders = [];
    this.filteredOrders = [];
    
    // Fetch orders immediately - ensure it happens
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading = false;
    this.error = null;
    
    // Ensure we're making the request
    const request = this.apiService.get<Order[]>('api/admin/orders', true);
    
    request.subscribe({
      next: (data) => {
        this.orders = data || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching orders:", err);
        this.orders = [];
        this.filteredOrders = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.orders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(term) ||
          order.username?.toLowerCase().includes(term) ||
          order.email?.toLowerCase().includes(term) ||
          order.phone?.includes(term)
      );
    }

    if (this.statusFilter !== "All Status") {
      filtered = filtered.filter((order) => order.status === this.statusFilter);
    }

    this.filteredOrders = filtered;
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    if (newStatus === "Cancelled") {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      );
      if (!confirmCancel) return;
    }

    this.apiService.put(`api/admin/orders/${orderId}/status`, { status: newStatus }, true).subscribe({
      next: () => {
        this.orders = this.orders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        );
        this.applyFilters();
        alert(`Order status updated to ${newStatus} successfully!`);
      },
      error: (err) => {
        console.error("Failed to update order status:", err);
        alert("Failed to update order status.");
      }
    });
  }

  setSelectedOrder(order: Order) {
    this.selectedOrder = order;
  }

  get totalOrdersCount(): number {
    return this.orders.length;
  }

  get totalRevenue(): number {
    return this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
  }

  get cancelledOrdersCount(): number {
    return this.orders.filter(order => order.status === 'Cancelled').length;
  }

  get completedOrdersCount(): number {
    return this.orders.filter(order => order.status === 'Approved' || order.status === 'completed').length;
  }
}
