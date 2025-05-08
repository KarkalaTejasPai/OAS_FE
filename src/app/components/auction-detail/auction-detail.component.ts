import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ImageService } from '../../Services/image.service';
import { SafeUrl } from '@angular/platform-browser';

interface Product {
  productID: number;
  sellerID: number;
  title: string;
  description: string;
  startPrice: number;
  category: string;
  status: string;
  mainImage?: SafeUrl;  // Keep this for image handling
  selectedImage?: SafeUrl;  // Add this new property
}

// Add this type at the top with your other interfaces
type SafeUrlString = string & { _brand: 'SafeUrl' };

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule, HttpClientModule],
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  auction: Product | null = null;
  private apiUrl = 'https://localhost:44385/api/Product';
  images: SafeUrl[] = [];
  selectedImage: SafeUrl | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        // First fetch product details
        this.fetchProductDetails(productId);
        // Then fetch images
        this.loadProductImages(productId);
      }
    });
  }

  private fetchProductDetails(productId: number): void {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Use the correct endpoint for product details
    this.http.get<Product>(`${this.apiUrl}/${productId}`, { headers }).subscribe({
      next: (product) => {
        this.auction = product;
        console.log('Fetched product details:', this.auction);
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
      }
    });
  }

  private loadProductImages(productId: number): void {
    this.imageService.fetchProductImage(productId).subscribe({
      next: async (data) => {
        try {
          this.images = await this.imageService.processZipFile(data);
          console.log('Processed images array:', this.images); // Debug log
          
          if (this.images && this.images.length > 0) {
            this.selectedImage = this.images[0];
            if (this.auction) {
              this.auction.mainImage = this.selectedImage;
              this.auction.selectedImage = this.selectedImage;
            }
            console.log('Images loaded successfully:', this.images.length);
          }
        } catch (error) {
          console.error('Error processing images:', error);
        }
      },
      error: (error) => {
        console.error('Error loading images:', error);
      }
    });
  }

  selectImage(image: SafeUrl): void {
    this.selectedImage = image;
    if (this.auction) {
      this.auction.mainImage = image;
      this.auction.selectedImage = image;
    }
    
    // Reorder images to show selected image first
    const index = this.images.indexOf(image);
    if (index > 0) {
      this.images = [
        image,
        ...this.images.slice(0, index),
        ...this.images.slice(index + 1)
      ];
    }
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    event.target.src = 'assets/placeholder-image.png'; // Fallback image
  }

  ngOnDestroy(): void {
    // Clean up object URLs
    this.images.forEach(image => {
      URL.revokeObjectURL(image.toString());
    });
  }
}