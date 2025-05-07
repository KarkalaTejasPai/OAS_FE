import { Routes } from "@angular/router";

import { LoginComponent } from "./components/login/login.component";
import { UserRegisterComponent } from "./components/user-register/user-register.component";
import { BuyerDashboardComponent } from "./components/buyer-dashboard/buyer-dashboard.component";
import { SellerDashboardComponent } from "./components/seller-dashboard/seller-dashboard.component";
import { AdminDashboardComponent } from "./components/admin-dashboard/admin-dashboard.component";
import { AuctionListComponent } from "./components/auction-list/auction-list.component";
import { AuctionDetailComponent } from "./components/auction-detail/auction-detail.component";
import { HomeComponent } from "./components/home/home.component";
import { SellProductComponent } from "./components/sell-product/sell-product.component";
import { authGuard } from "./guards/auth.guard";
import { UploadImageComponent } from "../app/upload-image/upload-image.component";
import { ReviewComponent } from "./components/review/review.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: UserRegisterComponent },
  { path: "app-buyer-dashboard", component: BuyerDashboardComponent },
  { path: "seller-dashboard", component: SellerDashboardComponent },
  { path: "admin-dashboard", component: AdminDashboardComponent },
  { path: "auction-list", component: AuctionListComponent },
  { path: "review", component: ReviewComponent },
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
  {
    path: "upload-image",
    component: UploadImageComponent
  },
  { path: "", component: HomeComponent },

  // { path: 'create-auction', component: CreateAuctionComponent },
  // { path: 'payment', component: PaymentComponent },
  // { path: 'transaction-history', component: TransactionHistoryComponent },
  // { path: 'submit-review', component: SubmitReviewComponent },
  // { path: 'review-list', component: ReviewListComponent }
];
