import { Component, Input, Output, EventEmitter, computed, signal, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  formatter?: (value: any, item: any) => string;
  isHtml?: boolean; // Si es true, el formatter puede devolver HTML
}

@Component({
  selector: 'hh-generic-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-list.component.html',
  styleUrl: './generic-list.component.css'
})
export class GenericListComponent<T extends Record<string, any>> implements OnChanges, AfterViewInit {
  // Lista de elementos a mostrar
  @Input() items: T[] = [];
  
  // Configuración de columnas (opcional, si no se especifica se muestran todas)
  @Input() columns: ColumnConfig[] = [];
  
  // Número de elementos por página (por defecto 10)
  @Input() itemsPerPage: number = 10;
  
  // Título opcional para la lista
  @Input() title?: string;
  
  // Emite el evento cuando se hace clic en una fila
  @Output() rowClick = new EventEmitter<T>();
  
  // Emite el evento cuando cambia la página
  @Output() pageChange = new EventEmitter<number>();
  
  // Emite el evento cuando cambia el número de elementos por página
  @Output() itemsPerPageChange = new EventEmitter<number>();
  
  // Emite el evento cuando se hace clic en editar
  @Output() edit = new EventEmitter<T>();
  
  // Emite el evento cuando se hace clic en eliminar
  @Output() delete = new EventEmitter<T>();
  
  // Muestra botones de acción (editar/eliminar)
  @Input() showActions: boolean = false;

  // Función opcional para determinar si un item puede ser editado
  @Input() canEdit?: (item: T) => boolean;

  // Función opcional para determinar si un item puede ser eliminado
  @Input() canDelete?: (item: T) => boolean;

  // Señal para la página actual
  currentPage = signal(1);
  
  // Señal para el número de elementos por página
  itemsPerPageSignal = signal(10);

  // Computed: columnas a mostrar (si no se especifican, se detectan automáticamente)
  displayedColumns = computed(() => {
    if (this.columns.length > 0) {
      return this.columns;
    }
    
    // Si no hay columnas configuradas, detectar automáticamente del primer elemento
    if (this.items.length > 0) {
      const firstItem = this.items[0];
      return Object.keys(firstItem).map(key => ({
        key,
        label: this.formatLabel(key),
        sortable: false,
        isHtml: false
      }));
    }
    
    return [];
  });

  // Computed: elementos paginados
  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPageSignal();
    const end = start + this.itemsPerPageSignal();
    return this.items.slice(start, end);
  });

  // Computed: número total de páginas
  totalPages = computed(() => {
    return Math.ceil(this.items.length / this.itemsPerPageSignal());
  });

  // Computed: información de paginación
  paginationInfo = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPageSignal() + 1;
    const end = Math.min(this.currentPage() * this.itemsPerPageSignal(), this.items.length);
    return {
      start,
      end,
      total: this.items.length
    };
  });

  // Opciones de elementos por página
  itemsPerPageOptions = [5, 10, 20, 50, 100];

  private router = inject(Router);

  constructor() {
    // Inicializar itemsPerPageSignal con el valor del input
    this.itemsPerPageSignal.set(this.itemsPerPage);
  }

  ngAfterViewInit(): void {
    // Interceptar clicks en enlaces dentro de las celdas para usar Router
    setTimeout(() => {
      const table = document.querySelector('table');
      if (table) {
        table.addEventListener('click', (event) => {
          const target = event.target as HTMLElement;
          const link = target.closest('a[href^="/"]');
          if (link && link.getAttribute('href')?.startsWith('/')) {
            event.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
              this.router.navigateByUrl(href);
            }
          }
        });
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Actualizar itemsPerPageSignal cuando cambia el input
    if (changes['itemsPerPage'] && this.itemsPerPage !== this.itemsPerPageSignal()) {
      this.itemsPerPageSignal.set(this.itemsPerPage);
    }
    
    // Resetear a la primera página si cambian los items
    if (changes['items'] && this.currentPage() > this.totalPages() && this.totalPages() > 0) {
      this.currentPage.set(1);
    }
    
    // Debug: verificar showActions
    if (changes['showActions']) {
      console.log('[GenericList] showActions value:', this.showActions);
    }
  }

  /**
   * Formatea una etiqueta de columna desde una key
   */
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Obtiene el valor formateado de una celda
   */
  getCellValue(item: T, column: ColumnConfig): string {
    const value = item[column.key];
    
    if (column.formatter) {
      return column.formatter(value, item);
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }

  /**
   * Cambia a la página anterior
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.pageChange.emit(this.currentPage());
    }
  }

  /**
   * Cambia a la página siguiente
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.pageChange.emit(this.currentPage());
    }
  }

  /**
   * Va a una página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.pageChange.emit(page);
    }
  }

  /**
   * Maneja el cambio en el número de elementos por página
   */
  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPageSignal.set(newValue);
    this.currentPage.set(1); // Resetear a la primera página
    this.itemsPerPageChange.emit(newValue);
  }

  /**
   * Maneja el clic en una fila
   */
  onRowClick(item: T, event?: Event): void {
    // Si el clic fue en un botón de acción, no emitir rowClick
    if (event && (event.target as HTMLElement).closest('.action-button')) {
      return;
    }
    this.rowClick.emit(item);
  }

  /**
   * Verifica si un item puede ser editado
   */
  isEditable(item: T): boolean {
    return this.canEdit ? this.canEdit(item) : true;
  }

  /**
   * Verifica si un item puede ser eliminado
   */
  isDeletable(item: T): boolean {
    return this.canDelete ? this.canDelete(item) : true;
  }

  /**
   * Maneja el clic en editar
   */
  onEdit(item: T, event: Event): void {
    event.stopPropagation();
    if (this.isEditable(item)) {
      this.edit.emit(item);
    }
  }

  /**
   * Maneja el clic en eliminar
   */
  onDelete(item: T, event: Event): void {
    event.stopPropagation();
    if (this.isDeletable(item)) {
      this.delete.emit(item);
    }
  }

  /**
   * Genera un array de números de página para mostrar
   */
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar primera página
      pages.push(1);
      
      if (current > 3) {
        pages.push(-1); // -1 indica "..."
      }
      
      // Mostrar páginas alrededor de la actual
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); // -1 indica "..."
      }
      
      // Mostrar última página
      pages.push(total);
    }
    
    return pages;
  }
}

