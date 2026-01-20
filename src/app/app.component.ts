import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  @ViewChild('themesMenu', { static: true }) themesMenu!: ElementRef;
  private matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  private removeEvent: (() => void) | null = null;

  constructor(private rendered: Renderer2) { }

  ngOnInit(): void {
    this.matchMedia.addEventListener('change', this.updateTheme.bind(this));
    this.updateTheme(); // Configura el tema inicial al cargar
    document.addEventListener('click', this.handleClickOutside.bind(this));

    this.updateNavbarStyles();
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  

  handleClickOutside(event: Event) {
    if (this.themesMenu && !this.themesMenu.nativeElement.contains(event.target)) {
      this.rendered.removeClass(this.themesMenu.nativeElement, 'open');
    }
  }

  private updateNavbarStyles() {
    const navbar = document.querySelector('nav');
    if (navbar) {
      if (document.documentElement.classList.contains('dark')) {
        this.rendered.addClass(navbar, 'bg-dark-navbar');
        this.rendered.removeClass(navbar, 'bg-light-navbar');
      } else {
        this.rendered.removeClass(navbar, 'bg-dark-navbar');
        this.rendered.addClass(navbar, 'bg-light-navbar');
      }
    }
  }

  onScroll() {
    const navbar = document.querySelector('nav');
    if (window.scrollY > 0) {
      // Aplica el fondo según el tema
      if (document.documentElement.classList.contains('dark')) {
        this.rendered.addClass(navbar, 'bg-dark-navbar'); // Clase para el modo oscuro
      } else {
        this.rendered.addClass(navbar, 'bg-light-navbar'); // Clase para el modo claro
      }
      this.rendered.addClass(navbar, 'backdrop-blur'); // Añade el efecto de desenfoque
    } else {
      // Quita las clases si vuelve al tope de la página
      this.rendered.removeClass(navbar, 'bg-dark-navbar');
      this.rendered.removeClass(navbar, 'bg-light-navbar');
      this.rendered.removeClass(navbar, 'backdrop-blur');
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    const isClosed = !this.themesMenu.nativeElement.classList.contains('open');
    this.rendered[isClosed ? 'addClass' : 'removeClass'](this.themesMenu.nativeElement, 'open');
  }

  setTheme(theme: string) {
    localStorage.setItem('theme', theme);
    this.updateTheme();
    this.updateNavbarStyles(); // Actualiza el navbar inmediatamente
    this.rendered.removeClass(this.themesMenu.nativeElement, 'open');
  }

  private updateTheme() {
    if (this.removeEvent) {
      this.removeEvent();
    }

    const themePreference = this.getThemePreference();
    const isDark = themePreference === 'dark' || (themePreference === 'system' && this.matchMedia.matches);

    // Actualiza toda la página
    this.rendered[isDark ? 'addClass' : 'removeClass'](document.documentElement, 'dark');
    this.updateIcon(themePreference);

    // Escucha cambios en el modo de sistema si está en modo 'system'
    if (themePreference === 'system') {
      this.removeEvent = () => {
        this.matchMedia.removeEventListener('change', this.updateTheme.bind(this));
      };
      this.matchMedia.addEventListener('change', this.updateTheme.bind(this));
    }
  }

  private getThemePreference(): string {
    return localStorage.getItem('theme') || 'system';
  }

  private updateIcon(themePreference: string) {
    document.querySelectorAll('.theme-toggle-icon').forEach((element) => {
      this.rendered.setStyle(element, 'scale', element.id === themePreference ? '1' : '0');
    })
  }
}
