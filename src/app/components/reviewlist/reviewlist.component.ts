import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

interface Review {
  reviewId: number;
  reviewerId: number;
  targetUserId: number;
  rating: number;
  comment: string;
  date: Date;
}

@Component({
  selector: 'reviewlist',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './reviewlist.component.html',
  styleUrls: ['./reviewlist.component.css']
})
export class ReviewListComponent implements OnInit {
  reviews: Review[] = [];
  errorMessage: string = '';
  userId: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      this.userId = Number(loggedInUserId);
      this.fetchReviews();
    } else {
      this.errorMessage = 'Please login to view reviews';
    }
  }

  private fetchReviews(): void {
    this.http.get<Review[]>(`https://localhost:44385/api/Review/users/${this.userId}`)
      .subscribe({
        next: (response) => {
          this.reviews = response;
          console.log('Reviews loaded:', this.reviews);
        },
        error: (error) => {
          console.error('Error fetching reviews:', error);
          this.errorMessage = 'Failed to load reviews. Please try again later.';
        }
      });
  }
}
