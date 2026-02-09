import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericListComponent, ColumnConfig } from '../../../shared/components/generic-list/generic-list.component';
import { ChargesService, CargoComunidadDto, PagoComunidadDto, StatementDto } from '../../../services/charges.service';
import { CommunitiesService } from '../../../services/communities.service';
import { ContractsService } from '../../../services/contracts.service';
import { LoggerService } from '../../../services/logger.service';
import { NotificationService } from '../../../services/notification.service';
import { rxResource } from '../../../utils/rx-resource.util';
import { catchError, of } from 'rxjs';

interface StatementItem {
  id: string;
  tipo: 'cargo' | 'pago';
  fecha: string;
  concepto: string;
  monto: number;
  estatus?: string;
  formaPago?: string;
  montoAplicado?: number;
  montoTotal?: number;
  saldo: number; // Saldo acumulado
}

@Component({
  selector: 'hh-statement',
  standalone: true,
  imports: [CommonModule, GenericListComponent],
  templateUrl: './statement.component.html',
  styles: ``
})
export class StatementComponent {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private chargesService = inject(ChargesService);
  private communitiesService = inject(CommunitiesService);
  private contractsService = inject(ContractsService);
  private logger = inject(LoggerService);
  private notificationService = inject(NotificationService);

  // Signals para los parámetros de ruta
  contratoId = signal<string | null>(null);
  comunidadId = signal<string | null>(null);
  comunidadNombre = signal<string>('');
  contratoFolio = signal<string>('');

  // Resource para cargar el estado de cuenta
  statementResource = rxResource({
    request: () => ({
      contratoId: this.contratoId(),
      comunidadId: this.comunidadId()
    }),
    loader: ({ request }) => {
      if (request.contratoId) {
        return this.chargesService.getStatementByContratoId(request.contratoId).pipe(
          catchError((error) => {
            this.logger.error('Error loading statement by contract', error, 'StatementComponent');
            this.notificationService.showError(
              'Error al cargar el estado de cuenta del contrato. Por favor, intenta nuevamente.',
              'Error'
            );
            return of({ cargos: [], pagos: [] } as StatementDto);
          })
        );
      } else if (request.comunidadId) {
        return this.chargesService.getStatementByComunidadId(request.comunidadId).pipe(
          catchError((error) => {
            this.logger.error('Error loading statement by community', error, 'StatementComponent');
            this.notificationService.showError(
              'Error al cargar el estado de cuenta de la comunidad. Por favor, intenta nuevamente.',
              'Error'
            );
            return of({ cargos: [], pagos: [] } as StatementDto);
          })
        );
      }
      return of({ cargos: [], pagos: [] } as StatementDto);
    }
  });

  // Combinar cargos y pagos en una lista unificada
  statementItems = computed(() => {
    const statement = this.statementResource.value();
    if (!statement) return [];

    const items: StatementItem[] = [];

    // Agregar cargos
    statement.cargos.forEach(cargo => {
      items.push({
        id: cargo.id,
        tipo: 'cargo',
        fecha: cargo.fechaDePago,
        concepto: `Cargo - ${cargo.estatus}`,
        monto: cargo.montoCargo + cargo.montoRecargos,
        estatus: cargo.estatus,
        montoTotal: cargo.montoCargo + cargo.montoRecargos,
        saldo: 0 // Se calculará después
      });
    });

    // Agregar pagos
    statement.pagos.forEach(pago => {
      const montoTotalAplicado = pago.pagoCargos?.reduce((sum, pc) => sum + pc.montoAplicado, 0) || pago.montoPago;
      items.push({
        id: pago.id,
        tipo: 'pago',
        fecha: pago.fechaDePago,
        concepto: `Pago - ${pago.formaDePago}`,
        monto: pago.montoPago,
        formaPago: pago.formaDePago,
        montoAplicado: montoTotalAplicado,
        saldo: 0 // Se calculará después
      });
    });

    // Ordenar por fecha (más antiguo primero)
    const sortedItems = items.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateA - dateB;
    });

