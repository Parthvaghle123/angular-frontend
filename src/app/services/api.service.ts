 import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://backend-l22j.onrender.com';
  
  // For real-time updates across components
  private refreshDataSubject = new Subject<void>();
  refreshData$ = this.refreshDataSubject.asObservable();

  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  triggerRefresh() {
    this.refreshDataSubject.next();
  }

  private getHeaders(isAdmin: boolean = false): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = isAdmin 
        ? localStorage.getItem('adminToken') || ''
        : localStorage.getItem('token') || '';
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  get<T>(endpoint: string, isAdmin: boolean = false): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(isAdmin)
    });
  }

  post<T>(endpoint: string, data: any, isAdmin: boolean = false): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(isAdmin)
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  put<T>(endpoint: string, data: any, isAdmin: boolean = false): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(isAdmin)
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  patch<T>(endpoint: string, data: any, isAdmin: boolean = false): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(isAdmin)
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }

  delete<T>(endpoint: string, isAdmin: boolean = false): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(isAdmin)
    }).pipe(
      tap(() => this.triggerRefresh())
    );
  }
}
