import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import jsPDF from 'jspdf';

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
  status: string;
}

interface Order {
  _id: string;
  orderId: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  cancelReason?: string;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  cancelOrderId: string | null = null;
  cancelReason: string = "";
  customReason: string = "";
  filter: string = "All";
  showCancelToast: boolean = false;
  cancelToastMessage: string = "";
  loading: boolean = false;
  error: string | null = null;
  
  private platformId = inject(PLATFORM_ID);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.loading = true;
    this.error = null;
    this.orders = [];
    
    // Fetch orders immediately - ensure it happens
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading = true;
    this.error = null;
    
    // Ensure we're making the request
    const request = this.apiService.get<any>('api/order/orders');
    
    request.subscribe({
      next: (res) => {
        this.orders = res.orders || res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error("Error fetching orders", err);
        this.loading = false;
        
        if (err.status === 401) {
          // Unauthorized - redirect to login
          if (isPlatformBrowser(this.platformId)) {
            this.router.navigate(['/login']);
          }
        } else {
          this.error = "Failed to load orders. Please try again later.";
        }
        this.orders = [];
        this.cdr.detectChanges();
      }
    });
  }

  handleCancel(e: Event) {
    e.preventDefault();
    const reasonToSend = this.cancelReason === "Other" ? this.customReason : this.cancelReason;

    if (!reasonToSend.trim()) {
      this.cancelToastMessage = "Please enter a reason";
      this.showCancelToast = true;
      setTimeout(() => this.showCancelToast = false, 3000);
      return;
    }

    if (!this.cancelOrderId) return;

    this.apiService.put(`api/order/cancel/${this.cancelOrderId}`, { reason: reasonToSend }).subscribe({
      next: () => {
        if (isPlatformBrowser(this.platformId)) {
          const closeBtn = document.getElementById("cancelCloseBtn");
          if (closeBtn) closeBtn.click();
        }
        
        this.cancelToastMessage = "Order cancelled successfully";
        this.showCancelToast = true;
        setTimeout(() => this.showCancelToast = false, 3000);

        this.cancelOrderId = null;
        this.cancelReason = "";
        this.customReason = "";
        this.fetchOrders();
      },
      error: (err) => {
        console.error(err);
        this.cancelToastMessage = "Cancel failed. Please try again.";
        this.showCancelToast = true;
        setTimeout(() => this.showCancelToast = false, 3000);
      }
    });
  }

  downloadPDF(order: Order) {
    const doc = new jsPDF();

    const starbucksGreen: [number, number, number] = [0, 112, 74];
    const darkBrown: [number, number, number] = [101, 67, 33];
    const cream: [number, number, number] = [245, 245, 220];
    const white: [number, number, number] = [255, 255, 255];

    doc.setFillColor(...cream);
    doc.rect(0, 0, 210, 297, "F");

    doc.setDrawColor(...darkBrown);
    doc.setLineWidth(2);
    doc.line(10, 10, 200, 10);
    doc.line(200, 10, 200, 180);
    doc.line(10, 180, 10, 10);

    let y = 30;

    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.setTextColor(...darkBrown);
    doc.text("STARBUCKS REDESIGN", 20, y);

    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text("123 Coffee Street, Seattle WA 98101", 20, y + 10);
    doc.text("Phone: 1-800-STARBUCKS", 20, y + 18);
    doc.text("https://frontend-rho-flax-13.vercel.app", 20, y + 26);

    doc.setFillColor(...starbucksGreen);
    doc.rect(20, y + 35, 70, 14, "F");
    doc.setFontSize(13);
    doc.setFont("times", "bold");
    doc.setTextColor(...white);
    doc.text(`INVOICE ${order.orderId}`, 55, y + 43, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.setTextColor(...darkBrown);
    doc.text(
      `Date: ${new Date(order.createdAt)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        .toUpperCase()}`,
      20,
      y + 55
    );

    const rightX = 120;
    doc.setFontSize(11);
    doc.setFont("times", "bold");
    doc.setTextColor(...darkBrown);
    doc.text("CUSTOMER DETAILS:", rightX, y + 15);

    doc.setFont("times", "normal");
    doc.text(`Email: ${order.email}`, rightX, y + 27);
    doc.text(`Phone: ${order.phone}`, rightX, y + 35);
    doc.text(`Address: ${order.address}`, rightX, y + 43);
    doc.text(`Payment: ${order.paymentMethod}`, rightX, y + 51);
    doc.text(`Status: ${order.status}`, rightX, y + 59);

    if (order.status === "Cancelled" && order.cancelReason) {
      doc.setTextColor(255, 0, 0);
      doc.text(`Cancel Reason: ${order.cancelReason}`, rightX, y + 67);
      doc.setTextColor(...darkBrown);
    }

    doc.setDrawColor(...starbucksGreen);
    doc.setLineWidth(0.8);
    doc.line(20, y + 70, 190, y + 70);

    const tableStartY = y + 80;
    const headerY = tableStartY;

    doc.setFillColor(...starbucksGreen);
    doc.rect(20, headerY - 6, 170, 10, "F");

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.setTextColor(...white);
    doc.text("DESCRIPTION", 35, headerY);
    doc.text("QTY", 100, headerY);
    doc.text("PRICE", 125, headerY);
    doc.text("TOTAL", 155, headerY);

    doc.setFont("times", "normal");
    doc.setTextColor(...darkBrown);
    let currentY = headerY + 12;

    order.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      if (index % 2 === 0) {
        doc.setFillColor(...cream);
        doc.rect(20, currentY - 4, 170, 8, "F");
      }
      doc.text(item.title, 25, currentY);
      doc.text(item.quantity.toString(), 100, currentY);
      doc.text(`${item.price.toFixed(2)}`, 130, currentY);
      doc.text(`${itemTotal.toFixed(2)}`, 160, currentY);
      currentY += 10;
    });

    doc.setDrawColor(...starbucksGreen);
    doc.line(20, currentY + 3, 190, currentY + 3);

    const grandTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    currentY += 12;

    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.setTextColor(...starbucksGreen);
    doc.text("TOTAL", 130, currentY);
    doc.text(`${grandTotal.toFixed(2)}`, 160, currentY);

    const coffeeQuotes = [
      '"Life happens, coffee helps."',
      '"Coffee is always a good idea."',
      '"But first, coffee."',
      '"Coffee: because adulting is hard."',
      '"Rise and grind, coffee time."',
      '"Coffee makes everything better."',
      '"Fueled by coffee and determination."',
      '"Coffee: the solution to everything."',
      '"One cup at a time."',
      '"Coffee is my love language."',
    ];

    const randomQuote = coffeeQuotes[Math.floor(Math.random() * coffeeQuotes.length)];
    const quoteY = currentY + 25;
    doc.setFontSize(13);
    doc.setFont("times", "italic");
    doc.setTextColor(...starbucksGreen);
    doc.text(randomQuote, 105, quoteY, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.setTextColor(...darkBrown);
    doc.text("- Starbucks Redesign", 105, quoteY + 8, { align: "center" });

    const contentHeight = quoteY + 20;
    const borderHeight = Math.max(170, contentHeight + 20);

    doc.setDrawColor(...darkBrown);
    doc.setLineWidth(2);
    doc.line(10, 10, 200, 10);
    doc.line(200, 10, 200, 10 + borderHeight);
    doc.line(200, 10 + borderHeight, 10, 10 + borderHeight);
    doc.line(10, 10 + borderHeight, 10, 10);

    doc.setFillColor(...starbucksGreen);
    doc.rect(10, 10 + borderHeight - 3, 190, 3, "F");

    doc.save(`Starbucks_Invoice_${order.orderId}.pdf`);
  }

  get filteredOrders() {
    return this.filter === "All" ? this.orders : this.orders.filter((o) => o.status === this.filter);
  }

  calculateGrandTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  openCancelModal(order: Order) {
    this.cancelOrderId = order.orderId;
    this.cancelReason = "";
    this.customReason = "";
  }
}
