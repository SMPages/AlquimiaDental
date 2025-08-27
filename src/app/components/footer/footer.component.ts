import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
