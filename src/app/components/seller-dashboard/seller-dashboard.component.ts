import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent {
  activeAuctions = [
    { id: 1, title: 'Antique Desk', startingBid: 500, currentBid: 800, bids: 6, endDate: '2023-10-25', status: 'Active' },
    { id: 2, title: 'Luxury Watch', startingBid: 1000, currentBid: 1250, bids: 3, endDate: '2023-10-15', status: 'Active' },
    { id: 3, title: 'Vintage Vinyl Records', startingBid: 100, currentBid: 180, bids: 8, endDate: '2023-10-10', status: 'Ending Soon' }
  ];

  recentSales = [
    { id: 1, title: 'Vintage Camera', finalPrice: 350, buyer: 'John D.', date: '2023-09-28', status: 'Completed' },
    { id: 2, title: 'Art Painting', finalPrice: 1200, buyer: 'Sarah M.', date: '2023-09-20', status: 'Shipped' }
  ];
}