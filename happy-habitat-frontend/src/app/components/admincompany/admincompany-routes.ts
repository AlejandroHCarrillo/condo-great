import { Routes } from '@angular/router';
import { AdmincompanyActividadesLayoutComponent } from '../../layouts/admincompany/admincompany-actividades-layout';
import { AdmincompanyComunicadosComponent } from './admincompany-comunicados/admincompany-comunicados.component';
import { AdmincompanyResidentesComponent } from './admincompany-residentes/admincompany-residentes.component';
import { AdmincompanyAmenidadesComponent } from './admincompany-amenidades/admincompany-amenidades.component';
import { AdmincompanyProveedoresComponent } from './admincompany-proveedores/admincompany-proveedores.component';
import { AdmincompanyDocumentosComponent } from './admincompany-documentos/admincompany-documentos.component';
import { AdmincompanyReportesComponent } from './admincompany-reportes/admincompany-reportes.component';

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
                path: 'residentes',
                component: AdmincompanyResidentesComponent
            },
            {
                path: 'amenidades',
                component: AdmincompanyAmenidadesComponent
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

