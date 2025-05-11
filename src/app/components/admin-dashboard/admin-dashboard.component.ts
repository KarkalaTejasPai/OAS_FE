import { Component,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

interface DashboardStats {
  totalUsers: number;
  totalAuctions: number;
  totalRevenue: number;
  reportCount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  totalUsers: number = 0;
  totalAuctions: number = 0;
  recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Buyer', joined: '2023-10-01', status: 'Active' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'Seller', joined: '2023-09-28', status: 'Active' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'Buyer', joined: '2023-09-25', status: 'Pending' }
  ];

  recentAuctions = [
    { id: 1, title: 'Antique Desk', seller: 'Sarah S.', currentBid: 800, bids: 6, endDate: '2023-10-25', status: 'Active' },
    { id: 2, title: 'Luxury Watch', seller: 'Robert J.', currentBid: 1250, bids: 3, endDate: '2023-10-15', status: 'Active' },
    { id: 3, title: 'Vintage Camera', seller: 'Emily L.', currentBid: 350, bids: 12, endDate: '2023-09-28', status: 'Completed' }
  ];
  
  private baseUrl = 'https://localhost:44385/api';
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTotalUsers();
    this.fetchTotalAuctions();
  }

  private fetchTotalUsers() {
    this.http.get<number>(`${this.baseUrl}/User/UsersCount`)
      .subscribe({
        next: (count) => {
          this.totalUsers = count;
        },
        error: (error) => console.error('Error fetching total users:', error)
      });
  }

  private fetchTotalAuctions() {
    this.http.get<number>(`${this.baseUrl}/Auction/AuctionsCount`)
      .subscribe({
        next: (count) => {
          this.totalAuctions = count;
        },
        error: (error) => console.error('Error fetching total auctions:', error)
      });
  }
}