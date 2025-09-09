import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

// Mantén tu import según tu estructura
import { LoginService } from '../../core/auth/login.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(LoginService);

  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }

  /** Obtiene el :lang actual (fallback a 'es') */
  private getLang(): string {
    return (
      this.route.snapshot.paramMap.get('lang') ||
      this.route.parent?.snapshot.paramMap.get('lang') ||
      'es'
    );
  }

  /** Asegura que la URL tenga el prefijo /:lang */
  private normalizeUrlWithLang(url: string, lang: string): string {
    if (!url) return `/${lang}`;
    // Evita tocar URLs absolutas externas
    if (/^https?:\/\//i.test(url)) return url;
    // Ya trae el lang
    if (url.startsWith(`/${lang}/`) || url === `/${lang}`) return url;
    // Si empieza con '/', antepone /:lang
    if (url.startsWith('/')) return `/${lang}${url}`;
    // Caso relativo: inserta /:lang/ al inicio
    return `/${lang}/${url}`;
  }

  async onSubmit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password, remember } = this.form.value;

    try {
      await this.auth.login(email!, password!);

      // (Opcional) manejo de remember/sessionStorage

      const lang = this.getLang();
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

      if (returnUrl) {
        const safe = this.normalizeUrlWithLang(returnUrl, lang);
        this.router.navigateByUrl(safe);
      } else {
        // ✅ destino por defecto al dashboard admin con idioma
        this.router.navigate(['/', lang, 'auth', 'dash-admin']);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'No fue posible iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}
