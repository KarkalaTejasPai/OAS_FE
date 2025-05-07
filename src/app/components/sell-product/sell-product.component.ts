import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
}
 
// Update the ProductResponse interface to match the actual API response
interface ProductResponse {
  productID: number;  // Changed to match API response format (uppercase ID)
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
    status: 'Available'
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
 
    this.http.post<ProductResponse>('https://localhost:44385/api/Product', this.product)
      .subscribe({
        next: (response) => {
          this.processResponse(response);
        },
        error: (error) => {
          this.errorMessage = 'Failed to list product. Please try again.';
          console.error('Error occurred during product creation:', error);
          alert(this.errorMessage);
        }
      });
  }

  processResponse(response: any) {
    console.log('Received response:', response);
    
    // Check for both camelCase and PascalCase variations
    const productId = response?.productId || response?.productID;
    
    if (productId === undefined || typeof productId !== 'number') {
      console.error('Invalid response format:', response);
      this.errorMessage = 'Invalid response format received from server';
      alert('An error occurred while processing the response. Please try again.');
      return;
    }

    console.log('Valid product ID:', productId);
    localStorage.setItem('currentProductId', productId.toString());
    this.successMessage = 'Product listed successfully!';
    this.router.navigate(['/upload-image'])
      .then(() => console.log('Redirecting to image upload'))
      .catch(err => console.error('Navigation failed:', err));
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
      status: 'Available'
    };
  }
}