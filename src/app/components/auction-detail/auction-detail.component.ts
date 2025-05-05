import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './auction-detail.component.html',
  styleUrls: ['./auction-detail.component.css']
})
export class AuctionDetailComponent {
  auction = {
    id: 1,
    title: 'Vintage Pocket Watch',
    description: 'Rare gold-plated pocket watch from the 1920s. This exquisite timepiece features intricate engravings and is in excellent working condition. The watch comes with its original chain and the original box is included. This is a rare collector\'s item with historical significance.',
    currentBid: 450,
    startingBid: 200,
    incrementAmount: 25,
    bids: 8,
    watchers: 24,
    endDate: 'October 15, 2023 15:30:00',
    timeLeft: '1d 5h 23m',
    seller: {
      name: 'John Smith',
      rating: 4.8,
      reviews: 56,
      memberSince: 'March 2020'
    },
    condition: 'Excellent',
    location: 'New York, NY',
    shipping: 'Worldwide',
    shippingCost: 15,
    returnsAccepted: true,
    category: 'Antiques',
    images: [
      'https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/691640/pexels-photo-691640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    bidHistory: [
      { bidder: 'user123', amount: 450, time: '4 hours ago' },
      { bidder: 'collector78', amount: 425, time: '6 hours ago' },
      { bidder: 'vintage_lover', amount: 400, time: '8 hours ago' },
      { bidder: 'timeless55', amount: 375, time: '10 hours ago' },
      { bidder: 'collectibles22', amount: 350, time: '12 hours ago' }
    ]
  };

  selectedImage = this.auction.images[0];

  selectImage(image: string) {
    this.selectedImage = image;
  }
}