    // Calcular saldo acumulado
    let saldoAcumulado = 0;
    return sortedItems.map(item => {
      if (item.tipo === 'cargo') {
        saldoAcumulado += item.monto; // Sumar cargos
      } else {
        saldoAcumulado -= item.monto; // Restar pagos
      }
      return {
        ...item,
        saldo: saldoAcumulado
      };
    });
  });

  // Configuración de columnas para la lista
  statementColumns: ColumnConfig[] = [
    {
      key: 'fecha',
      label: 'Fecha',
      formatter: (value, item: StatementItem) => {
        try {
          const date = new Date(value);
          const fechaFormateada = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
          // Si es un cargo vencido, aplicar color rojo
          if (item.tipo === 'cargo' && item.estatus === 'vencido') {
            return `<span class="text-error font-semibold">${fechaFormateada}</span>`;
          }
          return fechaFormateada;
        } catch {
          return value;
        }
      },
      isHtml: true
    },
    {
      key: 'concepto',
      label: 'Concepto',
      formatter: (value, item: StatementItem) => {
        // Si es un cargo vencido, aplicar color rojo
        if (item.tipo === 'cargo' && item.estatus === 'vencido') {
          return `<span class="text-error font-semibold">${value}</span>`;
        }
        return value;
      },
      isHtml: true
    },
    {
      key: 'cargos',
      label: 'Cargos',
      formatter: (value, item: StatementItem) => {
        if (item.tipo === 'cargo') {
          const montoFormateado = `$${Number(item.monto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          // Si es un cargo vencido, aplicar color rojo
          if (item.estatus === 'vencido') {
            return `<span class="text-error font-semibold">${montoFormateado}</span>`;
          }
          return montoFormateado;
        }
        return '-';
      },
      isHtml: true
    },
    {
      key: 'pagos',
      label: 'Pagos',
      formatter: (value, item: StatementItem) => {
        if (item.tipo === 'pago') {
          return `$${Number(item.monto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return '-';
      }
    },
    {
      key: 'saldo',
      label: 'Saldo',
      formatter: (value) => {
        if (value === null || value === undefined) return '$0.00';
        const saldo = Number(value);
        if (isNaN(saldo)) return '$0.00';
        const formatted = `$${Math.abs(saldo).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return saldo < 0 ? `(${formatted})` : formatted;
      }
    }
  ];

  constructor() {
    // Obtener parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      const contratoIdParam = params.get('contratoId');
      const comunidadIdParam = params.get('comunidadId');

      if (contratoIdParam) {
        this.contratoId.set(contratoIdParam);
        this.comunidadId.set(null);
        // Cargar información del contrato
        this.contractsService.getContratoById(contratoIdParam).subscribe({
          next: (contrato) => {
            this.contratoFolio.set(contrato.folioContrato);
            this.comunidadId.set(contrato.communityId);
            // Cargar nombre de la comunidad
            this.communitiesService.getCommunityById(contrato.communityId).subscribe({
              next: (comunidad) => {
                this.comunidadNombre.set(comunidad.nombre);
              },
              error: (error) => {
                this.logger.error('Error loading community name', error, 'StatementComponent');
              }
            });
          },
          error: (error) => {
            this.logger.error('Error loading contract', error, 'StatementComponent');
          }
        });
      } else if (comunidadIdParam) {
        this.comunidadId.set(comunidadIdParam);
        this.contratoId.set(null);
        // Cargar nombre de la comunidad
        this.communitiesService.getCommunityById(comunidadIdParam).subscribe({
          next: (comunidad) => {
            this.comunidadNombre.set(comunidad.nombre);
          },
          error: (error) => {
            this.logger.error('Error loading community name', error, 'StatementComponent');
          }
        });
      }

      // Refrescar el resource cuando cambien los parámetros
      this.statementResource.refetch();
    });
  }

  /**
   * Calcula el saldo total (cargos - pagos)
   */
  calcularSaldoTotal(): number {
    const statement = this.statementResource.value();
    if (!statement) return 0;

    const totalCargos = statement.cargos.reduce((sum, cargo) => sum + cargo.montoCargo + cargo.montoRecargos, 0);
    const totalPagos = statement.pagos.reduce((sum, pago) => sum + pago.montoPago, 0);

    return totalCargos - totalPagos;
  }

  /**
   * Calcula el total de cargos
   */
  calcularTotalCargos(): number {
    const statement = this.statementResource.value();
    if (!statement) return 0;

    return statement.cargos.reduce((sum, cargo) => sum + cargo.montoCargo + cargo.montoRecargos, 0);
  }

  /**
   * Calcula el total de pagos
   */
  calcularTotalPagos(): number {
    const statement = this.statementResource.value();
    if (!statement) return 0;

    return statement.pagos.reduce((sum, pago) => sum + pago.montoPago, 0);
  }

  /**
   * Imprime el estado de cuenta
   */
  imprimirEstadoCuenta(): void {
    const statement = this.statementResource.value();
    if (!statement) {
      this.notificationService.showError('No hay datos para imprimir', 'Error');
      return;
    }

    // Crear una ventana nueva para imprimir
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      this.notificationService.showError('No se pudo abrir la ventana de impresión. Por favor, permite ventanas emergentes.', 'Error');
      return;
    }

    // Obtener información del encabezado
    // El nombre de la comunidad va arriba y más grande
    const nombreComunidad = this.comunidadNombre() || 'N/A';
    const numeroContrato = this.contratoFolio() || '';

    // Generar tabla de movimientos
    const items = this.statementItems();
    let tablaMovimientos = '';
    
    if (items.length === 0) {
      tablaMovimientos = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay movimientos registrados</td></tr>';
    } else {
      tablaMovimientos = items.map(item => {
        const fecha = new Date(item.fecha).toLocaleDateString('es-MX', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
        const cargos = item.tipo === 'cargo' 
          ? `$${Number(item.monto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '-';
        const pagos = item.tipo === 'pago'
          ? `$${Number(item.monto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '-';
        const saldo = `$${Math.abs(item.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const saldoFormateado = item.saldo < 0 ? `(${saldo})` : saldo;
        const colorCargo = item.tipo === 'cargo' && item.estatus === 'vencido' ? 'color: red; font-weight: bold;' : '';
        
        return `
          <tr style="${colorCargo}">
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${fecha}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.concepto}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${cargos}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${pagos}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${saldoFormateado}</td>
          </tr>
        `;
      }).join('');
    }

    // Crear el HTML completo para imprimir
    const htmlCompleto = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estado de Cuenta - ${nombreComunidad}${numeroContrato ? ` - Contrato: ${numeroContrato}` : ''}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page {
                margin: 1cm;
                size: A4;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.4;
                color: #000;
              }
              h1 {
                font-size: 20pt;
                margin-bottom: 5px;
                color: #000;
              }
              h2 {
                font-size: 14pt;
                margin-top: 20px;
                margin-bottom: 10px;
                color: #000;
              }
              .resumen {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin: 20px 0;
                padding: 15px;
                border: 1px solid #000;
              }
              .resumen-item {
                text-align: center;
              }
              .resumen-label {
                font-size: 11pt;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .resumen-valor {
                font-size: 16pt;
                font-weight: bold;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
              }
              th {
                background-color: #f0f0f0;
                padding: 10px;
                text-align: left;
                border-bottom: 2px solid #000;
                font-weight: bold;
              }
              td {
                padding: 8px;
                border-bottom: 1px solid #ddd;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .fecha-impresion {
                margin-top: 20px;
                font-size: 9pt;
                color: #666;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
              color: #000;
            }
            h1 {
              font-size: 24pt;
              margin-bottom: 5px;
              color: #000;
              font-weight: bold;
            }
            .subtitulo-contrato {
              font-size: 12pt;
              margin-bottom: 15px;
              color: #666;
            }
            h2 {
              font-size: 14pt;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #000;
            }
            .resumen {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
              padding: 15px;
              border: 1px solid #000;
            }
            .resumen-item {
              text-align: center;
            }
            .resumen-label {
              font-size: 11pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .resumen-valor {
              font-size: 16pt;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th {
              background-color: #f0f0f0;
              padding: 10px;
              text-align: left;
              border-bottom: 2px solid #000;
              font-weight: bold;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .fecha-impresion {
              margin-top: 20px;
              font-size: 9pt;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>${nombreComunidad}</h1>
          ${numeroContrato ? `<p class="subtitulo-contrato">Contrato: ${numeroContrato}</p>` : ''}
          <h2>Estado de Cuenta</h2>
          
          <div class="resumen">
            <div class="resumen-item">
              <div class="resumen-label">Total Cargos</div>
              <div class="resumen-valor" style="color: red;">
                $${this.calcularTotalCargos().toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div class="resumen-item">
              <div class="resumen-label">Total Pagos</div>
              <div class="resumen-valor" style="color: green;">
                $${this.calcularTotalPagos().toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div class="resumen-item">
              <div class="resumen-label">Saldo Total</div>
              <div class="resumen-valor" style="color: ${this.calcularSaldoTotal() > 0 ? 'red' : 'green'};">
                $${this.calcularSaldoTotal().toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <h2>Movimientos</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th class="text-right">Cargos</th>
                <th class="text-right">Pagos</th>
                <th class="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${tablaMovimientos}
            </tbody>
          </table>

          <div class="fecha-impresion">
            Impreso el: ${new Date().toLocaleDateString('es-MX', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </body>
      </html>
    `;

    // Escribir el HTML y abrir el diálogo de impresión
    ventanaImpresion.document.write(htmlCompleto);
    ventanaImpresion.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    ventanaImpresion.onload = () => {
      setTimeout(() => {
        ventanaImpresion.print();
      }, 250);
    };
  }
}
