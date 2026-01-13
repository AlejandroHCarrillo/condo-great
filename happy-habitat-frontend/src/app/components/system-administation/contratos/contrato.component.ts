import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericListComponent, ColumnConfig } from '../../../shared/components/generic-list/generic-list.component';
import { ContractsService, ContratoDto, CreateContratoRequest, UpdateContratoRequest } from '../../../services/contracts.service';
import { CommunitiesService, CommunityDto } from '../../../services/communities.service';
import { LoggerService } from '../../../services/logger.service';
import { NotificationService } from '../../../services/notification.service';
import { mapContratoDtosToContratos } from '../../../shared/mappers/contract.mapper';
import { tipoContratoEnum } from '../../../enums/tipo-contrato.enum';
import { periodicidadPagoEnum } from '../../../enums/periodicidad-pago.enum';
import { metodoPagoEnum } from '../../../enums/metodo-pago.enum';
import { estadoContratoEnum } from '../../../enums/estado-contrato.enum';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { rxResource } from '../../../utils/rx-resource.util';
import { catchError, of, switchMap } from 'rxjs';
import type { Contrato } from '../../../interfaces/contrato.interface';

@Component({
  selector: 'hh-contrato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GenericListComponent],
  templateUrl: './contrato.component.html',
  styles: ``
})
export class ContratoComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private contractsService = inject(ContractsService);
  private communitiesService = inject(CommunitiesService);
  private logger = inject(LoggerService);
  private notificationService = inject(NotificationService);
  
  // Signal para refrescar la lista de contratos
  private refreshTrigger = signal(0);
  
  // Obtener el ID de comunidad de la ruta (si existe)
  comunidadId = signal<string | null>(null);
  comunidadNombre = signal<string>('');
  
  // Resource para cargar todas las comunidades (para el selector)
  communitiesResource = rxResource({
    request: () => ({ refresh: 0 }),
    loader: () => {
      return this.communitiesService.getAllCommunities().pipe(
        catchError((error) => {
          this.logger.error('Error loading communities', error, 'ContratoComponent');
          return of([]);
        })
      );
    }
  });

  comunidades = computed(() => this.communitiesResource.value() ?? []);

  // Resource para cargar contratos (todos o filtrados por comunidad)
  contractsResource = rxResource({
    request: () => ({ 
      refresh: this.refreshTrigger(),
      comunidadId: this.comunidadId()
    }),
    loader: ({ request }) => {
      // Si hay un comunidadId, cargar solo los contratos de esa comunidad
      if (request.comunidadId) {
        return this.contractsService.getContratosByCommunityId(request.comunidadId).pipe(
          catchError((error) => {
            this.logger.error('Error loading contracts by community', error, 'ContratoComponent');
            this.notificationService.showError(
              'Error al cargar los contratos de la comunidad. Por favor, intenta nuevamente.',
              'Error'
            );
            return of([]);
          })
        );
      }
      // Si no hay comunidadId, cargar todos los contratos
      return this.contractsService.getAllContratos().pipe(
        catchError((error) => {
          this.logger.error('Error loading contracts', error, 'ContratoComponent');
          this.notificationService.showError(
            'Error al cargar los contratos. Por favor, intenta nuevamente.',
            'Error'
          );
          return of([]);
        })
      );
    }
  });

  // Contratos mapeados desde el resource
  contratos = computed(() => {
    const dtos = this.contractsResource.value() ?? [];
    const contratos = mapContratoDtosToContratos(dtos);
    // Agregar nombre de comunidad a cada contrato
    const comunidades = this.comunidades();
    return contratos.map(contrato => {
      const comunidad = comunidades.find(c => c.id === contrato.communityId);
      return {
        ...contrato,
        nombreComunidad: comunidad?.nombre || 'N/A'
      };
    });
  });

  // Estado de carga
  isLoading = computed(() => this.contractsResource.isLoading());
  errorMessage = computed(() => {
    const error = this.contractsResource.error();
    return error ? 'Error al cargar los contratos. Por favor, intenta nuevamente.' : null;
  });

  // Signals para modales
  showModal = signal(false);
  showDeleteModal = signal(false);
  showInfoModal = signal(false);
  contratoToDelete: ContratoDto | null = null;
  selectedContrato: Contrato | null = null;
  editingContratoId: string | null = null;

  // Signal para obtener un contrato por ID (para editar)
  private editContratoIdSignal = signal<string | null>(null);
  editContratoResource = rxResource({
    request: () => ({ id: this.editContratoIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.contractsService.getContratoById(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error loading contract for edit', error, 'ContratoComponent');
          this.notificationService.showError(
            'Error al cargar la información del contrato',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para obtener un contrato por ID (para eliminar)
  private deleteContratoIdSignal = signal<string | null>(null);
  deleteContratoResource = rxResource({
    request: () => ({ id: this.deleteContratoIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.contractsService.getContratoById(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error loading contract for delete', error, 'ContratoComponent');
          this.notificationService.showError(
            'Error al cargar la información del contrato',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para crear contrato
  private createRequestSignal = signal<CreateContratoRequest | null>(null);
  createContratoResource = rxResource({
    request: () => ({ request: this.createRequestSignal() }),
    loader: ({ request }) => {
      if (!request.request) {
        return of(null);
      }
      return this.contractsService.createContrato(request.request).pipe(
        catchError((error) => {
          this.logger.error('Error creating contract', error, 'ContratoComponent', { request: request.request });
          this.notificationService.showError(
            error.error?.message || 'Error al crear el contrato. Por favor, intente nuevamente.',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para actualizar contrato
  private updateRequestSignal = signal<{ id: string; request: UpdateContratoRequest } | null>(null);
  updateContratoResource = rxResource({
    request: () => ({ data: this.updateRequestSignal() }),
    loader: ({ request }) => {
      if (!request.data) {
        return of(null);
      }
      return this.contractsService.updateContrato(request.data.id, request.data.request).pipe(
        catchError((error) => {
          this.logger.error('Error updating contract', error, 'ContratoComponent', { 
            id: request.data!.id,
            request: request.data!.request,
            errorDetails: error 
          });
          this.notificationService.showError(
            error.error?.message || 'Error al actualizar el contrato. Por favor, intente nuevamente.',
            'Error'
          );
          return of(null);
        })
      );
    }
  });

  // Signal para eliminar contrato
  private deleteIdSignal = signal<string | null>(null);
  deleteContratoActionResource = rxResource({
    request: () => ({ id: this.deleteIdSignal() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }
      return this.contractsService.deleteContrato(request.id).pipe(
        catchError((error) => {
          this.logger.error('Error deleting contract', error, 'ContratoComponent');
          this.notificationService.showError(
            error.error?.message || 'Error al eliminar el contrato. Por favor, intente nuevamente.',
            'Error'
          );
          return of(null);
        }),
        switchMap(() => of(true))
      );
    }
  });

  // Effects para manejar las respuestas de los resources
  constructor() {
    // Obtener el parámetro de ruta comunidadId si existe
    this.route.paramMap.subscribe(params => {
      const id = params.get('comunidadId');
      if (id) {
        this.comunidadId.set(id);
        // Cargar el nombre de la comunidad
        this.communitiesService.getCommunityById(id).subscribe({
          next: (comunidad) => {
            this.comunidadNombre.set(comunidad.nombre);
          },
          error: (error) => {
            this.logger.error('Error loading community name', error, 'ContratoComponent');
          }
        });
        // Recargar los contratos cuando cambie el comunidadId
        this.refreshContratos();
      } else {
        this.comunidadId.set(null);
        this.comunidadNombre.set('');
      }
    });

    // Listener para cargar número de casas cuando cambia la comunidad
    this.contratoForm.get('communityId')?.valueChanges.subscribe((communityId) => {
      if (communityId && !this.editingContratoId) {
        // Solo cargar si no se está editando un contrato existente
        this.communitiesService.getCommunityById(communityId).subscribe({
          next: (comunidad) => {
            this.contratoForm.get('numeroCasas')?.setValue(comunidad.cantidadViviendas || 0, { emitEvent: false });
          },
          error: (error) => {
            this.logger.error('Error loading community data', error, 'ContratoComponent');
          }
        });
      }
    });

    // Listener para calcular monto parcial cuando cambian costoTotal o numeroPagosParciales
    this.contratoForm.get('costoTotal')?.valueChanges.subscribe(() => {
      this.calcularMontoParcial();
    });

    this.contratoForm.get('numeroPagosParciales')?.valueChanges.subscribe(() => {
      this.calcularMontoParcial();
    });

    // Listener para validar fechaFin cuando cambia fechaInicio
    this.contratoForm.get('fechaInicio')?.valueChanges.subscribe(() => {
      this.contratoForm.get('fechaFin')?.updateValueAndValidity();
    });

    // Flags para evitar ejecuciones múltiples de los effects
    let createProcessed = false;
    let updateProcessed = false;
    let deleteProcessed = false;
    let editProcessed = false;
    let deleteLoadProcessed = false;

    // Effect para manejar la creación exitosa
    effect(() => {
      const result = this.createContratoResource.value();
      const request = this.createRequestSignal();
      if (result && request && !createProcessed) {
        createProcessed = true;
        this.logger.info('Contract created successfully', 'ContratoComponent', { response: result });
        this.notificationService.showSuccess(
          'Contrato creado exitosamente',
          'Éxito'
        );
        this.closeModal();
        this.refreshContratos();
        setTimeout(() => {
          this.createRequestSignal.set(null);
          createProcessed = false;
        }, 100);
      } else if (!request) {
        createProcessed = false;
      }
    });

    // Effect para manejar la actualización exitosa
    effect(() => {
      const result = this.updateContratoResource.value();
      const request = this.updateRequestSignal();
      if (result && request && !updateProcessed) {
        updateProcessed = true;
        this.logger.info('Contract updated successfully', 'ContratoComponent', { 
          id: result.id,
          response: result 
        });
        this.notificationService.showSuccess(
          'Contrato actualizado exitosamente',
          'Éxito'
        );
        this.editingContratoId = null;
        this.closeModal();
        this.refreshContratos();
        setTimeout(() => {
          this.updateRequestSignal.set(null);
          updateProcessed = false;
        }, 100);
      } else if (!request) {
        updateProcessed = false;
      }
    });

    // Effect para manejar la eliminación exitosa
    effect(() => {
      const result = this.deleteContratoActionResource.value();
      const deleteId = this.deleteIdSignal();
      if (result && deleteId && !deleteProcessed) {
        deleteProcessed = true;
        const contrato = this.contratoToDelete;
        if (contrato) {
          this.logger.debug(`Contract ${contrato.id} deleted successfully`, 'ContratoComponent');
          this.notificationService.showSuccess(
            `Contrato ${contrato.folioContrato} eliminado exitosamente`,
            'Éxito'
          );
          this.closeDeleteModal();
          this.refreshContratos();
          setTimeout(() => {
            this.deleteIdSignal.set(null);
            deleteProcessed = false;
          }, 100);
        }
      } else if (!deleteId) {
        deleteProcessed = false;
      }
    });

    // Effect para manejar la carga de contrato para editar
    effect(() => {
      const dto = this.editContratoResource.value();
      const editId = this.editContratoIdSignal();
      if (dto && dto.id && editId && !editProcessed) {
        editProcessed = true;
        this.editingContratoId = dto.id;
        this.logger.debug('Loading contract for edit', 'ContratoComponent', { 
          id: dto.id,
          folioContrato: dto.folioContrato 
        });

        // Formatear fechas para el input type="date"
        const formatDateForInput = (dateString: string | null | undefined): string => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        };

        // Si hay un comunidadId en la ruta, usarlo; si no, usar el del DTO
        const communityIdToUse = this.comunidadId() || dto.communityId;
        
        this.contratoForm.patchValue({
          communityId: communityIdToUse,
          tipoContrato: this.normalizeTipoContrato(dto.tipoContrato),
          folioContrato: dto.folioContrato,
          representanteComunidad: dto.representanteComunidad,
          costoTotal: dto.costoTotal,
          montoPagoParcial: dto.montoPagoParcial || 0,
          numeroPagosParciales: dto.numeroPagosParciales || 1,
          diaPago: dto.diaPago || 1,
          periodicidadPago: this.normalizePeriodicidadPago(dto.periodicidadPago),
          metodoPago: this.normalizeMetodoPago(dto.metodoPago),
          fechaFirma: formatDateForInput(dto.fechaFirma),
          fechaInicio: formatDateForInput(dto.fechaInicio),
          fechaFin: formatDateForInput(dto.fechaFin),
          numeroCasas: dto.numeroCasas,
          estadoContrato: this.normalizeEstadoContrato(dto.estadoContrato),
          asesorVentas: dto.asesorVentas || '',
          notas: dto.notas || '',
          documentosAdjuntos: dto.documentosAdjuntos || ''
        });
        
        // Si hay un comunidadId en la ruta, deshabilitar el campo
        if (this.comunidadId()) {
          this.contratoForm.get('communityId')?.disable();
        } else {
          this.contratoForm.get('communityId')?.enable();
        }
        
        // Deshabilitar fechaFirma y fechaInicio (solo lectura)
        this.contratoForm.get('fechaFirma')?.disable();
        this.contratoForm.get('fechaInicio')?.disable();
        
        // Habilitar fechaFin para que pueda ser modificada
        this.contratoForm.get('fechaFin')?.enable();
        
        this.openNewContratoModal();
        setTimeout(() => {
          this.editContratoIdSignal.set(null);
          editProcessed = false;
        }, 100);
      } else if (!editId) {
        editProcessed = false;
      }
    });

    // Effect para manejar la carga de contrato para eliminar
    effect(() => {
      const dto = this.deleteContratoResource.value();
      const deleteId = this.deleteContratoIdSignal();
      if (dto && deleteId && !deleteLoadProcessed) {
        deleteLoadProcessed = true;
        this.contratoToDelete = dto;
        this.showDeleteModal.set(true);
        setTimeout(() => {
          const modal = document.getElementById('deleteContratoModal') as HTMLDialogElement;
          if (modal) {
            modal.showModal();
          }
          this.deleteContratoIdSignal.set(null);
          deleteLoadProcessed = false;
        }, 0);
      } else if (!deleteId) {
        deleteLoadProcessed = false;
      }
    });
  }

  // Enums para los selects
  tiposContrato = Object.values(tipoContratoEnum);
  periodicidadesPago = Object.values(periodicidadPagoEnum);
  metodosPago = Object.values(metodoPagoEnum);
  estadosContrato = Object.values(estadoContratoEnum);

  // Configuración de columnas para la lista genérica
  contratoColumns: ColumnConfig[] = [
    { 
      key: 'folioContrato', 
      label: 'Folio',
      formatter: (value) => value || '-'
    },
    { 
      key: 'nombreComunidad', 
      label: 'Comunidad',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'tipoContrato', 
      label: 'Tipo',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'estadoContrato', 
      label: 'Estado',
      formatter: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
    },
    { 
      key: 'costoTotal', 
      label: 'Costo Total',
      formatter: (value) => value ? `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'
    },
    { 
      key: 'fechaInicio', 
      label: 'Fecha Inicio',
      formatter: (value) => {
        if (!value) return '-';
        try {
          const date = new Date(value);
          return date.toLocaleDateString('es-MX');
        } catch {
          return value;
        }
      }
    }
  ];

  // Formulario para crear/editar contratos
  contratoForm = this.fb.group({
    communityId: ['', Validators.required],
    tipoContrato: ['', Validators.required],
    folioContrato: ['', [Validators.required, Validators.minLength(3)]],
    representanteComunidad: ['', Validators.required],
    costoTotal: [0, [Validators.required, Validators.min(0)]],
    montoPagoParcial: [0, [Validators.required, Validators.min(0)]],
    numeroPagosParciales: [1, [Validators.required, Validators.min(1)]],
    diaPago: [1, [Validators.required, Validators.min(1), Validators.max(28)]],
    periodicidadPago: ['', Validators.required],
    metodoPago: ['', Validators.required],
    fechaFirma: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: [null as string | null, [this.fechaFinValidator.bind(this)]],
    numeroCasas: [0, [Validators.required, Validators.min(0)]],
    estadoContrato: ['', Validators.required],
    asesorVentas: [''],
    notas: [''],
    documentosAdjuntos: ['']
  });

  /**
   * Calcula automáticamente el monto parcial dividiendo el costo total entre el número de pagos parciales
   * Solo se ejecuta cuando se está creando un nuevo contrato (no al editar)
   */
  calcularMontoParcial(): void {
    // No calcular si se está editando un contrato existente
    if (this.editingContratoId) {
      return;
    }
    
    const costoTotal = this.contratoForm.get('costoTotal')?.value || 0;
    const numeroPagos = this.contratoForm.get('numeroPagosParciales')?.value || 1;
    
    if (costoTotal > 0 && numeroPagos > 0) {
      const montoParcial = costoTotal / numeroPagos;
      this.contratoForm.get('montoPagoParcial')?.setValue(Number(montoParcial.toFixed(2)), { emitEvent: false });
    }
  }

  /**
   * Validador personalizado para fechaFin: debe ser posterior a fechaInicio
   */
  fechaFinValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null; // fechaFin es opcional
    }

    const fechaInicio = this.contratoForm?.get('fechaInicio')?.value;
    if (!fechaInicio) {
      return null; // Si no hay fechaInicio, no podemos validar
    }

    try {
      const fechaInicioDate = new Date(fechaInicio);
      const fechaFinDate = new Date(control.value);

      if (fechaFinDate <= fechaInicioDate) {
        return { fechaFinInvalida: true };
      }
    } catch {
      return null; // Si hay error al parsear fechas, dejamos que otros validadores lo manejen
    }

    return null;
  }

  /**
   * Obtiene la fecha del día 1 del mes actual en formato ISO
   */
  private getFirstDayOfCurrentMonth(): string {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString().split('T')[0]; // Formato YYYY-MM-DD para input type="date"
  }

  /**
   * Obtiene la fecha de 1 año después de la fecha de inicio
   */
  private getOneYearAfter(fechaInicio: string): string {
    if (!fechaInicio) {
      return '';
    }
    try {
      const fecha = new Date(fechaInicio);
      fecha.setFullYear(fecha.getFullYear() + 1);
      return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD para input type="date"
    } catch {
      return '';
    }
  }

  /**
   * Normaliza el valor de tipoContrato del backend al valor del enum
   */
  private normalizeTipoContrato(tipoContrato: string | null | undefined): string {
    if (!tipoContrato) {
      return '';
    }
    const tipoLower = tipoContrato.toLowerCase().trim();
    const enumValues = Object.values(tipoContratoEnum);
    if (enumValues.includes(tipoLower as tipoContratoEnum)) {
      return tipoLower;
    }
    return '';
  }

  /**
   * Normaliza el valor de periodicidadPago del backend al valor del enum
   */
  private normalizePeriodicidadPago(periodicidadPago: string | null | undefined): string {
    if (!periodicidadPago) {
      return '';
    }
    const periodicidadLower = periodicidadPago.toLowerCase().trim();
    const enumValues = Object.values(periodicidadPagoEnum);
    if (enumValues.includes(periodicidadLower as periodicidadPagoEnum)) {
      return periodicidadLower;
    }
    return '';
  }

  /**
   * Normaliza el valor de metodoPago del backend al valor del enum
   */
  private normalizeMetodoPago(metodoPago: string | null | undefined): string {
    if (!metodoPago) {
      return '';
    }
    const metodoLower = metodoPago.toLowerCase().trim();
    const enumValues = Object.values(metodoPagoEnum);
    if (enumValues.includes(metodoLower as metodoPagoEnum)) {
      return metodoLower;
    }
    return '';
  }

  /**
   * Normaliza el valor de estadoContrato del backend al valor del enum
   */
  private normalizeEstadoContrato(estadoContrato: string | null | undefined): string {
    if (!estadoContrato) {
      return '';
    }
    const estadoLower = estadoContrato.toLowerCase().trim();
    const enumValues = Object.values(estadoContratoEnum);
    if (enumValues.includes(estadoLower as estadoContratoEnum)) {
      return estadoLower;
    }
    // Manejar "en renovación" con espacio
    if (estadoLower === 'en renovacion' || estadoLower === 'en_renovacion') {
      return estadoContratoEnum.EN_RENOVACION;
    }
    return '';
  }

  /**
   * Refresca la lista de contratos
   */
  refreshContratos(): void {
    this.refreshTrigger.update(v => v + 1);
    this.contractsResource.refetch();
  }

  /**
   * Maneja el clic en una fila de la lista (mostrar información)
   */
  onContratoClick(contrato: Contrato): void {
    this.selectedContrato = contrato;
    this.showInfoModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('infoContratoModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Maneja la edición de un contrato
   */
  onEditContrato(contrato: Contrato): void {
    if (!contrato.id) {
      this.notificationService.showError('No se pudo obtener el ID del contrato', 'Error');
      return;
    }

    this.editContratoIdSignal.set(contrato.id);
    this.editContratoResource.refetch();
  }

  /**
   * Maneja la eliminación de un contrato
   */
  onDeleteContrato(contrato: Contrato): void {
    if (!contrato.id) {
      this.notificationService.showError('No se pudo obtener el ID del contrato', 'Error');
      return;
    }

    this.deleteContratoIdSignal.set(contrato.id);
    this.deleteContratoResource.refetch();
  }

  /**
   * Determina si un contrato puede ser eliminado (siempre false - no se permite eliminar)
   */
  canDeleteContrato(contrato: Contrato): boolean {
    return false;
  }

  /**
   * Confirma la eliminación del contrato
   */
  confirmDeleteContrato(): void {
    if (!this.contratoToDelete) {
      return;
    }

    const contrato = this.contratoToDelete;
    this.deleteIdSignal.set(contrato.id);
    this.deleteContratoActionResource.refetch();
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    const modal = document.getElementById('deleteContratoModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showDeleteModal.set(false);
    this.contratoToDelete = null;
  }

  /**
   * Cierra el modal de información
   */
  closeInfoModal(): void {
    const modal = document.getElementById('infoContratoModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showInfoModal.set(false);
    this.selectedContrato = null;
  }

  /**
   * Imprime la información del contrato
   */
  imprimirContrato(): void {
    if (!this.selectedContrato) {
      return;
    }

    const contenido = document.getElementById('contratoContent');
    if (!contenido) {
      this.notificationService.showError('No se pudo obtener el contenido para imprimir', 'Error');
      return;
    }

    // Crear una ventana nueva para imprimir
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      this.notificationService.showError('No se pudo abrir la ventana de impresión. Por favor, permite ventanas emergentes.', 'Error');
      return;
    }

    // Obtener el HTML del contenido
    const htmlContenido = contenido.innerHTML;
    
    // Crear el HTML completo para imprimir
    const htmlCompleto = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contrato ${this.selectedContrato.folioContrato}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 12pt;
                line-height: 1.6;
                color: #000;
              }
              h3 {
                font-size: 18pt;
                margin-bottom: 10px;
                color: #000;
              }
              h4 {
                font-size: 14pt;
                margin-top: 15px;
                margin-bottom: 10px;
                color: #000;
              }
              hr {
                border: none;
                border-top: 1px solid #000;
                margin: 10px 0;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 10px 0;
              }
              .grid-cols-3 {
                grid-template-columns: repeat(3, 1fr);
              }
              strong {
                font-weight: bold;
              }
              .py-2 {
                padding: 8px 0;
              }
              .mt-2 {
                margin-top: 8px;
              }
              .mb-2 {
                margin-bottom: 8px;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              padding: 20px;
            }
            h3 {
              font-size: 18pt;
              margin-bottom: 10px;
            }
            h4 {
              font-size: 14pt;
              margin-top: 15px;
              margin-bottom: 10px;
            }
            hr {
              border: none;
              border-top: 1px solid #ccc;
              margin: 10px 0;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin: 10px 0;
            }
            .grid-cols-3 {
              grid-template-columns: repeat(3, 1fr);
            }
            strong {
              font-weight: bold;
            }
            .py-2 {
              padding: 8px 0;
            }
            .mt-2 {
              margin-top: 8px;
            }
            .mb-2 {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <h3>Contrato: ${this.selectedContrato.folioContrato}</h3>
          <hr />
          ${htmlContenido}
        </body>
      </html>
    `;

    ventanaImpresion.document.write(htmlCompleto);
    ventanaImpresion.document.close();
    
    // Esperar a que se cargue el contenido y luego imprimir
    ventanaImpresion.onload = () => {
      setTimeout(() => {
        ventanaImpresion.print();
        ventanaImpresion.close();
      }, 250);
    };
  }

  /**
   * Abre el modal de registro de contrato
   */
  openNewContratoModal(): void {
    this.showModal.set(true);
    setTimeout(() => {
      const modal = document.getElementById('newContratoModal') as HTMLDialogElement;
      if (modal) {
        modal.showModal();
      }
    }, 0);
  }

  /**
   * Abre el modal para nuevo contrato (sin datos)
   */
  openNewContratoModalForCreate(): void {
    this.editingContratoId = null;
    // Si hay un comunidadId en la ruta, pre-llenar el campo
    const defaultCommunityId = this.comunidadId() || '';
    const fechaPrimerDia = this.getFirstDayOfCurrentMonth();
    const fechaUnAnoDespues = this.getOneYearAfter(fechaPrimerDia);
    
    this.contratoForm.reset({
      communityId: defaultCommunityId,
      tipoContrato: '',
      folioContrato: '',
      representanteComunidad: '',
      costoTotal: 0,
      montoPagoParcial: 0,
      numeroPagosParciales: 1,
      diaPago: 1,
      periodicidadPago: '',
      metodoPago: '',
      fechaFirma: fechaPrimerDia,
      fechaInicio: fechaPrimerDia,
      fechaFin: fechaUnAnoDespues,
      numeroCasas: 0,
      estadoContrato: estadoContratoEnum.ACTIVO, // Estado por defecto: activo
      asesorVentas: '',
      notas: '',
      documentosAdjuntos: ''
    });
    
    // Si hay un comunidadId, deshabilitar el selector de comunidad y cargar número de casas
    if (this.comunidadId()) {
      this.contratoForm.get('communityId')?.disable();
      // Cargar número de casas de la comunidad
      this.communitiesService.getCommunityById(this.comunidadId()!).subscribe({
        next: (comunidad) => {
          this.contratoForm.get('numeroCasas')?.setValue(comunidad.cantidadViviendas || 0, { emitEvent: false });
        },
        error: (error) => {
          this.logger.error('Error loading community data', error, 'ContratoComponent');
        }
      });
    } else {
      this.contratoForm.get('communityId')?.enable();
    }
    
    // Habilitar todas las fechas para que puedan ser modificadas al crear
    this.contratoForm.get('fechaFirma')?.enable();
    this.contratoForm.get('fechaInicio')?.enable();
    this.contratoForm.get('fechaFin')?.enable();
    
    this.openNewContratoModal();
  }

  /**
   * Cierra el modal de registro de contrato
   */
  closeModal(): void {
    const modal = document.getElementById('newContratoModal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    this.showModal.set(false);
    this.editingContratoId = null;
    this.contratoForm.reset({
      communityId: '',
      tipoContrato: '',
      folioContrato: '',
      representanteComunidad: '',
      costoTotal: 0,
      montoPagoParcial: 0,
      numeroPagosParciales: 1,
      diaPago: 1,
      periodicidadPago: '',
      metodoPago: '',
      fechaFirma: '',
      fechaInicio: '',
      fechaFin: null,
      numeroCasas: 0,
      estadoContrato: '',
      asesorVentas: '',
      notas: '',
      documentosAdjuntos: ''
    });
    
    // Habilitar todos los campos al cerrar
    this.contratoForm.get('fechaFirma')?.enable();
    this.contratoForm.get('fechaInicio')?.enable();
    this.contratoForm.get('fechaFin')?.enable();
  }

  /**
   * Guarda o actualiza un contrato
   */
  saveContrato(): void {
    if (this.contratoForm.invalid) {
      this.contratoForm.markAllAsTouched();
      this.notificationService.showWarning(
        'Por favor, complete todos los campos requeridos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    // Usar getRawValue() para obtener valores incluso si los campos están deshabilitados
    const formValue = this.contratoForm.getRawValue();
    
    // Convertir fechas a formato ISO
    const formatDateToISO = (dateString: string | null | undefined): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString();
      } catch {
        return '';
      }
    };
    
    // Validar que communityId esté presente
    // Prioridad: 1) formValue (incluye valores deshabilitados), 2) comunidadId de la ruta, 3) valor del control
    const communityId = formValue.communityId || 
                       this.comunidadId() || 
                       this.contratoForm.get('communityId')?.value || 
                       '';
    
    if (!communityId || communityId.trim() === '') {
      this.notificationService.showError(
        'La comunidad es requerida',
        'Error de validación'
      );
      return;
    }
    
    // Validar formato GUID
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidPattern.test(communityId.trim())) {
      this.logger.error('Invalid GUID format for communityId', null, 'ContratoComponent', { 
        communityId,
        formValue: formValue.communityId,
        routeId: this.comunidadId(),
        controlValue: this.contratoForm.get('communityId')?.value
      });
      this.notificationService.showError(
        'El ID de la comunidad no tiene un formato válido',
        'Error de validación'
      );
      return;
    }
    
    const request: CreateContratoRequest | UpdateContratoRequest = {
      communityId: communityId,
      tipoContrato: formValue.tipoContrato || '',
      folioContrato: formValue.folioContrato || '',
      representanteComunidad: formValue.representanteComunidad || '',
      costoTotal: formValue.costoTotal || 0,
      montoPagoParcial: formValue.montoPagoParcial || 0,
      numeroPagosParciales: formValue.numeroPagosParciales || 1,
      diaPago: formValue.diaPago || 1,
      periodicidadPago: formValue.periodicidadPago || '',
      metodoPago: formValue.metodoPago || '',
      fechaFirma: formatDateToISO(formValue.fechaFirma),
      fechaInicio: formatDateToISO(formValue.fechaInicio),
      fechaFin: formValue.fechaFin ? formatDateToISO(formValue.fechaFin) : null,
      numeroCasas: formValue.numeroCasas || 0,
      estadoContrato: formValue.estadoContrato || '',
      asesorVentas: formValue.asesorVentas || null,
      notas: formValue.notas || null,
      documentosAdjuntos: formValue.documentosAdjuntos || null
    };

    // Validar que tenemos un ID si estamos editando
    if (this.editingContratoId && this.editingContratoId.trim() !== '') {
      const contratoId = this.editingContratoId.trim();
      this.logger.debug('Updating contract', 'ContratoComponent', { 
        id: contratoId,
        request 
      });
      
      // Validar formato de GUID
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!guidPattern.test(contratoId)) {
        this.logger.error('Invalid GUID format', null, 'ContratoComponent', { id: contratoId });
        this.notificationService.showError(
          'El ID del contrato no tiene un formato válido',
          'Error'
        );
        return;
      }
      
      this.updateRequestSignal.set({ id: contratoId, request: request as UpdateContratoRequest });
      this.updateContratoResource.refetch();
    } else {
      this.logger.debug('Creating new contract', 'ContratoComponent', { request });
      
      this.createRequestSignal.set(request as CreateContratoRequest);
      this.createContratoResource.refetch();
    }
  }
}
