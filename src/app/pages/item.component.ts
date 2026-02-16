import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Product } from '../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit, OnDestroy {
  products1: Product[] = [
    {
      id: 0,
      image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100501.jpg",
      title: "Java Chip Frappuccino",
      per: "Mocha sauce and Frappuccino® chips blended with with Frappu..",
      price: 441,
    },
    {
      id: 1,
      image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/112539.jpg",
      title: "Picco Cappuccino",
      per: "Dark, Rich in flavour espresso lies in wait under a smoothed..",
      price: 200,
    },
    {
      id: 2,
      image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100385.jpg",
      title: "Iced Caffe Latte",
      per: "Our dark, Rich in flavour espresso is combined with milk and..",
      price: 372,
    },
  ];

  filteredProducts: Product[] = [];
  loading: boolean = false;
  private queryParamsSubscription?: Subscription;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize filtered products immediately
    this.filteredProducts = [...this.products1];
    
    // Subscribe to query params without delay
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const query = params['q']?.toLowerCase() || "";
      this.applyFilter(query);
    });
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  applyFilter(query: string = "") {
    if (!query) {
      this.filteredProducts = [...this.products1];
      return;
    }
    
    this.filteredProducts = this.products1.filter(item =>
      (item.title || "").toLowerCase().includes(query)
    );
    this.cdr.detectChanges();
  }

  addToCart(product: Product) {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem("token") : null;
    if (!token) {
      alert("Please login to add items to cart.");
      this.router.navigate(["/login"]);
      return;
    }

    this.apiService.post("api/cart/add-to-cart", {
      productId: product.id?.toString() || "",
      image: product.image,
      title: product.title || "",
      price: product.price || 0,
    }).subscribe({
      next: () => {
        alert("Item added to cart successfully");
      },
      error: (error) => {
        console.error(error);
        alert("Already added item");
      }
    });
  }
}
