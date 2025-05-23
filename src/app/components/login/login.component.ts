import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginResponse } from '../../Services/auth.service';
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
          if (response && response.token) {
            // Store auth data
            localStorage.setItem('token', response.token);
            // localStorage.setItem('role', userRole);
            localStorage.setItem('isLoggedIn', 'true');
            const role=localStorage.getItem('role');
            // Redirect based on role
            if (role  === 'User') {
              this.router.navigate(['/']);
            } else if(role === 'Admin') {
              this.router.navigate(['/admin-dashboard']);
            }
            else{
              console.log('Invalid role:', role);
              this.loginError = 'Invalid role';
            }
          }
        },
        error: (error) => {
          this.loginError = error.error || 'Login failed';
          console.error('Login error:', error);
        }
      });
    }
  }
}
