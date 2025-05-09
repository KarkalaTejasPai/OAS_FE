import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ImageService } from '../../Services/image.service';
import { SafeUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

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
  timeLeft: string;
  currentBid: number;
  bids: number;
  startingBid: number;
  incrementAmount: number;
  watchers: number;
}

// Add this type at the top with your other interfaces
type SafeUrlString = string & { _brand: 'SafeUrl' };

// Add this interface with your other interfaces
interface AuctionData {
  auctionId: number;
  productId: number;
  startDate: string;
  endDate: string;
  currentBid: string;
  status: string;
}

// Add this interface at the top with your other interfaces
interface BidRequest {
  bidID: number;
  auctionID: number;
  buyerID: number;
  amount: number;
  bidTime: string;
}

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [
    RouterLink, 
    HeaderComponent, 
    FooterComponent, 
    CommonModule, 
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent implements OnInit, OnDestroy {
  auction: Product | null = null;
  private apiUrl = 'https://localhost:44385/api/Product';
  images: SafeUrl[] = [];
  selectedImage: SafeUrl | null = null;
  bidAmount: number = 0;
  errorMessage: string = '';
  auctionData: AuctionData | null = null;
  private auctionApiUrl = 'https://localhost:44385/api/Auction';
  private bidApiUrl = 'https://localhost:44385/api/Bid';
  private bidSubject = new BehaviorSubject<number>(0);
  currentBidAmount$ = this.bidSubject.asObservable();
  private bidsCountSubject = new BehaviorSubject<number>(0);
  bidsCount$ = this.bidsCountSubject.asObservable();
  private timeLeftInterval: any;
  timeLeft: string = '';
  isBidding: boolean = false;
  bidCooldown: number = 5;
  private bidCooldownInterval: any;
  isAuctionEnded: boolean = false;
  buyNowPrice: number = 0;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.fetchProductDetails(productId);
        this.loadProductImages(productId);
        this.fetchAuctionDetails(productId); // Add this new call
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

  private fetchAuctionDetails(productId: number): void {
    this.http.get<AuctionData>(`${this.auctionApiUrl}/${productId}`).subscribe({
      next: (data) => {
        this.auctionData = data;
        if (this.auction) {
          const initialBid = parseFloat(this.auctionData.currentBid);
          this.bidSubject.next(initialBid);
          this.bidsCountSubject.next(0);
          this.auction.currentBid = initialBid;
          this.auction.startPrice = initialBid;
          this.bidAmount = initialBid + (this.auction.incrementAmount || 10);

          // Start the timer
          this.updateTimeLeft();
          this.timeLeftInterval = setInterval(() => {
            this.updateTimeLeft();
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error fetching auction details:', error);
      }
    });
  }

  private updateTimeLeft(): void {
    if (!this.auctionData) return;

    const now = new Date();
    const endDate = new Date(this.auctionData.endDate);
    const timeDiff = endDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      this.timeLeft = 'Auction Ended';
      this.isAuctionEnded = true;
      this.buyNowPrice = this.bidSubject.value; // Set buy now price to final bid
      if (this.timeLeftInterval) {
        clearInterval(this.timeLeftInterval);
      }
      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    this.timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  get minimumBid(): number {
    if (!this.auction) return 0;
    return this.bidSubject.value + (this.auction.incrementAmount || 10);
  }

  get progressWidth(): string {
    if (!this.auctionData) return '0%';
    return this.timeLeft === 'Auction Ended' ? '0%' : '100%';
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

  placeBid(): void {
    if (!this.auction || !this.auctionData || this.isBidding) return;
    
    if (this.bidAmount <= this.bidSubject.value) {
      this.errorMessage = 'Bid amount must be higher than current bid';
      return;
    }

    // Check if auction is still active
    const now = new Date();
    const endDate = new Date(this.auctionData.endDate);
    if (now > endDate) {
      this.errorMessage = 'Auction has ended';
      return;
    }

    // Create bid request
    const bidRequest: BidRequest = {
      bidID: 0, // Will be assigned by the API
      auctionID: this.auctionData.auctionId,
      buyerID: 1, // Replace with actual logged-in user's ID
      amount: this.bidAmount,
      bidTime: new Date().toISOString()
    };

    // Send bid to API
    this.http.post<BidRequest>(this.bidApiUrl, bidRequest).subscribe({
      next: (response) => {
        // Update local state
        this.bidSubject.next(this.bidAmount);
        this.bidsCountSubject.next(this.bidsCountSubject.value + 1);
        
        if (this.auction) {
          this.auction.currentBid = this.bidAmount;
          this.auction.bids = this.bidsCountSubject.value;
          this.errorMessage = '';
          // Set next minimum bid
          this.bidAmount = this.auction.currentBid + (this.auction.incrementAmount || 10);
        }
        
        // Start the cooldown timer after successful bid
        this.startBidCooldown();
      },
      error: (error) => {
        console.error('Error placing bid:', error);
        this.errorMessage = 'Failed to place bid. Please try again.';
      }
    });
  }

  private startBidCooldown(): void {
    this.isBidding = true;
    this.bidCooldown = 5;
    
    this.bidCooldownInterval = setInterval(() => {
      this.bidCooldown--;
      if (this.bidCooldown <= 0) {
        this.isBidding = false;
        clearInterval(this.bidCooldownInterval);
      }
    }, 1000);
  }

  buyNow(): void {
    if (!this.isAuctionEnded || !this.auction || !this.auctionData) return;

    // Implement your buy now logic here
    console.log('Purchasing item at price:', this.buyNowPrice);
    // Add API call to handle purchase
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.bidSubject.complete();
    this.bidsCountSubject.complete();
    
    // Clean up object URLs
    this.images.forEach(image => {
      URL.revokeObjectURL(image.toString());
    });

    // Clear the timer interval
    if (this.timeLeftInterval) {
      clearInterval(this.timeLeftInterval);
    }

    // Clear the cooldown interval
    if (this.bidCooldownInterval) {
      clearInterval(this.bidCooldownInterval);
    }
  }
}