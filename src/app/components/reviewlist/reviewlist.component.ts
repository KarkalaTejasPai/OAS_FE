import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, Location } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

interface Review {
  reviewID: number;
  userID: number;
  targetUserID: number;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'reviewlist',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './reviewlist.component.html',
  styleUrls: [
    './reviewlist.component.css',
    '../../../../node_modules/@fortawesome/fontawesome-free/css/all.min.css'
  ]
})
export class ReviewListComponent implements OnInit {
  reviews: Review[] = [];
  errorMessage: string = '';
  userId: number = 0;

  constructor(
    private http: HttpClient,
    private location: Location
  ) {}

  ngOnInit(): void {
    const loggedInUserId = localStorage.getItem('userId');
    console.log('Retrieved userId from localStorage:', loggedInUserId); // Debug log
    
    if (loggedInUserId) {
      this.userId = Number(loggedInUserId);
      this.fetchReviews();
    } else {
      this.errorMessage = 'Please login to view reviews';
    }
  }

  private fetchReviews(): void {
    console.log('Fetching reviews for userId:', this.userId); // Debug log
    
    this.http.get<Review[]>(`https://localhost:44385/api/Review/users/${this.userId}`)
      .subscribe({
        next: (response) => {
          this.reviews = response;
          console.log('Reviews loaded:', this.reviews); // Debug log to see the data
        },
        error: (error) => {
          console.error('Error fetching reviews:', error);
          this.errorMessage = 'Failed to load reviews. Please try again later.';
        }
      });
  }

  goBack(): void {
    this.location.back();
  }
}
