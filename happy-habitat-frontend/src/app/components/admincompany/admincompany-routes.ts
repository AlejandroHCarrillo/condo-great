import { Routes } from '@angular/router';
import { AdmincompanyActividadesLayoutComponent } from '../../layouts/admincompany/admincompany-actividades-layout';
import { NotFoundPageComponent } from '../../pages/not-found-page/not-found-page.component';
import { AmenidadesComponent } from '../amenidad/amenidades/amenidades.component';
import { AmenidadFormComponent } from '../amenidad/amenidad-form/amenidad-form.component';
import { AmenidadDetailComponent } from '../amenidad/amenidad-detail/amenidad-detail.component';
import { ComunicadosComponent } from '../comunicado/comunicados/comunicados.component';
import { ComunicadoFormComponent } from '../comunicado/comunicado-form/comunicado-form.component';
import { ComunicadoDetailComponent } from '../comunicado/comunicado-detail/comunicado-detail.component';
import { ResidentesComponent } from '../residentes/residentes/residentes.component';
import { ResidenteFormComponent } from '../residentes/residente-form/residente-form.component';
import { ResidentInfoDetailComponent } from '../residentes/resident-info-detail/resident-info-detail.component';
import { ProveedoresComponent } from '../proveedor/proveedores/proveedores.component';
import { ProveedorFormComponent } from '../proveedor/proveedor-form/proveedor-form.component';
import { ProveedorDetailComponent } from '../proveedor/proveedor-detail/proveedor-detail.component';
import { DocumentosComponent } from '../documento/documentos/documentos.component';
import { DocumentoFormComponent } from '../documento/documento-form/documento-form.component';
import { DocumentDetailComponent } from '../documento/document-detail/document-detail.component';
import { ConfiguracionesComponent } from '../configuracion/configuraciones/configuraciones.component';
import { ConfiguracionFormComponent } from '../configuracion/configuracion-form/configuracion-form.component';
import { ConfiguracionDetailComponent } from '../configuracion/configuracion-detail/configuracion-detail.component';
import { PreciosComponent } from '../precios/precios/precios.component';
import { PrecioFormComponent } from '../precios/precio-form/precio-form.component';
import { PrecioDetailComponent } from '../precios/precio-detail/precio-detail.component';
import { EncuestasComponent } from '../encuesta/encuestas/encuestas.component';
import { EncuestaFormComponent } from '../encuesta/encuesta-form/encuesta-form.component';
import { EncuestaDetailComponent } from '../encuesta/encuesta-detail/encuesta-detail.component';
import { TicketsComponent } from '../tickets/tickets/tickets.component';
import { TicketDetailComponent } from '../tickets/ticket-detail/ticket-detail.component';
import { TicketFormComponent } from '../tickets/ticket-form/ticket-form.component';

export const admincompanyRoutes: Routes = [
    {
        path: '',
        component: AdmincompanyActividadesLayoutComponent,
        children: [
            {
                path: 'comunicados',
                component: ComunicadosComponent
            },
            {
                path: 'comunicados/nuevo/:communityId',
                component: ComunicadoFormComponent
            },
            {
                path: 'comunicados/editar/:id',
                component: ComunicadoFormComponent
            },
            {
                path: 'comunicados/:id',
                component: ComunicadoDetailComponent
            },
            {
                path: 'residentes',
                component: ResidentesComponent
            },
            {
                path: 'residentes/nuevo/:communityId',
                component: ResidenteFormComponent
            },
            {
                path: 'residentes/editar/:id',
                component: ResidenteFormComponent
            },
            {
                path: 'residentes/tickets',
                component: TicketsComponent
            },
            {
                path: 'residentes/tickets/nuevo/:communityId',
                component: TicketFormComponent
            },
            {
                path: 'residentes/tickets/:id',
                component: TicketDetailComponent
            },
            {
                path: 'residentes/:id',
                component: ResidentInfoDetailComponent
            },
            {
                path: 'amenidades',
                component: AmenidadesComponent
            },
            {
                path: 'amenidades/nuevo/:communityId',
                component: AmenidadFormComponent
            },
            {
                path: 'amenidades/editar/:id',
                component: AmenidadFormComponent
            },
            {
                path: 'amenidades/:id',
                component: AmenidadDetailComponent
            },
            {
                path: 'proveedores/nuevo/:communityId',
                component: ProveedorFormComponent
            },
            {
                path: 'proveedores/editar/:id',
                component: ProveedorFormComponent
            },
            {
                path: 'proveedores/:id',
                component: ProveedorDetailComponent
            },
            {
                path: 'proveedores',
                component: ProveedoresComponent
            },
            {
                path: 'documentos',
                component: DocumentosComponent
            },
            {
                path: 'documentos/nuevo/:communityId',
                component: DocumentoFormComponent
            },
            {
                path: 'documentos/editar/:id',
                component: DocumentoFormComponent
            },
            {
                path: 'documentos/:id',
                component: DocumentDetailComponent
            },
            {
                path: 'configuracion',
                component: ConfiguracionesComponent
            },
            {
                path: 'configuracion/nuevo/:communityId',
                component: ConfiguracionFormComponent
            },
            {
                path: 'configuracion/editar/:id',
                component: ConfiguracionFormComponent
            },
            {
                path: 'configuracion/:id',
                component: ConfiguracionDetailComponent
            },
            {
                path: 'precios',
                component: PreciosComponent
            },
            {
                path: 'precios/nuevo/:communityId',
                component: PrecioFormComponent
            },
            {
                path: 'precios/editar/:id',
                component: PrecioFormComponent
            },
            {
                path: 'precios/:id',
                component: PrecioDetailComponent
            },
            {
                path: 'encuestas',
                component: EncuestasComponent
            },
            {
                path: 'encuestas/nuevo/:communityId',
                component: EncuestaFormComponent
            },
            {
                path: 'encuestas/editar/:id',
                component: EncuestaFormComponent
            },
            {
                path: 'encuestas/:id',
                component: EncuestaDetailComponent
            },
            {
                path: 'reportes/morosos',
                component: NotFoundPageComponent
            },
            {
                path: 'reportes/finanzas',
                component: NotFoundPageComponent
            },
            {
                path: 'reportes/tickets',
                component: NotFoundPageComponent
            },
            {
                path: 'reportes/pago-proveedores',
                component: NotFoundPageComponent
            },
            {
                path: 'reportes/ingresos',
                component: NotFoundPageComponent
            },
            {
                path: 'reportes/gastos',
                component: NotFoundPageComponent
            },
            {
                path: 'reportes/resumen',
                component: NotFoundPageComponent
            },
            {
                path: '**',
                redirectTo: 'comunicados'
            }
        ]
    },
];

export default admincompanyRoutes;
