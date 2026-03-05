import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent {
  products: Product[] = [
    { id: 0, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100501.jpg", title: "Bestseller" },
    { id: 1, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/103973.jpg", title: "Drinks" },
    { id: 2, image: "https://starbucksstatic.cognizantorderserv.com/Category/Small/Food.jpg", title: "Food" },
    { id: 3, image: "https://starbucksstatic.cognizantorderserv.com/Category/Small/Merchandise.jpg", title: "Merchandise" },
    { id: 4, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/104108.jpg", title: "Cheese Toast" },
    { id: 5, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/116858.png", title: "Chicken Sandwich" }
  ];
}
