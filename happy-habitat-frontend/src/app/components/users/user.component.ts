import { SelectOption } from './../../shared/interfaces/select-option.inteface';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { FormUtils } from '../../utils/form-utils';
import { rolesData } from '../../shared/data/roles.data';
import { JsonPipe } from '@angular/common';
import { ShowFormErrorTemplateComponent } from '../../shared/show-form-error-template/show-form-error-template.component';
import { comunidadesData } from '../../shared/data/comunidades.data';
import { ComunidadMapper } from '../proveedores-residentes/mappers/comunidad-selectoption.mapper';
import { Router } from '@angular/router';

@Component({
  selector: 'hh-user-edit',
  imports: [ReactiveFormsModule, ShowFormErrorTemplateComponent, JsonPipe],
  templateUrl: './user.component.html',
  styles: ``
})
export class UserComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  formUtils = FormUtils;

  roles = rolesData;

  allcomunities = [...comunidadesData];
  comunidadesCombo = ComunidadMapper.mapComunidadesToSelectOptionsArray(this.allcomunities);
  comunidadesSeleccionadas : SelectOption[] = [];

  myForm = this.fb.group({
    fullname: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    address: ['', [Validators.required, Validators.minLength(1)]],
    role: ['', Validators.required],
    comunidades: this.fb.array([], [Validators.required, Validators.minLength(2)]),
  });

  // newComunidad = new FormControl('dummy', [Validators.minLength(5)]); // control independiente para agregar un control al formulario pricipal
  newComunidad = new FormControl(); // control independiente para agregar un control al formulario pricipal

  get comunidades(){
    return this.myForm.get('comunidades') as FormArray;
  }

  onAddCommunity(){
    if(this.newComunidad.invalid) return;
    if(!this.newComunidad.value) return;
    // console.log('Agregar comunindad: ', this.newComunidad);
    const newCommunityId = this.newComunidad.value!;
    // console.log({newCommunity: newCommunityId});

    // Buscamos el texto 
    const newSO = this.getCommunityOption(newCommunityId);

    // Verifica si ya ha sido agregada antes y no hace nada
    const comunidadFoundIndex = this.comunidadesSeleccionadas.findIndex(x => x.value === newCommunityId);
    if( comunidadFoundIndex >= 0) {
      alert(`La comunidad ${newSO.text} ya habia sido seleccionada.`);
      return;
    } 
      
    
    this.comunidadesSeleccionadas.push(newSO);

    // Agregamos el nuevo juego a arreglo de juegos favoritos
    this.comunidades.push(this.fb.control(newCommunityId, [] ) );
    // Limpiamos el texto del input para agregar favoritos
    this.newComunidad.reset();

  }

  onDeleteFavorite(comunidadId: string){
    const index = this.comunidadesSeleccionadas.findIndex(x => x.value === comunidadId);
    
    this.comunidadesSeleccionadas.splice(index, 1);

    console.log(comunidadId, " se encontro en la posicion: ", index);
    this.comunidades.removeAt(index);
  }

  onSave(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    const fg = this.myForm.controls['comunidades'] as FormArray;
    if(fg.controls.length === 0 ) {
      // agregamos el nuevo juego a arreglo de juegos favoritos
      const newComunidad = this.newComunidad.value;
      this.comunidades.push(this.fb.control(newComunidad, [] ) );      
      return;
    }
    
    console.log('Formulario enviado', this.myForm.value);
    // console.log(fg.controls.length);

    this.myForm.reset();
    this.myForm.controls['comunidades'].reset();

    this.comunidades.clear();
    this.comunidadesSeleccionadas = [];
  }


  getCommunityOption(communityId: string) : SelectOption{
    const retComunity = this.comunidadesCombo.filter(x => x.value === communityId)[0];
    console.log("La comuidad encontrada es: ", retComunity);
    return retComunity;
  }

  goBack() {
    // console.log('Method not implemented.');
    this.router.navigate(['/sysadmin/usuarios']);
  }

}
