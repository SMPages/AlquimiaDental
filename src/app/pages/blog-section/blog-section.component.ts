// src/app/pages/blog-section/blog-section.component.ts
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-blog-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './blog-section.component.html',
  styleUrls: ['./blog-section.component.scss']
})
export class BlogSectionComponent {}
