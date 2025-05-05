import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {

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
  
}