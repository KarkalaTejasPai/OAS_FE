import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface User {
  Name: string;
  Password: string;
  Email: string;
  Role: string;
  ContactNumber: string;
}

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [RouterLink, FooterComponent, CommonModule, FormsModule],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent {
  username: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  confirmPassword: string = '';
  submitted: boolean = false;
  private apiUrl = 'https://localhost:44385/api/User';

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm): void {
    this.submitted = true;

    if (form.valid && this.password === this.confirmPassword) {
      this.checkPhoneNumberExists(this.phone, form);
    }
  }

  checkPhoneNumberExists(phone: string, form: NgForm): void {
    const url = `${this.apiUrl}/CheckPhoneNumber?phone=${phone}`;
  
    this.http.get<boolean>(url).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          alert('User already exists!!');
        } else {
          this.submitRegistration(form);
        }
      },
      error: (error) => {
        if (error.status === 400) {
          alert('Invalid phone number format.');
        } else if (error.status === 500) {
          alert('Server error! Please try again later.');
        } else {
          alert('Something went wrong. Please check your connection.');
        }
        console.error('Error checking phone number:', error);
      }
    });
  }
  

  submitRegistration(form: NgForm): void {
    const userData: User = {
      Name: this.username,
      Email: this.email,
      ContactNumber: this.phone,
      Password: this.password,
      Role: 'User'
    };

    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http.post<boolean>(this.apiUrl, userData, { headers })
      .subscribe({
        next: (response: boolean) => {
          if (response) {
            alert('User registered successfully!');
            form.resetForm();
            this.submitted = false;
          } else {
            alert('Registration failed. Please try again.');
          }
        },
        error: (error) => {
          if (error.status === 400) {
            alert(error.error || 'Username or email already exists.');
          } else {
            alert('Registration failed. Please try again later.');
          }
          console.error('Registration error:', error);
        }
      });
  }

  validatePassword(): boolean {
    return this.password === this.confirmPassword;
  }
}
