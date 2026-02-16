import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redirect-loader.component.html',
  styleUrls: ['./redirect-loader.component.css']
})
export class RedirectLoaderComponent implements OnInit, OnDestroy {
  @Input() seconds: number = 3;
  @Input() redirectUrl: string = '/';
  @Input() title: string = 'Welcome back!';
  @Input() message: string = "You're signed in. Taking you to the Starbucks Website.";
  count: number = 3;
  private timer: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize count with the input seconds
    this.count = this.seconds;
    
    // Start countdown immediately with proper change detection
    this.timer = setInterval(() => {
      this.count--;
      this.cdr.detectChanges(); // Force change detection to update the view
      
      if (this.count <= 0) {
        clearInterval(this.timer);
        this.router.navigate([this.redirectUrl]);
      }
    }, 1000);
    
    // Trigger change detection initially
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
