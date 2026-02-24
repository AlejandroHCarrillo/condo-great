import { Routes } from '@angular/router';
import { ResidentActividadesLayoutComponent } from '../../layouts/resident/resident-actividades-layout';
import { RegistroVisitanteComponent } from './registro-visitante/registro-visitante.component';
import { RegistroMascotaComponent } from './registro-mascota/registrar-mascota.component';
import { RegistroAutoComponent } from './registro-auto/registrar-auto.component';
import { RegistroPreferenciasComponent } from './registro-preferencias/registro-preferencias.component';
import { ReservacionesComponent } from '../reservaciones/reservaciones.component';
import { ResidentEncuestasComponent } from './resident-encuestas/resident-encuestas.component';
import { ResidentEncuestaResponderComponent } from './resident-encuesta-responder/resident-encuesta-responder.component';
import { TicketsComponent } from '../tickets/tickets/tickets.component';
import { TicketFormComponent } from '../tickets/ticket-form/ticket-form.component';
import { TicketDetailComponent } from '../tickets/ticket-detail/ticket-detail.component';
import { ResidentPagosListComponent } from '../pagos-residente/resident-pagos-list/resident-pagos-list.component';
import { ResidentPagoDetailComponent } from '../pagos-residente/resident-pago-detail/resident-pago-detail.component';

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
            component: TicketsComponent
        },
        {
            path: 'tickets/nuevo',
            component: TicketFormComponent
        },
        {
            path: 'tickets/:id',
            component: TicketDetailComponent
        },
        {
            path: 'pagos',
            component: ResidentPagosListComponent
        },
        {
            path: 'pagos/:id',
            component: ResidentPagoDetailComponent
        },
        {
            path: '**',
            redirectTo: 'visitantes'
        }
    ]
    },
];

export default residentRoutes;