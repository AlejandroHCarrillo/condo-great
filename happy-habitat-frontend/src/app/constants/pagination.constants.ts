/**
 * Opciones de tamaño de página para paginadores.
 * Usar en selects "Por página" y para validar query params.
 */
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export function isPageSizeOption(value: number): value is PageSizeOption {
  return PAGE_SIZE_OPTIONS.includes(value as PageSizeOption);
}
