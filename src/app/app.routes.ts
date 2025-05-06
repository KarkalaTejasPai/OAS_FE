import { Routes } from "@angular/router";

// Import all components
import { LoginComponent } from "./components/login/login.component";
import { UserRegisterComponent } from "./components/user-register/user-register.component";
import { BuyerDashboardComponent } from "./components/buyer-dashboard/buyer-dashboard.component";
import { SellerDashboardComponent } from "./components/seller-dashboard/seller-dashboard.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { AuctionListComponent } from "./components/auction-list/auction-list.component";
import { AuctionDetailComponent } from "./components/auction-detail/auction-detail.component";
import { HomeComponent } from "./components/home/home.component";
import { SellProductComponent } from "./sell-product/sell-product.component";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: UserRegisterComponent },
  { path: "app-buyer-dashboard", component: BuyerDashboardComponent },
  { path: "seller-dashboard", component: SellerDashboardComponent },
  { path: "admin-dashboard", component: AdminDashboardComponent },
  { path: "auction-list", component: AuctionListComponent },
  { path: "auction-detail", component: AuctionDetailComponent },
  {
    path: "auction-detail",
    component: AuctionDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: "auction-detail",
    component: AuctionDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: "sell-product",
    component: SellProductComponent,
    canActivate: [authGuard]
  },
  { path: "", component: HomeComponent }
  // { path: 'create-auction', component: CreateAuctionComponent },
  // { path: 'payment', component: PaymentComponent },
  // { path: 'transaction-history', component: TransactionHistoryComponent },
  // { path: 'submit-review', component: SubmitReviewComponent },
  // { path: 'review-list', component: ReviewListComponent }
];
