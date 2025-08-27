// src/app/pages/about-section/about-section.component.ts
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss']
})
export class AboutSectionComponent {}
