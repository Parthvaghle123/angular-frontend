import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usernameSubject = new BehaviorSubject<string>('');
  private tokenSubject = new BehaviorSubject<string>('');
  private adminTokenSubject = new BehaviorSubject<string>('');

  username$ = this.usernameSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  adminToken$ = this.adminTokenSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');
      const storedAdminToken = localStorage.getItem('adminToken');

      if (storedToken) this.tokenSubject.next(storedToken);
      if (storedUsername) this.usernameSubject.next(storedUsername);
      if (storedAdminToken) this.adminTokenSubject.next(storedAdminToken);
    }
  }

  setUsername(username: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('username', username);
    }
    this.usernameSubject.next(username);
  }

  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
    this.tokenSubject.next(token);
  }

  setAdminToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminToken', token);
    }
    this.adminTokenSubject.next(token);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    this.tokenSubject.next('');
    this.usernameSubject.next('');
  }

  adminLogout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('adminToken');
    }
    this.adminTokenSubject.next('');
  }

  get isAdmin(): boolean {
    return !!this.adminTokenSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }
}
