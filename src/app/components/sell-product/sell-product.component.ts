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
  productID: number;
  sellerID: number;
  title: string;
  description: string;
  startPrice: number;
  category: string;
  status: string;
}
 
// Update the ProductResponse interface to match the actual API response
interface ProductResponse {
  productID: number;  // Changed back to productID to match API response
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
    productID: 0,
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

    console.log('Sending product data:', this.product); // Debug log

    this.http.post('https://localhost:44385/api/Product', this.product)
      .subscribe({
        next: (response: any) => {
          console.log('Raw API Response:', response);
          console.log('Response type:', typeof response);
          console.log('Response structure:', JSON.stringify(response, null, 2));

          if (response) {
            // Store the product ID (assuming it's in the response)
            const productId = response.productID || response.ProductId || response.productId;
            
            if (productId) {
              localStorage.setItem('currentProductId', productId.toString());
              this.successMessage = 'Product listed successfully!';
              
              // Add a small delay before navigation
              setTimeout(() => {
                this.router.navigate(['/upload-image'])
                  .then(() => console.log('Navigation successful'))
                  .catch(err => {
                    console.error('Navigation failed:', err);
                    this.errorMessage = 'Navigation to upload page failed';
                  });
              }, 100);
            } else {
              this.errorMessage = 'Product ID not found in response';
              console.error('Response missing product ID:', response);
            }
          } else {
            this.errorMessage = 'Invalid response from server';
            console.error('Invalid response:', response);
          }
        },
        error: (error) => {
          console.error('Full error object:', error);
          this.errorMessage = error.message || 'Failed to list product. Please try again.';
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
 
    return true;
  }
 
  private resetForm(): void {
    const currentSellerId = this.product.sellerID;
    this.product = {
      productID: 0,
      sellerID: currentSellerId,
      title: '',
      description: '',
      startPrice: 0,
      category: '',
      status: 'Available'
    };
  }
}