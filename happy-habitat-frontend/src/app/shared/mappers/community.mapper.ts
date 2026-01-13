import { CommunityDto } from '../../services/communities.service';
import { Comunidad } from '../../interfaces/comunidad.interface';
import { tipoComunidadEnum } from '../../enums/tipo-comunidad.enum';

/**
 * Mapea CommunityDto del backend a Comunidad del frontend
 * Nota: El backend no tiene todos los campos que el frontend espera,
 * así que usamos valores por defecto para los campos faltantes
 */
export function mapCommunityDtoToComunidad(dto: CommunityDto): Comunidad {
  // Mapear el tipo de comunidad desde el backend
  let tipoUnidadHabitacional = tipoComunidadEnum.COMUNIDAD;
  
  // Si el backend tiene TipoComunidad, usarlo directamente
  if (dto.tipoComunidad) {
    // Intentar mapear el string del backend al enum
    const tipoLower = dto.tipoComunidad.toLowerCase();
    if (tipoLower.includes('coto')) {
      tipoUnidadHabitacional = tipoComunidadEnum.COTO;
    } else if (tipoLower.includes('fraccionamiento')) {
      tipoUnidadHabitacional = tipoComunidadEnum.FRACCIONAMIENTO;
    } else if (tipoLower.includes('colonia')) {
      tipoUnidadHabitacional = tipoComunidadEnum.COLONIA;
    } else if (tipoLower.includes('edificio')) {
      tipoUnidadHabitacional = tipoComunidadEnum.EDIFICIO;
    } else if (tipoLower.includes('condominio')) {
      tipoUnidadHabitacional = tipoComunidadEnum.CONDOMINIO;
    } else {
      // Intentar mapear directamente si coincide con algún valor del enum
      const enumValues = Object.values(tipoComunidadEnum);
      if (enumValues.includes(dto.tipoComunidad as tipoComunidadEnum)) {
        tipoUnidadHabitacional = dto.tipoComunidad as tipoComunidadEnum;
      }
    }
  } else {
    // Fallback: Intentar inferir desde el nombre o descripción
    const nombreLower = dto.nombre.toLowerCase();
    const descripcionLower = dto.descripcion?.toLowerCase() || '';
    
    if (nombreLower.includes('coto') || descripcionLower.includes('coto')) {
      tipoUnidadHabitacional = tipoComunidadEnum.COTO;
    } else if (nombreLower.includes('fraccionamiento') || descripcionLower.includes('fraccionamiento')) {
      tipoUnidadHabitacional = tipoComunidadEnum.FRACCIONAMIENTO;
    } else if (nombreLower.includes('colonia') || descripcionLower.includes('colonia')) {
      tipoUnidadHabitacional = tipoComunidadEnum.COLONIA;
    } else if (nombreLower.includes('edificio') || descripcionLower.includes('edificio')) {
      tipoUnidadHabitacional = tipoComunidadEnum.EDIFICIO;
    } else if (nombreLower.includes('condominio') || descripcionLower.includes('condominio')) {
      tipoUnidadHabitacional = tipoComunidadEnum.CONDOMINIO;
    }
  }

  return {
    id: dto.id,
    nombre: dto.nombre,
    tipoUnidadHabitacional: tipoUnidadHabitacional,
    ubicacion: dto.direccion, // El backend usa "direccion", el frontend espera "ubicacion"
    contacto: dto.contacto,
    cantidadviviendas: dto.cantidadViviendas || 0,
    latlng: (dto.latitud != null && dto.longitud != null) 
      ? { lat: dto.latitud, lng: dto.longitud } 
      : undefined
  };
}

/**
 * Mapea un array de CommunityDto a Comunidad
 */
export function mapCommunityDtosToComunidades(dtos: CommunityDto[]): Comunidad[] {
  return dtos.map(mapCommunityDtoToComunidad);
}

