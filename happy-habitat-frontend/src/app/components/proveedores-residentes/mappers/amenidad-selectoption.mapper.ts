import { Amenidad } from "../../../shared/interfaces/amenidad.interface";
import { SelectOption } from "../../../shared/interfaces/select-option.inteface";

export class AmenidadMapper {

    static mapAmenidadToSelectOption(amenidad: Amenidad): SelectOption {
        return {
                value: amenidad.id!,
                text: amenidad.nombre
            };    
    }

    static mapAmenidadesToSelectOptionsArray(amenidades: Amenidad[]): SelectOption[] {
        return amenidades.map((amenidad) => this.mapAmenidadToSelectOption(amenidad));
    }
}