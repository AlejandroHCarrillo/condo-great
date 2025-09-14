import { EntradaDirectorio } from '../../../shared/interfaces/entrada-directorio.inteface';
import type { RESTProveedorServicioResidente } from '../interfaces/rest-proveedor-servicio-residente.interface';

export class ProveedorServicioMapper {

    static mapRESTProveedorServicioToProveedorServicio(restProvServicio: RESTProveedorServicioResidente): EntradaDirectorio {
        return {
                    id: restProvServicio.id,
                    name: restProvServicio.name,
                    description: restProvServicio.description,
                    kindservice: restProvServicio.kindservice,
                    phone: restProvServicio.phone,
                    emai: restProvServicio.email
                };    
    }

    static mapRESTProveedoresToProveedoresArray(restProveedores: RESTProveedorServicioResidente[]): EntradaDirectorio[] {
        return restProveedores.map((proveedor) => this.mapRESTProveedorServicioToProveedorServicio(proveedor));
    }
}