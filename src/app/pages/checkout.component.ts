import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  formData = {
    email: "",
    phone: "",
    countryCode: "+91",
    address: "",
    paymentMethod: "Cash On Delivery",
  };

  loading: boolean = false;
  errorMsg: string = "";

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    this.apiService.get<any>('api/order/profile').subscribe({
      next: (res) => {
        this.formData.email = res.email || "";
        this.formData.phone = res.phone || "";
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching profile", err);
        this.cdr.detectChanges();
      }
    });
  }

  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => resolve(); // still resolve so we can show error in placeOrder
      document.body.appendChild(script);
    });
  }

  placeOrder() {
    if (!this.formData.email?.trim() || !this.formData.phone?.trim() || !this.formData.address?.trim()) {
      this.errorMsg = "Please fill in all details and confirm your order.";
      return;
    }
    if (!this.formData.paymentMethod) {
      this.errorMsg = "Please select a payment method.";
      return;
    }

    this.errorMsg = "";

    if (this.formData.paymentMethod === "Cash On Delivery") {
      this.placeCodOrder();
      return;
    }

    if (this.formData.paymentMethod === "Online Payment") {
      this.openRazorpayCheckout();
      return;
    }

    this.errorMsg = "Invalid payment method.";
  }

  placeCodOrder() {
    this.loading = true;
    const payload = { ...this.formData };
    this.apiService.post("api/order/order", payload).subscribe({
      next: () => this.router.navigate(["/order-success"]),
      error: (err) => {
        console.error("Order failed", err);
        this.errorMsg = "❌ Order failed. Please try again.";
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }

  openRazorpayCheckout() {
    this.loading = true;
    this.apiService.post<{ orderId: string; amount: number; currency: string; key_id: string }>(
      "api/order/create-razorpay-order",
      {}
    ).subscribe({
      next: (res) => {
        this.loadRazorpayScript().then(() => {
          if (!window.Razorpay) {
            this.errorMsg = "Payment script failed to load. Please try again.";
            this.loading = false;
            return;
          }
          const options = {
            key: res.key_id,
            amount: res.amount,
            currency: res.currency,
            order_id: res.orderId,
            name: "Starbucks",
            description: "Order payment",
            prefill: {
              email: this.formData.email,
              contact: this.formData.phone,
            },
            handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              this.verifyAndPlaceOrder(response);
            },
            modal: {
              ondismiss: () => {
                this.loading = false;
                alert("Payment cancelled. Please make payment to complete your order.");
              },
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      },
      error: (err) => {
        console.error("Create Razorpay order failed", err);
        this.errorMsg = err.error?.message || "❌ Could not start payment. Please try again.";
        this.loading = false;
      },
    });
  }

  verifyAndPlaceOrder(razorpayResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    const payload = {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
      email: this.formData.email,
      phone: this.formData.phone,
      countryCode: this.formData.countryCode,
      address: this.formData.address,
    };
    this.apiService.post("api/order/verify-payment", payload).subscribe({
      next: () => this.router.navigate(["/order-success"]),
      error: (err) => {
        console.error("Verify payment failed", err);
        this.errorMsg = err.error?.message || "❌ Payment verification failed. Please contact support if amount was deducted.";
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }
}
