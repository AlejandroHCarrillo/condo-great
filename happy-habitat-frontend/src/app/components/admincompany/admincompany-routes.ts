import { Routes } from '@angular/router';
import { AdmincompanyActividadesLayoutComponent } from '../../layouts/admincompany/admincompany-actividades-layout';
import { AdmincompanyComunicadosComponent } from './admincompany-comunicados/admincompany-comunicados.component';
import { AdmincompanyResidentesComponent } from './admincompany-residentes/admincompany-residentes.component';
import { AdmincompanyAmenidadesComponent } from './admincompany-amenidades/admincompany-amenidades.component';
import { AdmincompanyProveedoresComponent } from './admincompany-proveedores/admincompany-proveedores.component';
import { AdmincompanyDocumentosComponent } from './admincompany-documentos/admincompany-documentos.component';
import { AdmincompanyReportesComponent } from './admincompany-reportes/admincompany-reportes.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { AdmincompanyDocumentoFormComponent } from './admincompany-documento-form/admincompany-documento-form.component';
import { ResidentInfoDetailComponent } from './resident-info-detail/resident-info-detail.component';
import { AdmincompanyResidenteFormComponent } from './admincompany-residente-form/admincompany-residente-form.component';
import { AdmincompanyComunicadoFormComponent } from './admincompany-comunicado-form/admincompany-comunicado-form.component';
import { AdmincompanyAmenidadFormComponent } from './admincompany-amenidad-form/admincompany-amenidad-form.component';
import { ComunicadoDetailComponent } from './comunicado-detail/comunicado-detail.component';
import { AmenidadDetailComponent } from './amenidad-detail/amenidad-detail.component';
import { AdmincompanyProveedorFormComponent } from './admincompany-proveedor-form/admincompany-proveedor-form.component';
import { ProveedorDetailComponent } from './proveedor-detail/proveedor-detail.component';
import { AdmincompanyConfiguracionesComponent } from './admincompany-configuraciones/admincompany-configuraciones.component';
import { AdmincompanyConfiguracionFormComponent } from './admincompany-configuracion-form/admincompany-configuracion-form.component';
import { ConfiguracionDetailComponent } from './configuracion-detail/configuracion-detail.component';
import { AdmincompanyEncuestasComponent } from './admincompany-encuestas/admincompany-encuestas.component';
import { AdmincompanyEncuestaFormComponent } from './admincompany-encuesta-form/admincompany-encuesta-form.component';
import { EncuestaDetailComponent } from './encuesta-detail/encuesta-detail.component';
import { AdmincompanyTicketsComponent } from './admincompany-tickets/admincompany-tickets.component';
import { AdmincompanyTicketDetailComponent } from './admincompany-ticket-detail/admincompany-ticket-detail.component';
import { AdmincompanyTicketFormComponent } from './admincompany-ticket-form/admincompany-ticket-form.component';

export const admincompanyRoutes: Routes = [
    {
        path: '',
        component: AdmincompanyActividadesLayoutComponent,
        children: [
            {
                path: 'comunicados',
                component: AdmincompanyComunicadosComponent
            },
            {
                path: 'comunicados/nuevo/:communityId',
                component: AdmincompanyComunicadoFormComponent
            },
            {
                path: 'comunicados/editar/:id',
                component: AdmincompanyComunicadoFormComponent
            },
            {
                path: 'comunicados/:id',
                component: ComunicadoDetailComponent
            },
            {
                path: 'residentes',
                component: AdmincompanyResidentesComponent
            },
            {
                path: 'residentes/nuevo/:communityId',
                component: AdmincompanyResidenteFormComponent
            },
            {
                path: 'residentes/editar/:id',
                component: AdmincompanyResidenteFormComponent
            },
            {
                path: 'residentes/tickets',
                component: AdmincompanyTicketsComponent
            },
            {
                path: 'residentes/tickets/nuevo/:communityId',
                component: AdmincompanyTicketFormComponent
            },
            {
                path: 'residentes/tickets/:id',
                component: AdmincompanyTicketDetailComponent
            },
            {
                path: 'residentes/:id',
                component: ResidentInfoDetailComponent
            },
            {
                path: 'amenidades',
                component: AdmincompanyAmenidadesComponent
            },
            {
                path: 'amenidades/nuevo/:communityId',
                component: AdmincompanyAmenidadFormComponent
            },
            {
                path: 'amenidades/editar/:id',
                component: AdmincompanyAmenidadFormComponent
            },
            {
                path: 'amenidades/:id',
                component: AmenidadDetailComponent
            },
            {
                path: 'proveedores/nuevo/:communityId',
                component: AdmincompanyProveedorFormComponent
            },
            {
                path: 'proveedores/editar/:id',
                component: AdmincompanyProveedorFormComponent
            },
            {
                path: 'proveedores/:id',
                component: ProveedorDetailComponent
            },
            {
                path: 'proveedores',
                component: AdmincompanyProveedoresComponent
            },
            {
                path: 'documentos',
                component: AdmincompanyDocumentosComponent
            },
            {
                path: 'documentos/nuevo/:communityId',
                component: AdmincompanyDocumentoFormComponent
            },
            {
                path: 'documentos/editar/:id',
                component: AdmincompanyDocumentoFormComponent
            },
            {
                path: 'documentos/:id',
                component: DocumentDetailComponent
            },
            {
                path: 'configuracion',
                component: AdmincompanyConfiguracionesComponent
            },
            {
                path: 'configuracion/nuevo/:communityId',
                component: AdmincompanyConfiguracionFormComponent
            },
            {
                path: 'configuracion/editar/:id',
                component: AdmincompanyConfiguracionFormComponent
            },
            {
                path: 'configuracion/:id',
                component: ConfiguracionDetailComponent
            },
            {
                path: 'encuestas',
                component: AdmincompanyEncuestasComponent
            },
            {
                path: 'encuestas/nuevo/:communityId',
                component: AdmincompanyEncuestaFormComponent
            },
            {
                path: 'encuestas/editar/:id',
                component: AdmincompanyEncuestaFormComponent
            },
            {
                path: 'encuestas/:id',
                component: EncuestaDetailComponent
            },
            {
                path: 'reportes',
                component: AdmincompanyReportesComponent
            },
            {
                path: '**',
                redirectTo: 'comunicados'
            }
        ]
    },
];

export default admincompanyRoutes;

