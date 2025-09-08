import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LoginService } from '../../backend/login.service';

@Component({
  standalone: true,
  selector: 'app-dash-admin',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
  templateUrl: './dash-admin.component.html',
  styleUrls: ['./dash-admin.component.scss'],
})
export class DashAdminComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(LoginService);

  sidebarOpen = signal(true);

  get lang(): string {
    return this.route.snapshot.paramMap.get('lang')
        || this.route.parent?.snapshot.paramMap.get('lang')
        || 'es';
  }

  toggleSidebar() { this.sidebarOpen.set(!this.sidebarOpen()); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/', this.lang, 'login']);
  }
}
