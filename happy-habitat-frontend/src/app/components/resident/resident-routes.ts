import { Routes } from '@angular/router';
import { ResidentActividadesLayoutComponent } from '../../layouts/resident/resident-actividades-layout';
import { RegistroVisitanteComponent } from './registro-visitante/registro-visitante.component';
import { RegistroMascotaComponent } from './registro-mascota/registrar-mascota.component';
import { RegistroAutoComponent } from './registro-auto/registrar-auto.component';
import { RegistroPreferenciasComponent } from './registro-preferencias/registro-preferencias.component';
import { ReservacionesComponent } from '../reservaciones/reservaciones.component';
import { ResidentEncuestasComponent } from './resident-encuestas/resident-encuestas.component';
import { ResidentEncuestaResponderComponent } from './resident-encuesta-responder/resident-encuesta-responder.component';
import { AdmincompanyTicketsComponent } from '../admincompany/admincompany-tickets/admincompany-tickets.component';
import { AdmincompanyTicketFormComponent } from '../admincompany/admincompany-ticket-form/admincompany-ticket-form.component';
import { AdmincompanyTicketDetailComponent } from '../admincompany/admincompany-ticket-detail/admincompany-ticket-detail.component';

export const residentRoutes: Routes = [
    {
        path: '',
        component: ResidentActividadesLayoutComponent,
        children:[
        {
            path: 'visitantes',
            component: RegistroVisitanteComponent
        },
        {
            path: 'preferencias',
            component: RegistroPreferenciasComponent
        },
        {
            path: 'mascotas',
            component: RegistroMascotaComponent
        },
        {
            path: 'autos',
            component: RegistroAutoComponent
        }, 
        {
            path: 'reservaciones',
            component: ReservacionesComponent
        },
        {
            path: 'encuestas',
            component: ResidentEncuestasComponent
        },
        {
            path: 'encuestas/:id',
            component: ResidentEncuestaResponderComponent
        },
        {
            path: 'tickets',
            component: AdmincompanyTicketsComponent
        },
        {
            path: 'tickets/nuevo',
            component: AdmincompanyTicketFormComponent
        },
        {
            path: 'tickets/:id',
            component: AdmincompanyTicketDetailComponent
        },
        {
            path: '**',
            redirectTo: 'visitantes'
        }
    ]
    },
];

export default residentRoutes;