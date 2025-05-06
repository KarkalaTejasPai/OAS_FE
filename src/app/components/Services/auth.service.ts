import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface JwtClaims {
  sub: string;  // userId
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;  // role
  exp: number;  // expiration time
}

export interface LoginResponse {
  token: string;
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:44385/api/Auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, formData).pipe(
      tap((response) => {
        if (response.token) {
          // Debug log raw token
          console.log('Raw token:', response.token);
          this.storeUserDetails(response.token);
        }
      })
    );
  }

  private storeUserDetails(token: string): void {
    try {
      const decodedToken = jwtDecode<JwtClaims>(token);
      console.log('Full decoded token:', decodedToken); // Debug full token

      // Map the claims to our storage format
      const userId = decodedToken.sub;
      const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      // Check if required claims exist
      if (!userId || !role) {
        console.error('Missing required claims in token');
        return;
      }

      // Store token and claims
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);
      localStorage.setItem('isLoggedIn', 'true');

      // Verify stored values
      console.log('Stored values:', {
        userId: localStorage.getItem('userId'),
        role: localStorage.getItem('role'),
        isLoggedIn: localStorage.getItem('isLoggedIn')
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      this.clearToken();
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    const userId = localStorage.getItem('userId');
    console.log('Getting userId:', userId); // Debug log
    return userId;
  }

  getUserRole(): string | null {
    const role = localStorage.getItem('role');
    console.log('Getting role:', role); // Debug log
    return role;
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');
  }

  clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  }

  getUserClaims(): Partial<JwtClaims> {
    return {
      sub: localStorage.getItem('userId') || undefined,
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': localStorage.getItem('role') || undefined
    };
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decodedToken = jwtDecode<JwtClaims>(token);
      console.log('Decoded token:', decodedToken);
      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}