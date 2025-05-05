import { Routes } from "@angular/router";

// Import all components
import { LoginComponent } from "./app/components/login/login.component";
import { UserRegisterComponent } from "./app/components/user-register/user-register.component";
import { BuyerDashboardComponent } from "./app/components/buyer-dashboard/buyer-dashboard.component";
import { SellerDashboardComponent } from "./app/components/seller-dashboard/seller-dashboard.component";
import { AdminDashboardComponent } from "./app/components/admin-dashboard/admin-dashboard.component";
import { AuctionListComponent } from "./app/components/auction-list/auction-list.component";
import { AuctionDetailComponent } from "./app/components/auction-detail/auction-detail.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: UserRegisterComponent },
  { path: "", component: BuyerDashboardComponent },
  { path: "seller-dashboard", component: SellerDashboardComponent },
  { path: "admin-dashboard", component: AdminDashboardComponent },
  { path: "auction-list", component: AuctionListComponent },
  { path: "auction-detail", component: AuctionDetailComponent },
  // { path: 'create-auction', component: CreateAuctionComponent },
  // { path: 'payment', component: PaymentComponent },
  // { path: 'transaction-history', component: TransactionHistoryComponent },
  // { path: 'submit-review', component: SubmitReviewComponent },
  // { path: 'review-list', component: ReviewListComponent }
];
