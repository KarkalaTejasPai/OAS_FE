// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, NgForm } from '@angular/forms';
// import { RouterLink, Router } from '@angular/router';
// import { FooterComponent } from '../shared/footer/footer.component';
// import { HttpClient, HttpHeaders } from '@angular/common/http';

// interface LoginResponse {
//   token: string;
//   role: string;
//   userId: number;
// }

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink, FooterComponent],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   username: string = '';
//   password: string = '';
//   loginError: string = '';
//   loginSuccess: string = '';
//   submitted: boolean = false;
//   private apiUrl = 'https://localhost:44385/api/User/login';

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   onSubmit(form: NgForm): void {
//     this.submitted = true;
//     this.loginError = '';
//     this.loginSuccess = '';

//     if (form.valid) {
//       const loginData = {
//         Email: this.username,
//         Password: this.password
//       };

//       const headers = new HttpHeaders()
//         .set('Content-Type', 'application/json');

//       this.http.post<LoginResponse>(this.apiUrl, loginData, { headers })
//         .subscribe({
//           next: (response: LoginResponse) => {
//             if (response.token) {
//               // Store auth data
//               localStorage.setItem('token', response.token);
//               localStorage.setItem('userRole', response.role);
//               localStorage.setItem('userId', response.userId.toString());
//               localStorage.setItem('isLoggedIn', 'true');

//               // Show success message
//               this.loginSuccess = 'Login successful!';
//               alert('Login successful! Welcome back.');

//               // Navigate to dashboard
//               this.router.navigate(['']);
//             }
//           },
//           error: (error) => {
//             if (error.status === 401) {
//               this.loginError = 'Invalid username or password';
//               alert('Login failed: Invalid username or password');
//             } else {
//               this.loginError = 'Login failed. Please try again later.';
//               alert('Login failed. Please try again later.');
//             }
//             console.error('Login error:', error);
//           }
//         });
//     }
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginResponse } from '../Services/auth.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    HttpClientModule,
  ],
  providers: [AuthService]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginError: string = '';
  submitted: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(form: NgForm): void {
    this.submitted = true;
    this.loginError = '';

    if (form.valid) {
      const loginData = {
        username: this.username,
        password: this.password
      };

      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('isLoggedIn', 'true');
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.loginError = error.error || 'Login failed';
        }
      });
    }
  }
}
