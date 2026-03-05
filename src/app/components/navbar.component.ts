import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  username: string = '';
  searchText: string = '';
  faMagnifyingGlass = faMagnifyingGlass;
  shouldHideNavbar: boolean = false;
  private platformId = inject(PLATFORM_ID);

  private hideNavbarPaths = ["/order-success"];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authService.username$.subscribe(name => {
      this.username = name;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.shouldHideNavbar = this.hideNavbarPaths.includes(event.urlAfterRedirects);
    });
  }

  handleSearchSubmit(e?: Event) {
    if (e) e.preventDefault();
    if (this.searchText.trim() !== "") {
      const currentPath = this.router.url.split('?')[0];
      this.router.navigate([currentPath], { queryParams: { q: this.searchText } });
    }
  }

  onSearchChange() {
    if (this.searchText.trim() === "") {
      const currentPath = this.router.url.split('?')[0];
      this.router.navigate([currentPath]);
    }
  }

  async handleLogout() {
    try {
      if (isPlatformBrowser(this.platformId)) {
        const token = localStorage.getItem('token');
        if (token) {
          await this.http.post('http://localhost:3001/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
          }).toPromise();
        }
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      this.authService.logout();
      this.router.navigate(['/home']);
    }
  }
}
