import { ProveedorServicio } from './../../../shared/interfaces/proveedor-servicio.inteface';
import type { RESTProveedorServicioResidente } from '../interfaces/rest-proveedor-servicio-residente.interface';

export class ProveedorServicioMapper {

    static mapRESTProveedorServicioToProveedorServicio(restProvServicio: RESTProveedorServicioResidente): ProveedorServicio {
        return {
                    id: restProvServicio.id,
                    name: restProvServicio.name,
                    description: restProvServicio.description,
                    kindservice: restProvServicio.kindservice,
                    phone: restProvServicio.phone,
                    emai: restProvServicio.email
                };    
    }

    static mapRESTProveedoresToProveedoresArray(restProveedores: RESTProveedorServicioResidente[]): ProveedorServicio[] {
        return restProveedores.map((proveedor) => this.mapRESTProveedorServicioToProveedorServicio(proveedor));
    }
}