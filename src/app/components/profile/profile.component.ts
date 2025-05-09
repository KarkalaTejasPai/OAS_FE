import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  originalUser: any = {};
  isEditing = false;
  private apiUrl = 'https://localhost:44385/api/User';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  getUserDetails(): void {
    const userId = localStorage.getItem('userId');
    console.log('Retrieved userId:', userId);

    if (!userId) {
      console.error("Please login first!");
      return;
    }

    this.http.get(`${this.apiUrl}/${userId}`).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (response) {
          this.user = {
            userId: parseInt(userId),
            name: response.name,
            email: response.email,
            phone: response.contactNumber
          };
          this.originalUser = { ...this.user };
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching user details:', error);
      }
    });
  }

  editProfile(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.user = { ...this.originalUser };
  }

  saveProfile(): void {
    if (!this.user.userId) {
      alert("User ID is missing!");
      return;
    }

    const updatedFields: any = {};
    if (this.user.name !== this.originalUser.name) updatedFields.Name = this.user.name;
    if (this.user.email !== this.originalUser.email) updatedFields.Email = this.user.email;
    if (this.user.phone !== this.originalUser.phone) updatedFields.ContactNumber = this.user.phone;

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes were made.");
      return;
    }

    this.http.patch(`${this.apiUrl}/${this.user.userId}`, updatedFields).subscribe({
      next: () => {
        alert('User details updated successfully!');
        this.isEditing = false;
        this.originalUser = { ...this.user };
      },
      error: (error: HttpErrorResponse) => {
        alert(`Error updating user: ${error.message}`);
      }
    });
  }

  viewAuctions(): void {
    alert('Redirecting to My Auctions...');
  }
}
