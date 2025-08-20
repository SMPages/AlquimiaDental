import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { TranslatePipe } from "../../pipes/translate.pipe"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Hero Section -->
    <section id="home" class="hero-section marble-bg">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title fade-in-up">{{ 'hero.title' | translate }}</h1>
            <p class="hero-subtitle fade-in-up">{{ 'hero.subtitle' | translate }}</p>
            <p class="hero-description fade-in-up">{{ 'hero.description' | translate }}</p>
            <div class="hero-buttons fade-in-up">
              <a href="#contact" class="btn btn-primary">{{ 'hero.cta' | translate }}</a>
              <a href="#services" class="btn btn-secondary">{{ 'hero.cta_secondary' | translate }}</a>
            </div>
          </div>
          <div class="hero-image">
            <img src="/assets/images/elegant-dental-doctor.png" alt="Dra. Sorany Díaz P." />
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section">
      <div class="container">
        <div class="section-header text-center mb-8">
          <h2>{{ 'about.title' | translate }}</h2>
          <p class="section-subtitle">{{ 'about.subtitle' | translate }}</p>
        </div>
        
        <div class="about-content grid grid-2">
          <div class="about-text">
            <p>{{ 'about.description' | translate }}</p>
            
            <div class="stats-grid grid grid-2">
              <div class="stat-item">
                <h3>15+</h3>
                <p>{{ 'about.experience' | translate }}</p>
              </div>
              <div class="stat-item">
                <h3>5,000+</h3>
                <p>{{ 'about.patients' | translate }}</p>
              </div>
              <div class="stat-item">
                <h3>10,000+</h3>
                <p>{{ 'about.procedures' | translate }}</p>
              </div>
              <div class="stat-item">
                <h3>20+</h3>
                <p>{{ 'about.certifications' | translate }}</p>
              </div>
            </div>
          </div>
          
          <div class="about-image">
            <img src="/assets/images/doctor-profile.jpg" alt="Dra. Sorany Díaz P." />
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="section marble-bg">
      <div class="container">
        <div class="section-header text-center mb-8">
          <h2>{{ 'services.title' | translate }}</h2>
          <p class="section-subtitle">{{ 'services.subtitle' | translate }}</p>
        </div>
        
        <div class="services-grid grid grid-4">
          <div class="service-card">
            <div class="service-icon">
              <img src="/assets/icons/aesthetic-dentistry.svg" alt="Aesthetic Dentistry" />
            </div>
            <h3>{{ 'services.aesthetic.title' | translate }}</h3>
            <p>{{ 'services.aesthetic.description' | translate }}</p>
          </div>
          
          <div class="service-card">
            <div class="service-icon">
              <img src="/assets/icons/oral-rehabilitation.svg" alt="Oral Rehabilitation" />
            </div>
            <h3>{{ 'services.rehabilitation.title' | translate }}</h3>
            <p>{{ 'services.rehabilitation.description' | translate }}</p>
          </div>
          
          <div class="service-card">
            <div class="service-icon">
              <img src="/assets/icons/dental-implants.svg" alt="Dental Implants" />
            </div>
            <h3>{{ 'services.implants.title' | translate }}</h3>
            <p>{{ 'services.implants.description' | translate }}</p>
          </div>
          
          <div class="service-card">
            <div class="service-icon">
              <img src="/assets/icons/orthodontics.svg" alt="Orthodontics" />
            </div>
            <h3>{{ 'services.orthodontics.title' | translate }}</h3>
            <p>{{ 'services.orthodontics.description' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section id="testimonials" class="section">
      <div class="container">
        <div class="section-header text-center mb-8">
          <h2>{{ 'testimonials.title' | translate }}</h2>
          <p class="section-subtitle">{{ 'testimonials.subtitle' | translate }}</p>
        </div>
        
        <div class="testimonials-grid grid grid-3">
          <div class="testimonial-card">
            <p>"{{ 'testimonials.testimonial1.text' | translate }}"</p>
            <div class="testimonial-author">
              <strong>{{ 'testimonials.testimonial1.author' | translate }}</strong>
              <span>{{ 'testimonials.testimonial1.location' | translate }}</span>
            </div>
          </div>
          
          <div class="testimonial-card">
            <p>"{{ 'testimonials.testimonial2.text' | translate }}"</p>
            <div class="testimonial-author">
              <strong>{{ 'testimonials.testimonial2.author' | translate }}</strong>
              <span>{{ 'testimonials.testimonial2.location' | translate }}</span>
            </div>
          </div>
          
          <div class="testimonial-card">
            <p>"{{ 'testimonials.testimonial3.text' | translate }}"</p>
            <div class="testimonial-author">
              <strong>{{ 'testimonials.testimonial3.author' | translate }}</strong>
              <span>{{ 'testimonials.testimonial3.location' | translate }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section marble-bg">
      <div class="container">
        <div class="section-header text-center mb-8">
          <h2>{{ 'contact.title' | translate }}</h2>
          <p class="section-subtitle">{{ 'contact.subtitle' | translate }}</p>
        </div>
        
        <div class="contact-content grid grid-2">
          <div class="contact-info">
            <div class="contact-item">
              <h4>{{ 'contact.address' | translate }}</h4>
              <p>Av. Winston Churchill #47, Piantini<br>Santo Domingo, República Dominicana</p>
            </div>
            
            <div class="contact-item">
              <h4>{{ 'contact.phone' | translate }}</h4>
              <p>+1 (809) 555-0123</p>
            </div>
            
            <div class="contact-item">
              <h4>{{ 'contact.email' | translate }}</h4>
              <p>info@drasoranydiaz.com</p>
            </div>
            
            <div class="contact-item">
              <h4>{{ 'contact.hours' | translate }}</h4>
              <p>Lun - Vie: 8:00 AM - 6:00 PM<br>Sáb: 8:00 AM - 2:00 PM</p>
            </div>
          </div>
          
          <form class="contact-form">
            <div class="form-group">
              <input type="text" placeholder="{{ 'contact.form.name' | translate }}" required />
            </div>
            <div class="form-group">
              <input type="email" placeholder="{{ 'contact.form.email' | translate }}" required />
            </div>
            <div class="form-group">
              <input type="tel" placeholder="{{ 'contact.form.phone' | translate }}" />
            </div>
            <div class="form-group">
              <select>
                <option value="">{{ 'contact.form.service' | translate }}</option>
                <option value="aesthetic">{{ 'services.aesthetic.title' | translate }}</option>
                <option value="rehabilitation">{{ 'services.rehabilitation.title' | translate }}</option>
                <option value="implants">{{ 'services.implants.title' | translate }}</option>
                <option value="orthodontics">{{ 'services.orthodontics.title' | translate }}</option>
              </select>
            </div>
            <div class="form-group">
              <textarea placeholder="{{ 'contact.form.message' | translate }}" rows="5"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">{{ 'contact.form.submit' | translate }}</button>
          </form>
        </div>
      </div>
    </section>
  `,
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {}
