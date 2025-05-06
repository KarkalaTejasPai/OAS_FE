import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../components/Services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../components/shared/header/header.component';
import { FooterComponent } from '../components/shared/footer/footer.component';

interface Product {
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

    this.http.post<any>('https://localhost:44385/api/Product', this.product)
      .subscribe({
        next: (response) => {
          console.log('Product created:', response);
          alert('Product has been added to auction successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating product:', error);
          alert('Failed to add product. Please check the API endpoint and try again.');
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
