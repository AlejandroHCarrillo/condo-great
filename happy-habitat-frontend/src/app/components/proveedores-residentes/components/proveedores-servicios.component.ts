import { JsonPipe } from '@angular/common';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { ProveedoresListComponent } from "./proveedores-list/proveedores-list.component";
import { SearchInputComponent } from "./search-input/search-input.component";
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { proveedoresResidentes } from '../../../shared/data/proveedores-servicios.data';
import { ProveedorServicio } from '../../../shared/interfaces/proveedor-servicio.inteface';

@Component({
  selector: 'hh-proveedores-servicios',
  imports: [JsonPipe, ProveedoresListComponent, SearchInputComponent],
  templateUrl: './proveedores-servicios.component.html',
  styles: ``
})
export class ProveedoresServiciosComponent {
  provedores = signal<ProveedorServicio[]>([...proveedoresResidentes])
  // _service = inject(ProveedoresResidentesService);
  
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  queryParam = this.activatedRoute.snapshot.queryParamMap.get('query') ?? '';
  query = linkedSignal(() => this.queryParam);

  // provData = signal<ProveedorServicio[]>([...proveedoresResidentes]);  

  // Desactivada por el momento info se envia harcodeada desde archivo
  // proveedoresResource = rxResource({
  //   request: () => ({ query: this.query() }),
  //   loader: ({ request }) => {
  //     if (!request.query || request.query.trim().length === 0) return of([]);
  //     this.router.navigate(['/proveedores/by-kind'], 
  //       { queryParams: { query: request.query } });
  //     return this._service.searchByServiceKind(request.query); 
  //   }, 
  // });

}