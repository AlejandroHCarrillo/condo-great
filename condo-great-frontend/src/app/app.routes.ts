import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { CotosComponent } from './components/cotos/cotos.component';
import { EmpresasAdminComponent } from './components/empresas-admin/empresas-admin.component';
import { AmenidadesComponent } from './components/amenidades/amenidades.component';
import { ProveedoresComponent } from './components/proveedores/proveedores.component';
import { NotfoundComponent } from './components/common/notfound/notfound.component';
import { LoginComponent } from './components/login/login.component';
import { PagesComponent } from './components/pages/pages.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // { path: 'register', component: RegisterComponent },
    { path: '',
        component: PagesComponent,
        // canActivate: [ LoginGuardGuard ],
        // loadChildren: './pages/pages.module#PagesModule'
     },
    { path: "home", component : DashboardComponent },
    { path: "dashboard", component : DashboardComponent },
    { path: "usuarios", component: UsuariosComponent },
    { path: "cotos", component: CotosComponent},
    { path: "empresas", component: EmpresasAdminComponent },
    { path: "amenidades", component: AmenidadesComponent},
    { path: "proveedores", component: ProveedoresComponent },
    { path: "**", component: NotfoundComponent}
];
