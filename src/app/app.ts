import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component';
import { AdminNavbarComponent } from './components/admin-navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, AdminNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showUserNavbar = false;
  showAdminNavbar = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        const url = event.urlAfterRedirects.split('?')[0];

        // Paths where USER navbar should be hidden
        const hideUserNavbarPaths = [
          '/login',
          '/register',
          '/changepassword',
          '/checkout',
          '/order-success'
        ];

        const isAdminPath = url.startsWith('/admin');
        const isAdminLogin = url === '/admin/login';
        const isAdminRoot = url === '/admin';

        /* ==========================
           NAVBAR VISIBILITY LOGIC
        =========================== */

        // Admin Navbar
        this.showAdminNavbar =
          isAdminPath && !isAdminLogin && !isAdminRoot;

        // User Navbar
        this.showUserNavbar =
          !isAdminPath && !hideUserNavbarPaths.includes(url);
      });
  }
}
