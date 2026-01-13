import { Routes } from '@angular/router';
import { VigilanciaActividadesLayoutComponent } from '../../layouts/vigilancia/vigilancia-actividades-layout';
import { VigilanciaResidentesComponent } from './vigilancia-residentes/vigilancia-residentes.component';
import { VigilanciaReservacionesComponent } from './vigilancia-reservaciones/vigilancia-reservaciones.component';
import { VigilanciaIncidentesComponent } from './vigilancia-incidentes/vigilancia-incidentes.component';
import { VigilanciaTicketsComponent } from './vigilancia-tickets/vigilancia-tickets.component';

export const vigilanciaRoutes: Routes = [
    {
        path: '',
        component: VigilanciaActividadesLayoutComponent,
        children: [
            {
                path: 'residentes',
                component: VigilanciaResidentesComponent
            },
            {
                path: 'reservaciones',
                component: VigilanciaReservacionesComponent
            },
            {
                path: 'incidentes',
                component: VigilanciaIncidentesComponent
            },
            {
                path: 'tickets',
                component: VigilanciaTicketsComponent
            },
            {
                path: '**',
                redirectTo: 'residentes'
            }
        ]
    },
];

export default vigilanciaRoutes;

