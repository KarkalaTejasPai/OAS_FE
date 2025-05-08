import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { ImageService } from '../../Services/image.service';
import { SafeUrl } from '@angular/platform-browser';
 
interface Product {
  productID: number;
  title: string;
  description: string;
  startPrice: number;
  category: string;
  status: string;
  displayImage?: SafeUrl;
}
 
@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css']
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: Product[] = [];
  filteredAuctions: Product[] = [];
  selectedCategory: string = 'allproducts';
  categories: string[] = ['allproducts', 'fashion', 'home', 'electronics', 'other'];
  private apiUrl = 'https://localhost:44385/api/Product';
  minPrice: number | null = null;
  maxPrice: number | null = null;
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private imageService: ImageService
  ) {}
 
  ngOnInit(): void {
    this.fetchAuctions();
  }
 
  private fetchAuctions(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (products) => {
        this.auctions = products;
        this.filteredAuctions = products; // Initialize filtered auctions
        this.auctions.forEach(product => this.loadProductImage(product));
      },
      error: (error) => console.error('Error fetching auctions:', error)
    });
  }
 
  private loadProductImage(product: Product): void {
    this.imageService.fetchProductImage(product.productID)
      .subscribe({
        next: async (data) => {
          try {
            const images = await this.imageService.processZipFile(data);
            if (images && images.length > 0) {
              product.displayImage = images[0]; // Get first image
            }
          } catch (error) {
            console.error(`Error processing image for product ${product.productID}:`, error);
          }
        },
        error: (error) => {
          console.error(`Error loading image for product ${product.productID}:`, error);
        }
      });
  }
 
  applyFilters(): void {
    this.filteredAuctions = this.auctions.filter(product => {
      let matchesCategory = true;
      let matchesPrice = true;
 
      // Category filter
      if (this.selectedCategory !== 'allproducts') {
        matchesCategory = product.category.toLowerCase() === this.selectedCategory.toLowerCase();
      }
 
      // Price filter
      if (this.minPrice !== null) {
        matchesPrice = matchesPrice && product.startPrice >= this.minPrice;
      }
      if (this.maxPrice !== null) {
        matchesPrice = matchesPrice && product.startPrice <= this.maxPrice;
      }
 
      return matchesCategory && matchesPrice;
    });
  }
 
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
 
  onPriceChange(): void {
    // Convert empty strings to null
    if (this.minPrice === 0) this.minPrice = null;
    if (this.maxPrice === 0) this.maxPrice = null;
 
    // Validate price range
    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
      // Swap values if min is greater than max
      [this.minPrice, this.maxPrice] = [this.maxPrice, this.minPrice];
    }
 
    this.applyFilters();
  }
 
  ngOnDestroy(): void {
    // Clean up object URLs
    this.auctions.forEach(product => {
      if (product.displayImage) {
        URL.revokeObjectURL(product.displayImage.toString());
      }
    });
  }
 
  viewDetails(productId: number): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/auction-detail', productId]);
    } else {
      this.redirectToLogin();
    }
  }
 
  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
 
  redirectToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/auction-detail' }
    });
  }
}
 