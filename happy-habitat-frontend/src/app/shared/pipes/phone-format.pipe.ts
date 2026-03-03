import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formato de teléfono México: XXXX-XX-XXXX (10 dígitos).
 * Acepta entrada con o sin caracteres no numéricos.
 */
@Pipe({
  name: 'phoneFormat',
  standalone: true
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null || value === '') return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.length > 6) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
    }
    if (digits.length > 4) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return digits;
  }
}
