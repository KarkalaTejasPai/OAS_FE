import { Component } from '@angular/core';
import { HeaderComponent } from '../components/shared/header/header.component';
import { FooterComponent } from '../components/shared/footer/footer.component';

@Component({
  selector: 'app-sell-product',
  imports: [HeaderComponent,FooterComponent],
  templateUrl: './sell-product.component.html',
  styleUrl: './sell-product.component.css'
})
export class SellProductComponent {

}
