import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-success-page">
      <div class="confirm-box">
        <div class="brand">
          <div class="logo-wrap">
            <img src="https://www.starbucks.in/assets/icon/logo.png" alt="Starbucks" class="logo" />
          </div>
          <h2 class="brand-name">STARBUCKS</h2>
        </div>
        <h1 class="title">Confirming your order</h1>
        <p class="subtitle">Just a moment...</p>
        <div class="loader-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <p class="hint">Please don't close this page</p>
        <div class="progress-track">
          <div class="step done">
            <span class="step-icon check">✓</span>
            <span class="step-label">ORDER RECEIVED</span>
          </div>
          <div class="step-connector"></div>
          <div class="step active">
            <span class="step-icon circle"></span>
            <span class="step-label">CONFIRMING</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-success-page {
      min-height: 100vh;
      background-color: #e8f7f2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      box-sizing: border-box;
    }
    .confirm-box {
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      padding: 2.5rem 3rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
    }
    .brand {
      margin-bottom: 1.5rem;
    }
    .logo-wrap {
      width: 64px;
      height: 64px;
      margin: 0 auto 0.5rem;
      border: 2px solid #00704a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #fff;
    }
    .logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
    }
    .brand-name {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #000;
      margin: 0;
    }
    .title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #3a5749;
      margin: 0 0 0.25rem;
    }
    .subtitle {
      font-size: 0.95rem;
      color: #8f8f8f;
      margin: 0 0 1.5rem;
    }
    .loader-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 1rem;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #00704a;
      animation: pulse 1.2s ease-in-out infinite;
    }
    .dot:nth-child(1) { animation-delay: 0s; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1); }
    }
    .hint {
      font-size: 0.85rem;
      color: #8f8f8f;
      margin: 0 0 2rem;
    }
    .progress-track {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .step.done .step-icon.check {
      color: #00704a;
      font-size: 0.9rem;
      font-weight: bold;
    }
    .step.active .step-icon.circle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #00704a;
    }
    .step-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #00704a;
    }
    .step-connector {
      width: 40px;
      height: 0;
      border-bottom: 2px dashed #c5d5d0;
      margin: 0 4px 4px;
    }
  `]
})
export class OrderSuccessComponent implements OnInit, OnDestroy {
  private timer: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.timer = setInterval(() => {
      clearInterval(this.timer);
      this.router.navigate(['/orders']);
    }, 3000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
