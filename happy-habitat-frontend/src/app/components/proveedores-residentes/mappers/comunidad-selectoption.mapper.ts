import { Comunidad } from "../../../interfaces/comunidad.interface";
import { SelectOption } from "../../../shared/interfaces/select-option.inteface";

export class ComunidadMapper {

    static mapComunidadToSelectOption(comunidad: Comunidad): SelectOption {
        return {
                value: comunidad.id!,
                text: comunidad.nombre
            };    
    }

    static mapComunidadesToSelectOptionsArray(comunidades: Comunidad[]): SelectOption[] {
        return comunidades.map((comunidad) => this.mapComunidadToSelectOption(comunidad));
    }
}