import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import Swal from 'sweetalert2';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock?: number;
  featured?: boolean;
  displayOnGift?: boolean;
  displayOnMenu?: boolean;
  isAvailable?: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchTerm: string = "";
  categoryFilter: string = "All Categories";
  categories: string[] = ["Drinks", "Food", "Merchandise", "Gifts", "Other"];
  selectedProduct: Product | null = null;
  showAddModal: boolean = false;
  showEditModal: boolean = false;

  formData = {
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Drinks",
    stock: "0",
    featured: false,
    displayOnGift: false,
    displayOnMenu: false,
  };

  imagePreview: string = "";
  imageError: string = "";

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Reset state when component initializes
    this.loading = false;
    this.error = null;
    this.products = [];
    this.filteredProducts = [];
    
    // Fetch products immediately - ensure it happens
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = false;
    this.error = null;
    
    // Ensure we're making the request
    const request = this.apiService.get<Product[]>('api/products/products', true);
    
    request.subscribe({
      next: (data) => {
        this.products = data || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = "Failed to load products";
        this.products = [];
        this.filteredProducts = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.products];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(term)
      );
    }

    if (this.categoryFilter !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category === this.categoryFilter
      );
    }

    this.filteredProducts = filtered;
  }

  onImageChange() {
    this.imagePreview = this.formData.image;
    this.imageError = "";
  }

  resetForm() {
    this.formData = {
      name: "",
      description: "",
      price: "",
      image: "",
      category: "Drinks",
      stock: "0",
      featured: false,
      displayOnGift: false,
      displayOnMenu: false,
    };
    this.imagePreview = "";
    this.imageError = "";
  }

  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  openEditModal(product: Product) {
    this.selectedProduct = product;
    this.formData = {
      name: product.name || "",
      description: product.description || "",
      price: product.price ? product.price.toString() : "0",
      image: product.image || "",
      category: product.category || "Other",
      stock: product.stock ? product.stock.toString() : "0",
      featured: !!product.featured,
      displayOnGift: !!product.displayOnGift,
      displayOnMenu: !!product.displayOnMenu,
    };
    this.imagePreview = product.image || "";
    this.imageError = "";
    this.showEditModal = true;
  }

  closeModals() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedProduct = null;
  }

  handleAddProduct() {
    this.apiService.post<any>('api/products/products', this.formData, true).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = [response.product, ...this.products];
          this.applyFilters();
          this.closeModals();
          Swal.fire('Success', 'Product added successfully!', 'success');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to add product', 'error');
      }
    });
  }

  handleEditProduct() {
    if (!this.selectedProduct) return;
    this.apiService.put<any>(`api/products/products/${this.selectedProduct._id}`, this.formData, true).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = this.products.map((p) =>
            p._id === this.selectedProduct!._id ? response.product : p
          );
          this.applyFilters();
          this.closeModals();
          Swal.fire('Success', 'Product updated successfully!', 'success');
        }
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to update product', 'error');
      }
    });
  }

  handleDeleteProduct(productId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.delete<any>(`api/products/products/${productId}`, true).subscribe({
          next: (response) => {
            if (response.success) {
              this.products = this.products.filter((p) => p._id !== productId);
              this.applyFilters();
              Swal.fire('Deleted!', 'Product has been deleted.', 'success');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to delete product', 'error');
          }
        });
      }
    });
  }

  handleToggleAvailability(productId: string) {
    this.apiService.patch<any>(`api/products/products/${productId}/toggle-availability`, {}, true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.products = this.products.map((p) =>
            p._id === productId ? response.product : p
          );
          this.applyFilters();
        }
      },
      error: (err: any) => {
        Swal.fire('Error', err.error?.message || 'Failed to toggle availability', 'error');
      }
    });
  }

  handleToggleDisplay(productId: string, displayType: string) {
    this.apiService.patch<any>(`api/products/products/${productId}/toggle-display`, { displayType }, true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.products = this.products.map((p) =>
            p._id === productId ? response.product : p
          );
          this.applyFilters();
        }
      },
      error: (err: any) => {
        Swal.fire('Error', err.error?.message || 'Failed to toggle display', 'error');
      }
    });
  }
}
