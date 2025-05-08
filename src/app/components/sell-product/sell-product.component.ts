import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

interface Product {
  productId: number;
  sellerID: number;
  title: string;
  description: string;
  startPrice: number;
  category: string;
  status: string;
  endDate: string; // Add endDate to the Product interface
}

interface ProductResponse {
  productID: number;
  sellerID: number;
  title: string;
  description: string;
  startPrice: number;
  category: string;
  status: string;
}

@Component({
  selector: 'app-sell-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  providers: [AuthService],
  templateUrl: './sell-product.component.html',
  styleUrls: ['./sell-product.component.css']
})
export class SellProductComponent implements OnInit {
  product: Product = {
    productId: 0,
    sellerID: 0,
    title: '',
    description: '',
    startPrice: 0,
    category: '',
    status: 'Available',
    endDate: '' // Initialize endDate
  };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const userId = this.authService.getUserId();
    if (userId) {
      this.product.sellerID = Number(userId);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.validateForm()) {
      alert(this.errorMessage);
      return;
    }

    // First API call to add the product
    this.http.post<ProductResponse>('https://localhost:44385/api/Product', this.product)
      .subscribe({
        next: (response) => {
          this.processProductResponse(response);
        },
        error: (error) => {
          this.errorMessage = 'Failed to list product. Please try again.';
          console.error('Error occurred during product creation:', error);
          alert(this.errorMessage);
        }
      });
  }

  processProductResponse(response: any) {
    console.log('Received response:', response);
    const productId = response?.productId || response?.productID;
    if (productId === undefined || typeof productId !== 'number') {
      console.error('Invalid response format:', response);
      this.errorMessage = 'Invalid response format received from server';
      alert('An error occurred while processing the response. Please try again.');
      return;
    }
    console.log('Valid product ID:', productId);
    localStorage.setItem('currentProductId', productId.toString());

    // Second API call to add the auction
    const auctionData = {
      productId: productId,
      startDate: new Date().toISOString(), // Assuming current date as start date
      endDate: this.product.endDate,
      currentBid: this.product.startPrice.toString(),
      status: 'Available'
    };

    this.http.post('https://localhost:44385/api/Auction', auctionData)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Product and auction listed successfully!';
          this.scheduleStatusUpdate(productId, this.product.endDate); // Schedule status update
          this.router.navigate(['/upload-image'])
            .then(() => console.log('Redirecting to image upload'))
            .catch(err => console.error('Navigation failed:', err));
        },
        error: (error) => {
          this.errorMessage = 'Failed to list auction. Please try again.';
          console.error('Error occurred during auction creation:', error);
          alert(this.errorMessage);
        }
      });
  }

  scheduleStatusUpdate(productId: number, endDate: string): void {
    const endDateTime = new Date(endDate).getTime();
    const currentDateTime = new Date().getTime();
    const timeDifference = endDateTime - currentDateTime;

    if (timeDifference > 0) {
      setTimeout(() => {
        this.updateProductStatus(productId);
      }, timeDifference);
    } else {
      this.updateProductStatus(productId);
    }
  }

  updateProductStatus(productId: number): void {
    this.product.status = 'Inactive';

    this.http.patch(`https://localhost:44385/api/Product/${productId}`, { status: this.product.status })
      .subscribe({
        next: (response) => {
          console.log('Product status updated successfully', response);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update product status. Please try again.';
          console.error('Error occurred during product status update:', error);
          alert(this.errorMessage);
        }
      });
  }

  private validateForm(): boolean {
    if (this.product.sellerID === 0) {
      this.errorMessage = 'Please log in to sell products';
      return false;
    }
    if (!this.product.title.trim()) {
      this.errorMessage = 'Product title is required';
      return false;
    }
    if (!this.product.description.trim()) {
      this.errorMessage = 'Product description is required';
      return false;
    }
    if (this.product.startPrice <= 0) {
      this.errorMessage = 'Starting price must be greater than 0';
      return false;
    }
    if (!this.product.category) {
      this.errorMessage = 'Please select a category';
      return false;
    }
    if (!this.product.endDate) {
      this.errorMessage = 'End date is required';
      return false;
    }
    return true;
  }

  private resetForm(): void {
    const currentSellerId = this.product.sellerID;
    this.product = {
      productId: 0,
      sellerID: currentSellerId,
      title: '',
      description: '',
      startPrice: 0,
      category: '',
      status: 'Available',
      endDate: '' // Reset endDate
    };
  }
}
