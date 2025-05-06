import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Services/auth.service';

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
export class AuctionListComponent implements OnInit {
  auctions: Product[] = [];
  private apiUrl = 'https://localhost:44385/api/Product';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchAuctions();
  }

  fetchAuctions(): void {
    this.http.get<Product[]>(this.apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).subscribe({
      next: (data) => {
        this.auctions = data;
        console.log('Fetched auctions:', this.auctions);
      },
      error: (error) => {
        console.error('Error fetching auctions:', error);
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

