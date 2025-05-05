import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css']
})
export class AuctionListComponent {
  auctions = [
    { id: 1, title: 'Vintage Pocket Watch', description: 'Rare gold-plated pocket watch from 1920s', currentBid: 450, bids: 8, endTime: '1d 5h left', image: 'https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Antiques' },
    { id: 2, title: 'Modern Art Painting', description: 'Original artwork by contemporary artist', currentBid: 1200, bids: 12, endTime: '5h 20m left', image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Art' },
    { id: 3, title: 'Gaming Console Bundle', description: 'Latest gaming console with 3 games included', currentBid: 380, bids: 5, endTime: '2d 12h left', image: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Electronics' },
    { id: 4, title: 'Antique Wooden Desk', description: 'Beautifully preserved oak desk from the Victorian era', currentBid: 850, bids: 4, endTime: '3d 8h left', image: 'https://images.pexels.com/photos/5668774/pexels-photo-5668774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Furniture' },
    { id: 5, title: 'Rare Coin Collection', description: 'Set of rare coins from the early 20th century', currentBid: 650, bids: 9, endTime: '1d 2h left', image: 'https://images.pexels.com/photos/7414194/pexels-photo-7414194.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Collectibles' },
    { id: 6, title: 'Vintage Camera', description: 'Classic film camera in excellent working condition', currentBid: 320, bids: 6, endTime: '12h 40m left', image: 'https://images.pexels.com/photos/3508546/pexels-photo-3508546.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', category: 'Electronics' }
  ];

  categories = [
    'All Categories', 'Art', 'Antiques', 'Electronics', 'Collectibles', 'Furniture', 'Jewelry', 'Vehicles'
  ];

  selectedCategory = 'All Categories';
}