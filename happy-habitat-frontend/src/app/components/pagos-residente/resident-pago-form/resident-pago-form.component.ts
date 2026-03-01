import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { AuthService } from '../../../services/auth.service';
import { FileService } from '../../../services/file.service';
import { ImageUrlService } from '../../../services/image-url.service';
import {
  FileUploadComponent,
  type AllowedFileType,
  type MaxSizesByType
} from '../../../shared/components/file-upload/file-upload.component';
import { pagoComprobanteBasePath, pagoComprobanteUploadPath } from '../../../constants/upload-paths';
import type { CreatePagosResidenteDto, UpdatePagosResidenteDto } from '../../../shared/interfaces/pagos-residente.interface';

@Component({
  selector: 'hh-resident-pago-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './resident-pago-form.component.html'
})
export class ResidentPagoFormComponent {
  private pagosService = inject(PagosResidenteService);
  private authService = inject(AuthService);
  private fileService = inject(FileService);
  private imageUrlService = inject(ImageUrlService);
  private router = inject(Router);

  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  readonly fileUploadMaxFiles = 1;
  readonly fileUploadAllowedTypes: AllowedFileType[] = ['image', 'document'];
  readonly fileUploadMaxSizes: MaxSizesByType = {
    image: 5 * 1024 * 1024,
    document: 5 * 1024 * 1024
  };
  fileUploadSavePath = computed(() => {
    const communityId = this.authService.currentUser()?.residentInfo?.comunidad?.id;
    const residentId = this.authService.currentUser()?.residentInfo?.id;
    if (communityId && residentId) return pagoComprobanteBasePath(communityId, residentId);
    return '';
  });

  selectedFiles = signal<File[]>([]);

  form = {
    fechaPago: new Date().toISOString().slice(0, 10),
    monto: 0 as number,
    concepto: '' as string,
    nota: '' as string
  };

  onFilesChange(files: File[]): void {
    this.selectedFiles.set(files);
  }

  submit(): void {
    this.errorMessage.set(null);
    const residentId = this.authService.currentUser()?.residentInfo?.id;
    if (!residentId) {
      this.errorMessage.set('No se pudo identificar tu registro de residente.');
      return;
    }
    if (!this.form.fechaPago?.trim()) {
      this.errorMessage.set('La fecha de pago es obligatoria.');
      return;
    }
    if (this.form.monto < 0) {
      this.errorMessage.set('El monto no puede ser negativo.');
      return;
    }
    if (Number(this.form.monto) === 0) {
      const confirmarCero = window.confirm(
        'El monto es $0. ¿Confirma que desea registrar este pago con monto cero?'
      );
      if (!confirmarCero) return;
    }

    this.isSaving.set(true);
    const communityId = this.authService.currentUser()?.residentInfo?.comunidad?.id ?? '';
    const dto: CreatePagosResidenteDto = {
      residenteId: residentId,
      fechaPago: new Date(this.form.fechaPago).toISOString(),
      monto: Number(this.form.monto),
      status: 'PorConfirmar',
      concepto: this.form.concepto?.trim() || undefined,
      nota: this.form.nota?.trim() || undefined,
      createdByUserId: this.authService.currentUser()?.id ?? undefined
    };

    const filesToUpload = this.selectedFiles();
    this.pagosService.create(dto).pipe(
      switchMap((pago) => {
        if (filesToUpload.length > 0 && communityId && pago.id) {
          const file = filesToUpload[0];
          const fileName = this.imageUrlService.uniqueFileName(file.name);
          const path = `${pagoComprobanteUploadPath(communityId, residentId, pago.id)}/${fileName}`;
          return this.fileService.uploadFile(file, path).pipe(
            switchMap((res) =>
              this.pagosService.update(pago.id, {
                residenteId: pago.residenteId,
                fechaPago: dto.fechaPago,
                monto: dto.monto,
                status: dto.status,
                concepto: dto.concepto,
                urlComprobante: res.relativePath,
                nota: dto.nota,
                updatedByUserId: dto.createdByUserId ?? undefined
              }).pipe(
                switchMap(() => of(pago))
              )
            )
          );
        }
        return of(pago);
      })
    ).subscribe({
      next: (pago) => {
        this.isSaving.set(false);
        this.router.navigate(['/resident', 'pagos', pago.id]);
      },
      error: () => {
        this.errorMessage.set('No se pudo registrar el pago o subir el comprobante. Intenta de nuevo.');
        this.isSaving.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/resident', 'pagos']);
  }
}
