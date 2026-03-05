import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  total: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.cartItems = [];
    this.totalAmount = 0;
    this.error = null;
    
    // Fetch cart immediately - ensure it happens
    this.fetchCart();
  }

  fetchCart() {
    this.error = null;
    
    // Ensure we're making the request
    const request = this.apiService.get<{ cart: CartItem[] }>('api/cart/cart');
    
    request.subscribe({
      next: (res) => {
        this.cartItems = res.cart || [];
        this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.total, 0);
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error fetching cart:", err);
        
        if (err.status === 401) {
          // Unauthorized - redirect to login
          alert("Please login to view your cart");
          this.router.navigate(['/login']);
        } else {
          this.error = "Failed to load cart. Please try again later.";
        }
        this.cartItems = [];
        this.totalAmount = 0;
        this.cdr.detectChanges();
      }
    });
  }

  updateQuantity(productId: string, action: 'increase' | 'decrease') {
    const request = this.apiService.put(`api/cart/update-quantity/${productId}`, { action });
    
    request.subscribe({
      next: () => {
        this.fetchCart();
      },
      error: (err) => {
        console.error("Failed to update quantity:", err);
        alert("Failed to update quantity. Please try again.");
      }
    });
  }

  removeFromCart(productId: string) {
    const request = this.apiService.delete(`api/cart/remove-from-cart/${productId}`);
    
    request.subscribe({
      next: () => {
        this.fetchCart();
      },
      error: (err) => {
        console.error("Failed to remove item:", err);
        alert("Failed to remove item. Please try again.");
      }
    });
  }
}
