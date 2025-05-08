import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { from } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import JSZip from 'jszip';
 
@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'https://localhost:44385/api/Product';
 
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}
 
  fetchProductImages(productId: number): Observable<SafeUrl[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/zip'
    });
 
    return this.http.get(`${this.apiUrl}/${productId}/downloadImages`, {
      headers,
      responseType: 'arraybuffer'
    }).pipe(
      switchMap(async (data) => {
        const images = await this.processZipFile(data);
        return images || [];
      }),
      catchError(error => {
        console.error('Error fetching images:', error);
        return throwError(() => error);
      })
    );
  }
 
  fetchProductImage(productId: number): Observable<ArrayBuffer> {
    const headers = new HttpHeaders({
      'Accept': 'application/zip'
    });
 
    return this.http.get(`${this.apiUrl}/${productId}/downloadImages`, {
      headers,
      responseType: 'arraybuffer',
      observe: 'response'
    }).pipe(
      map(response => response.body as ArrayBuffer),
      catchError(error => {
        console.error('Error fetching image:', error);
        return throwError(() => error);
      })
    );
  }
 
  async processZipFile(arrayBuffer: ArrayBuffer): Promise<SafeUrl[]> {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(arrayBuffer);
      const images: SafeUrl[] = [];
 
      for (const filename of Object.keys(contents.files)) {
        const file = contents.files[filename];
        if (!file.dir && this.isImageFile(file.name)) {
          const blob = await file.async('blob');
          const imageUrl = URL.createObjectURL(blob);
          images.push(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
        }
      }
 
      return images;
    } catch (error) {
      console.error('Error processing ZIP:', error);
      return [];
    }
  }
 
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'jfif'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? imageExtensions.includes(extension) : false;
  }
}
 