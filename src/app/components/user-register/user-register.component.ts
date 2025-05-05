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
      const userData: User = {
        Name: this.username,
        Email: this.email,
        ContactNumber: this.phone,
        Password: this.password,
        Role: 'User'
      };

      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json');

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
  }

  validatePassword(): boolean {
    return this.password === this.confirmPassword;
  }
}