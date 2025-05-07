import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UploadImageComponent implements OnInit {
  selectedFiles: FileList | null = null;
  message: string = '';
  minRequiredFiles: number = 5;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  productId: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productId = localStorage.getItem('currentProductId');
    if (!this.productId) {
      this.message = 'No product ID found';
      this.router.navigate(['/sell-product']);
    }
  }

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
    if (!this.selectedFiles) {
      this.message = 'No files selected';
      return;
    }

    if (this.selectedFiles.length < this.minRequiredFiles) {
      this.message = `Please select at least ${this.minRequiredFiles} images`;
      return;
    }

    // Validate file sizes
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const filesArray = Array.from(this.selectedFiles);
    const invalidFiles = filesArray.filter(file => file.size > maxFileSize);
    
    if (invalidFiles.length > 0) {
      this.message = 'Some files are too large. Maximum size is 5MB per file.';
      return;
    }
    this.message = '';
  }

  uploadImages(): void {
    if (!this.selectedFiles || !this.productId) {
      this.message = 'Please select files and ensure product ID exists';
      return;
    }

    if (this.selectedFiles.length < this.minRequiredFiles) {
      this.message = `Please select at least ${this.minRequiredFiles} images`;
      return;
    }

    const formData = new FormData();
    const filesArray = Array.from(this.selectedFiles);
    
    filesArray.forEach((file) => {
      formData.append('images', file);
    });

    this.isUploading = true;
    this.uploadProgress = 0;

    this.http.post<any>(
      `https://localhost:44385/api/Product/${this.productId}/uploadImages`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      retry(3),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.error?.includes('being used by another process')) {
            return throwError(() => 'File access error. Please try again in a few moments.');
          }
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.isUploading = false;
      })
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.message = 'Files uploaded successfully!';
          localStorage.removeItem('currentProductId');
          setTimeout(() => {
            this.router.navigate(['/auction-list']);
          }, 2000);
        }
      },
      error: (error) => {
        this.isUploading = false;
        if (typeof error === 'string') {
          this.message = error;
        } else {
          this.message = 'An error occurred while uploading images. Please try again.';
        }
      }
    });
  }

  private resetForm(): void {
    this.selectedFiles = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}