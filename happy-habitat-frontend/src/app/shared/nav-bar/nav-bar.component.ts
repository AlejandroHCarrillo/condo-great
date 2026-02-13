import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumsComponent } from "../breadcrums/breadcrums.component";

@Component({
  selector: 'hh-nav-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
  
  title = "Happy Habitat";
  themeKey = 'HHTheme';
  
  // Signal para el tema seleccionado, inicializado con valor por defecto
  // Se actualizará en ngOnInit con el valor de localStorage
  selectedTheme = signal<string>('lemonade');
  
  // Opciones de temas disponibles
  themes = [
    { value: 'lemonade', label: 'Lemonade' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'winter', label: 'Winter' },
    { value: 'forest', label: 'Bosque' },
    { value: 'autumn', label: 'Autumn' },
    { value: 'lofi', label: 'Lofi' }
  ];
  
  constructor() {
    // Effect para asegurar que el tema se aplique cuando cambie el signal
    effect(() => {
      const theme = this.selectedTheme();
      if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  }

  ngOnInit(): void {
    this.checkThemeStored();
  }

  /**
   * Obtiene el tema guardado en localStorage
   */
  private getStoredTheme(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const theme = localStorage.getItem(this.themeKey);
//        console.log('Theme from localStorage:', theme);
        return theme;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  }

  /**
   * Verifica y aplica el tema guardado al cargar el componente
   */
  checkThemeStored(): void {
    const storedTheme = this.getStoredTheme();
//    console.log('Stored theme:', storedTheme);
    
    if (storedTheme && storedTheme.trim() !== '') {
      // Aplicar el tema al documento
      document.documentElement.setAttribute('data-theme', storedTheme);
      // Sincronizar el signal con el valor guardado
      this.selectedTheme.set(storedTheme);
//      console.log('Theme applied and signal updated to:', storedTheme);
    } else {
      // Si no hay tema guardado, usar el default y guardarlo
      const defaultTheme = 'lemonade';
      document.documentElement.setAttribute('data-theme', defaultTheme);
      this.selectedTheme.set(defaultTheme);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.themeKey, defaultTheme);
      }
//      console.log('No theme found, using default:', defaultTheme);
    }
  }

  /**
   * Maneja el cambio de tema desde el select (usando ngModelChange)
   */
  onSeleccionChange(valor: string): void {
    console.log('Theme changed to:', valor);
    
    // Aplicar el tema al documento
    document.documentElement.setAttribute('data-theme', valor);
    
    // Guardar en localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.themeKey, valor);
        console.log('Theme saved to localStorage:', valor);
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Actualizar el signal
    this.selectedTheme.set(valor);
  }

  /**
   * Maneja el cambio de tema desde el select (método alternativo con Event)
   */
  onSeleccion(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.onSeleccionChange(valor);
  }
}
