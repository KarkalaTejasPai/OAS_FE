import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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

// Add this interface for max bid response
interface MaxBidResponse {
  amount: number;
  buyerID: number;
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
  currentBid = signal<number>(0);
  private bidsCountSubject = new BehaviorSubject<number>(0);
  bidsCount$ = this.bidsCountSubject.asObservable();
  private timeLeftInterval: any;
  timeLeft: string = '';
  isBidding: boolean = false;
  bidCooldown: number = 10; // Changed to 10 seconds
  private bidCooldownInterval: any;
  isAuctionEnded: boolean = false;
  buyNowPrice: number = 0;
  private bidRefreshInterval: any;
  private currentMaxBid: MaxBidResponse | null = null;
  private maxBidUrl = 'https://localhost:44385/api/Bid/max';
  private bidCountUrl = 'https://localhost:44385/api/Bid/count';
  currentBidCount: number = 0;
  private bidCountInterval: any;

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
          this.currentBid.set(initialBid);
          this.bidsCountSubject.next(0);
          this.auction.currentBid = initialBid;
          this.auction.startPrice = initialBid;
          this.bidAmount = initialBid + (this.auction.incrementAmount || 10);

          // Start the timer
          this.updateTimeLeft();
          this.timeLeftInterval = setInterval(() => {
            this.updateTimeLeft();
          }, 1000);

          // Start bid refresh interval
          this.startBidRefresh(data.auctionId);
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
      // Set buy now price to final bid plus 20%
      this.buyNowPrice = Math.ceil(this.currentBid() * 1.2);
      
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
    return this.currentBid() + (this.auction.incrementAmount || 10);
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

    const currentUserId = this.getCurrentUserId();
    if (currentUserId === 0) {
      this.errorMessage = 'Please login to place a bid';
      return;
    }

    // Check if current user has the highest bid
    if (this.currentMaxBid?.buyerID === currentUserId) {
      this.errorMessage = 'You already have the highest bid';
      return;
    }
    
    if (this.bidAmount <= this.currentBid()) {
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
      buyerID: currentUserId, // Use the retrieved userId
      amount: this.bidAmount,
      bidTime: new Date().toISOString()
    };

    // Send bid to API
    this.http.post<BidRequest>(this.bidApiUrl, bidRequest).subscribe({
      next: (response) => {
        // Update local state
        this.currentBid.set(this.bidAmount);
        
        if (this.auction) {
          this.auction.currentBid = this.bidAmount;
          this.errorMessage = '';
          // Set next minimum bid
          this.bidAmount = this.currentBid() + (this.auction.incrementAmount || 10);
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
    this.bidCooldown = 10; // Changed to 10 seconds
    
    this.bidCooldownInterval = setInterval(() => {
      this.bidCooldown--;
      if (this.bidCooldown <= 0) {
        this.isBidding = false;
        clearInterval(this.bidCooldownInterval);
      }
    }, 1000);
  }

  private startBidRefresh(auctionId: number): void {
    // Clear any existing intervals
    if (this.bidRefreshInterval) {
      clearInterval(this.bidRefreshInterval);
    }
    if (this.bidCountInterval) {
      clearInterval(this.bidCountInterval);
    }

    // Initial fetches
    this.fetchCurrentMaxBid(auctionId);
    this.fetchBidCount(auctionId);

    // Set up new intervals
    this.bidRefreshInterval = setInterval(() => {
      this.fetchCurrentMaxBid(auctionId);
    }, 6000);

    this.bidCountInterval = setInterval(() => {
      this.fetchBidCount(auctionId);
    }, 8000);
  }

  private fetchCurrentMaxBid(auctionId: number): void {
    const url = `${this.maxBidUrl}/${auctionId}`;
    console.log('Fetching max bid at:', new Date().toISOString(), 'URL:', url);
    
    this.http.get<number>(url).subscribe({
      next: (maxBid) => {
        console.log('Max bid API response:', maxBid);
        
        // Update the signal value if the new amount is higher
        if (maxBid > this.currentBid()) {
          console.log('Updating bid:', {
            previous: this.currentBid(),
            new: maxBid,
            auctionId: auctionId
          });
          
          this.currentBid.set(maxBid);
          
          if (this.auction) {
            this.auction.currentBid = maxBid;
            this.bidAmount = maxBid + (this.auction.incrementAmount || 10);
          }
        }
      },
      error: (error) => {
        console.error('Max bid API Error:', {
          timestamp: new Date().toISOString(),
          status: error.status,
          message: error.message,
          url: url,
          auctionId: auctionId
        });
      }
    });
  }

  private fetchBidCount(auctionId: number): void {
    console.log('Fetching bid count at:', new Date().toISOString());
    
    this.http.get<number>(`${this.bidCountUrl}/${auctionId}`).subscribe({
      next: (count) => {
        console.log('Bid count response:', count);
        this.currentBidCount = count;
        this.bidsCountSubject.next(count);
        if (this.auction) {
          this.auction.bids = count;
        }
      },
      error: (error) => {
        console.error('Error fetching bid count:', error);
      }
    });
  }

  buyNow(): void {
    if (!this.isAuctionEnded || !this.auction || !this.auctionData) {
      this.errorMessage = 'Buy Now is only available after the auction ends';
      return;
    }

    const currentUserId = this.getCurrentUserId();
    if (currentUserId === 0) {
      this.errorMessage = 'Please login to purchase';
      return;
    }

    // Create purchase request
    const purchaseRequest = {
      auctionId: this.auctionData.auctionId,
      productId: this.auction.productID,
      buyerId: currentUserId, // Use the retrieved userId
      purchaseAmount: this.buyNowPrice,
      purchaseDate: new Date().toISOString()
    };

    // Add your API call here to handle the purchase
    console.log('Processing purchase:', purchaseRequest);
    // Navigate to payment page or handle purchase flow
    window.location.href = `/payment?amount=${this.buyNowPrice}&productId=${this.auction.productID}`;
  }

  private getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 0;
  }

  // Add this method to test the API manually
  testMaxBidApi(): void {
    if (this.auctionData) {
      console.log('Testing max bid API for auction:', this.auctionData.auctionId);
      this.fetchCurrentMaxBid(this.auctionData.auctionId);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
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

    if (this.bidRefreshInterval) {
      clearInterval(this.bidRefreshInterval);
    }

    if (this.bidCountInterval) {
      clearInterval(this.bidCountInterval);
    }
  }
}