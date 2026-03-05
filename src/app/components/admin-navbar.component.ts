import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faShoppingCart,
  faBoxes,
  faSignOutAlt,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  faTachometerAlt = faTachometerAlt;
  faUsers = faUsers;
  faShoppingCart = faShoppingCart;
  faBoxes = faBoxes;
  faSignOutAlt = faSignOutAlt;
  faBars = faBars;

  constructor(private authService: AuthService, private router: Router) {}

  handleLogout() {
    this.authService.adminLogout();
    this.router.navigate(['/admin/login']);
  }
}
