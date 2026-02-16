import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { MenuComponent } from './pages/menu.component';
import { GiftComponent } from './pages/gift.component';
import { CartComponent } from './pages/cart.component';
import { CheckoutComponent } from './pages/checkout.component';
import { ChangePasswordComponent } from './pages/change-password.component';
import { OrderSuccessComponent } from './pages/order-success.component';
import { OrderComponent } from './pages/order.component';
import { ItemComponent } from './pages/item.component';
import { AdminLoginComponent } from './pages/admin/admin-login.component';
import { DashboardComponent } from './pages/admin/dashboard.component';
import { UsersComponent } from './pages/admin/users.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders.component';
import { AdminProductsComponent } from './pages/admin/admin-products.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'gift', component: GiftComponent },
  { path: 'cart', component: CartComponent},
  { path: 'checkout', component: CheckoutComponent},
  { path: 'changepassword', component: ChangePasswordComponent},
  { path: 'order-success', component: OrderSuccessComponent},
  { path: 'orders', component: OrderComponent},
  { path: 'items', component: ItemComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminLoginComponent },

  { 
    path: 'admin', 
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'products', component: AdminProductsComponent },
    ]
  }
];
