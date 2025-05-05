import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.css']
})
export class BuyerDashboardComponent {
  recentBids = [
    { id: 1, item: 'Vintage Watch', bid: 250, date: '2023-10-05', status: 'Leading' },
    { id: 2, item: 'Art Painting', bid: 1200, date: '2023-10-04', status: 'Outbid' },
    { id: 3, item: 'Gaming Console', bid: 450, date: '2023-10-01', status: 'Won' },
  ];

  watchlist = [
    { id: 1, title: 'Antique Desk', currentBid: 800, endTime: '23h 15m left', image: 'https://images.pexels.com/photos/172296/pexels-photo-172296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 2, title: 'Collectible Coins', currentBid: 350, endTime: '2d 4h left', image: 'https://images.pexels.com/photos/2166456/pexels-photo-2166456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 3, title: 'Vintage Camera', currentBid: 125, endTime: '8h 30m left', image: 'https://images.pexels.com/photos/821736/pexels-photo-821736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
  ];
}