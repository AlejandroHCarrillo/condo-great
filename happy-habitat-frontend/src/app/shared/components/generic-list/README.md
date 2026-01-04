# GenericListComponent

Componente genérico de lista paginada con DaisyUI.

## Características

- ✅ Lista paginada de elementos
- ✅ Configuración de columnas personalizadas
- ✅ Detección automática de columnas si no se especifican
- ✅ Configuración de elementos por página
- ✅ Navegación de páginas con botones
- ✅ Look and feel de DaisyUI
- ✅ Eventos para interacción (clic en fila, cambio de página)

## Uso básico

```typescript
import { GenericListComponent } from '@shared/components/generic-list/generic-list.component';

@Component({
  selector: 'my-component',
  imports: [GenericListComponent],
  template: `
    <hh-generic-list
      [items]="myItems"
      [title]="'Mi Lista'"
      [itemsPerPage]="10"
      (rowClick)="onRowClick($event)"
    ></hh-generic-list>
  `
})
export class MyComponent {
  myItems = [
    { id: 1, name: 'Item 1', description: 'Descripción 1' },
    { id: 2, name: 'Item 2', description: 'Descripción 2' },
    // ...
  ];

  onRowClick(item: any) {
    console.log('Clicked:', item);
  }
}
```

## Uso con columnas personalizadas

```typescript
import { GenericListComponent, ColumnConfig } from '@shared/components/generic-list/generic-list.component';

@Component({
  selector: 'my-component',
  imports: [GenericListComponent],
  template: `
    <hh-generic-list
      [items]="myItems"
      [columns]="columns"
      [itemsPerPage]="20"
    ></hh-generic-list>
  `
})
export class MyComponent {
  myItems = [
    { id: 1, name: 'Item 1', price: 100, date: new Date() },
    // ...
  ];

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre', sortable: true },
    { 
      key: 'price', 
      label: 'Precio',
      formatter: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: 'date', 
      label: 'Fecha',
      formatter: (value) => new Date(value).toLocaleDateString()
    }
  ];
}
```

## Inputs

| Input | Tipo | Por defecto | Descripción |
|-------|------|-------------|-------------|
| `items` | `T[]` | `[]` | Lista de elementos a mostrar |
| `columns` | `ColumnConfig[]` | `[]` | Configuración de columnas (opcional) |
| `itemsPerPage` | `number` | `10` | Número de elementos por página |
| `title` | `string` | `undefined` | Título opcional para la lista |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| `rowClick` | `EventEmitter<T>` | Se emite cuando se hace clic en una fila |
| `pageChange` | `EventEmitter<number>` | Se emite cuando cambia la página |
| `itemsPerPageChange` | `EventEmitter<number>` | Se emite cuando cambia el número de elementos por página |

## ColumnConfig

```typescript
interface ColumnConfig {
  key: string;                    // Key del objeto a mostrar
  label: string;                   // Etiqueta de la columna
  sortable?: boolean;              // Si la columna es ordenable (futuro)
  formatter?: (value: any, item: any) => string;  // Función para formatear el valor
}
```

## Ejemplo completo

```typescript
import { Component } from '@angular/core';
import { GenericListComponent, ColumnConfig } from '@shared/components/generic-list/generic-list.component';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [GenericListComponent],
  template: `
    <hh-generic-list
      [items]="users"
      [columns]="columns"
      [title]="'Lista de Usuarios'"
      [itemsPerPage]="15"
      (rowClick)="onUserClick($event)"
      (pageChange)="onPageChange($event)"
    ></hh-generic-list>
  `
})
export class UsersListComponent {
  users: User[] = [
    { id: 1, name: 'Juan', email: 'juan@example.com', role: 'Admin', createdAt: new Date() },
    // ...
  ];

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
    { 
      key: 'createdAt', 
      label: 'Fecha de creación',
      formatter: (value) => new Date(value).toLocaleDateString('es-ES')
    }
  ];

  onUserClick(user: User) {
    console.log('Usuario seleccionado:', user);
    // Navegar a detalles, abrir modal, etc.
  }

  onPageChange(page: number) {
    console.log('Página cambiada a:', page);
  }
}
```

