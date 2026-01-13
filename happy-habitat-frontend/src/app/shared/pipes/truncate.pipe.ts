import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  /**
   * Trunca un texto a una longitud máxima y agrega puntos suspensivos
   * @param value El texto a truncar
   * @param length La longitud máxima (por defecto 25)
   * @returns El texto truncado con "..." si excede la longitud
   */
  transform(value: string | null | undefined, length: number = 25): string {
    if (!value) {
      return '-';
    }

    if (value.length <= length) {
      return value;
    }

    return value.substring(0, length) + '...';
  }
}


