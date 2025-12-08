import { Routes } from '@angular/router';
import { RegistroActividadesLayoutComponent } from '../../layouts/registro/registro-actividades-layout';
import { RegistroVisitanteComponent } from './registro-visitante/registro-visitante.component';
import { RegistroMudanzaComponent } from './registro-mudanza/registro-mudanza.component';
import { RegistroPaqueteriaComponent } from './registro-paqueteria/registro-paqueteria.component';
import { RegistroMascotaComponent } from './registro-mascota/registrar-mascota.component';
import { RegistroAutoComponent } from './registro-auto/registrar-auto.component';
import { RegistroPreferenciasComponent } from './registro-preferencias/registro-preferencias.component';

export const registroRoutes: Routes = [
    {
        path: '',
        component: RegistroActividadesLayoutComponent,
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
            path: 'mudanza',
            component: RegistroMudanzaComponent
        }, 
        {
            path: 'paqueteria',
            component: RegistroPaqueteriaComponent
        }, 
        {
            path: 'mascotas',
            component: RegistroMascotaComponent
        }, 
        {
            path: 'autos',
            component: RegistroAutoComponent
        }, 
        // {
        //     path: 'by/:code',
        //     component: CountryPageComponent
        // }
        { 
            path :'**',
            redirectTo: 'visitantes'
        }
    ]
    },
];

export default registroRoutes;