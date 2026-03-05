import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      document.title = 'Starbucks';
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}

