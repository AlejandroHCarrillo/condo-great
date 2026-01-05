import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { preferenciasData } from '../../../shared/data/preferencias.data';
import { Preferencia, PreferenciaUsuario } from '../../../shared/interfaces/preferencia.interface';
import { AuthService } from '../../../services/auth.service';
import { ShowFormErrorTemplateComponent } from '../../../shared/show-form-error-template/show-form-error-template.component';
import { FormUtils } from '../../../utils/form-utils';

@Component({
  selector: 'app-registro-preferencias',
  imports: [CommonModule, ReactiveFormsModule, ShowFormErrorTemplateComponent],
  templateUrl: './registro-preferencias.component.html',
  styleUrl: './registro-preferencias.component.css'
})
export class RegistroPreferenciasComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  formUtils = FormUtils;
  preferenciasList: Preferencia[] = preferenciasData;
  preferenciasForm: FormGroup;
  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor() {
    // Crear el formulario con un FormArray para las preferencias
    this.preferenciasForm = this.fb.group({
      preferencias: this.fb.array([])
    });

    // Inicializar los controles para cada preferencia
    this.initializePreferencias();
  }

  /**
   * Inicializa los controles del formulario para cada preferencia
   */
  private initializePreferencias(): void {
    const preferenciasArray = this.preferenciasForm.get('preferencias') as FormArray;
    
    this.preferenciasList.forEach((preferencia) => {
      if (preferencia.opciones && preferencia.opciones.length > 0) {
        // Si tiene opciones, crear un FormArray para checkboxes múltiples
        const opcionesArray = this.fb.array(
          preferencia.opciones.map(() => this.fb.control(false))
        );
        preferenciasArray.push(
          this.fb.group({
            idPreferencia: [preferencia.id],
            tipo: ['opciones'],
            valores: opcionesArray,
            valorTexto: [null] // No se usa cuando hay opciones
          })
        );
      } else {
        // Si no tiene opciones, crear un control de texto
        preferenciasArray.push(
          this.fb.group({
            idPreferencia: [preferencia.id],
            tipo: ['texto'],
            valores: [null], // No se usa cuando es texto
            valorTexto: ['', Validators.required]
          })
        );
      }
    });
  }

  /**
   * Obtiene el FormArray de preferencias
   */
  get preferenciasArray(): FormArray {
    return this.preferenciasForm.get('preferencias') as FormArray;
  }

  /**
   * Obtiene el FormGroup de una preferencia específica
   */
  getPreferenciaGroup(index: number): FormGroup {
    return this.preferenciasArray.at(index) as FormGroup;
  }

  /**
   * Obtiene el FormArray de opciones para una preferencia con opciones
   */
  getOpcionesArray(index: number): FormArray {
    return this.getPreferenciaGroup(index).get('valores') as FormArray;
  }

  /**
   * Obtiene el FormControl de una opción específica
   */
  getOpcionControl(index: number, opcionIndex: number): FormControl {
    return this.getOpcionesArray(index).at(opcionIndex) as FormControl;
  }

  /**
   * Obtiene el FormControl del valor de texto de una preferencia
   */
  getValorTextoControl(index: number): FormControl {
    return this.getPreferenciaGroup(index).get('valorTexto') as FormControl;
  }

  /**
   * Verifica si una preferencia tiene opciones
   */
  hasOpciones(index: number): boolean {
    const preferencia = this.preferenciasList[index];
    return !!(preferencia.opciones && preferencia.opciones.length > 0);
  }

  /**
   * Obtiene las opciones de una preferencia
   */
  getOpciones(index: number): string[] {
    return this.preferenciasList[index].opciones || [];
  }

  /**
   * Guarda las preferencias del usuario
   */
  onSave(): void {
    if (this.preferenciasForm.invalid) {
      this.preferenciasForm.markAllAsTouched();
      this.errorMessage.set('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const currentUser = this.authService.currentUser();
    const idResidente = currentUser?.id || '';

    if (!idResidente) {
      this.errorMessage.set('No se pudo obtener el ID del residente. Por favor, inicia sesión nuevamente.');
      this.isLoading.set(false);
      return;
    }

    // Generar la lista de PreferenciaUsuario
    const preferenciasUsuario: PreferenciaUsuario[] = [];
    const preferenciasArray = this.preferenciasForm.get('preferencias') as FormArray;

    preferenciasArray.controls.forEach((control, index) => {
      const preferenciaGroup = control as FormGroup;
      const tipo = preferenciaGroup.get('tipo')?.value;
      const idPreferencia = preferenciaGroup.get('idPreferencia')?.value;

      if (tipo === 'opciones') {
        // Obtener las opciones seleccionadas
        const opcionesArray = preferenciaGroup.get('valores') as FormArray;
        const valoresSeleccionados: string[] = [];
        
        opcionesArray.controls.forEach((opcionControl, opcionIndex) => {
          if (opcionControl.value) {
            const opciones = this.getOpciones(index);
            if (opciones[opcionIndex]) {
              valoresSeleccionados.push(opciones[opcionIndex]);
            }
          }
        });

        // Solo agregar si hay valores seleccionados
        if (valoresSeleccionados.length > 0) {
          preferenciasUsuario.push({
            idResidente,
            idPreferencia,
            valores: valoresSeleccionados
          });
        }
      } else {
        // Obtener el valor de texto
        const valorTexto = preferenciaGroup.get('valorTexto')?.value;
        if (valorTexto && valorTexto.trim() !== '') {
          preferenciasUsuario.push({
            idResidente,
            idPreferencia,
            valores: [valorTexto.trim()]
          });
        }
      }
    });

    // Aquí puedes hacer la llamada a la API para guardar las preferencias
    console.log('Preferencias del usuario a guardar:', preferenciasUsuario);

    // Simular guardado (reemplazar con llamada real a la API)
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set('Preferencias guardadas exitosamente.');
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        this.successMessage.set(null);
      }, 5000);
    }, 1000);
  }
}
