import { Component, OnInit, OnDestroy, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Product } from '../models/product.model';
import { Subscription } from 'rxjs';

const DISPLAY_LIMIT = 12;

@Component({
  selector: 'app-gift',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gift.component.html',
  styleUrls: ['./gift.component.css', "./home.component.css"]
})
export class GiftComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];
  showAllProducts = false;
  searchQuery: string = "";
  selectedCategory: string = "all";
  loading: boolean = false;
  error: string | null = null;
  private queryParamsSubscription?: Subscription;
  readonly displayLimit = DISPLAY_LIMIT;

  readonly categories = [
    { key: "all", label: "All" },
    { key: "anytime", label: "Anytime" },
    { key: "congratulations", label: "Congratulations" },
    { key: "thank-you", label: "Thank You" },
    { key: "holiday-specials", label: "Holiday Specials" },
  ];

  socials = [
    { icon: "facebook-f", link: "#" },
    { icon: "x-twitter", link: "#" },
    { icon: "linkedin-in", link: "#" },
    { icon: "instagram", link: "#" },
    { icon: "youtube", link: "#" },
  ];

  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.loading = true;
    this.error = null;
    this.products = [];
    this.filteredProducts = [];

    // Fetch products immediately - ensure it happens
    this.fetchProducts();
    
    // Subscribe to query params after initial load
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const query = (params['q'] || "").toLowerCase();
      this.searchQuery = query;
      if (this.products.length > 0) {
        this.applyFilter();
      }
    });
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  applyFilter(query?: string) {
    if (query !== undefined) {
      this.searchQuery = query.toLowerCase();
    }

    let result = [...this.products];

    if (this.searchQuery) {
      const q = this.searchQuery;
      result = result.filter(item =>
        (item.name || "").toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory !== "all") {
      result = result.filter(item => this.matchesCategory(item, this.selectedCategory));
    }

    this.filteredProducts = result;
    this.updateDisplayedProducts();
  }

  onCategorySelect(categoryKey: string) {
    if (this.selectedCategory === categoryKey) return;
    this.selectedCategory = categoryKey;
    this.showAllProducts = false;
    this.applyFilter();
  }

  private matchesCategory(product: Product, categoryKey: string): boolean {
    const category = (product.category || "").toLowerCase();

    switch (categoryKey) {
      case "anytime":
        return category === "anytime";
      case "congratulations":
        return category === "congratulations";
      case "thank-you":
        return category === "thank you";
      case "holiday-specials":
        return category === "holiday specials";
      default:
        return true;
    }
  }

  private updateDisplayedProducts() {
    const limit = this.showAllProducts ? this.filteredProducts.length : DISPLAY_LIMIT;
    this.displayedProducts = this.filteredProducts.slice(0, limit);
  }

  showMore() {
    this.showAllProducts = true;
    this.updateDisplayedProducts();
    this.cdr.detectChanges();
  }

  showLess() {
    this.showAllProducts = false;
    this.updateDisplayedProducts();
    this.cdr.detectChanges();
  }

  fetchProducts() {
    this.loading = true;
    this.error = null;
    
    // Ensure we're making the request
    const request = this.apiService.get<Product[]>("api/products/products/public?displayOnGift=true");
    
    request.subscribe({
      next: (data) => {
        this.products = data || [];
        this.error = null;
        this.showAllProducts = false;

        // Apply filter if query params exist
        const currentQuery = this.route.snapshot.queryParams['q']?.toLowerCase() || "";
        this.applyFilter(currentQuery);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching products:", err);
        this.error = "Failed to load products";
        this.loading = false;
        this.products = [];
        this.filteredProducts = [];
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(product: Product) {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem("token") : null;
    if (!token) {
      alert("Please login to add items to cart.");
      this.router.navigate(["/login"]);
      return;
    }

    this.apiService.post("api/cart/add-to-cart", {
      productId: product._id,
      image: product.image,
      title: product.name,
      price: product.price,
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
