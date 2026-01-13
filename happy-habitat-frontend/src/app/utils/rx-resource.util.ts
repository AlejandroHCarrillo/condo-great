import { signal, computed, Signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, of, switchMap, tap, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

export interface RxResourceOptions<TRequest, TResponse> {
  request: () => TRequest;
  loader: (options: { request: TRequest }) => Observable<TResponse>;
}

export interface RxResourceResult<TResponse> {
  value: Signal<TResponse | undefined>;
  isLoading: Signal<boolean>;
  error: Signal<Error | null>;
  refetch: () => void;
}

/**
 * Crea un recurso reactivo que maneja la carga de datos asíncronos
 * @param options Configuración del recurso con request y loader
 * @returns Objeto con signals para value, isLoading, error y función refetch
 */
export function rxResource<TRequest, TResponse>(
  options: RxResourceOptions<TRequest, TResponse>
): RxResourceResult<TResponse> {
  const requestSignal = signal(options.request());
  const isLoadingSignal = signal<boolean>(false); // Inicializar en false para no mostrar loading inicialmente
  const errorSignal = signal<Error | null>(null);

  // Effect para actualizar el requestSignal cuando cambia el request
  effect(() => {
    const newRequest = options.request();
    const currentRequest = requestSignal();
    // Solo actualizar si el request cambió (comparación profunda si es objeto)
    if (JSON.stringify(newRequest) !== JSON.stringify(currentRequest)) {
      requestSignal.set(newRequest);
    }
  });

  // Convertir el signal de request a observable para que se actualice automáticamente
  const requestObservable = toObservable(requestSignal);

  // Crear un observable que se actualiza cuando cambia el request
  const resourceObservable = requestObservable.pipe(
    switchMap((currentRequest) => {
      // Solo cargar si el request no es null/undefined
      if (currentRequest === null || currentRequest === undefined) {
        return of(undefined as TResponse);
      }
      
      isLoadingSignal.set(true);
      errorSignal.set(null);

      return options.loader({ request: currentRequest }).pipe(
        tap(() => {
          isLoadingSignal.set(false);
        }),
        catchError((error) => {
          isLoadingSignal.set(false);
          errorSignal.set(error);
          return of(undefined as TResponse);
        })
      );
    })
  );

  // Convertir el observable a signal
  const valueSignal = toSignal<TResponse | undefined>(resourceObservable, {
    initialValue: undefined
  });

  // Función para refetch
  const refetch = () => {
    requestSignal.set(options.request());
  };

  return {
    value: valueSignal,
    isLoading: computed(() => isLoadingSignal()),
    error: computed(() => errorSignal()),
    refetch
  };
}

