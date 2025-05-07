import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../shared/header/header.component";
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent {
  userId: string = '';
  rating: number = 0;
  comment: string = '';
  stars: number[] = [1, 2, 3, 4, 5];
  errorMessage: string = '';
  successMessage: string = '';
  
  submitReview(): void {
    const review = {
      userId: this.userId,
      rating: this.rating,
      comment: this.comment
    };
  }

  setRating(value: number): void {
    this.rating = value;
  }
}
