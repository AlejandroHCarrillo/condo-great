import { reservacionesamenidadesdata } from './../../shared/data/reservaciones-amenidades.data';
import { Component, inject, signal } from '@angular/core';
import { HorasDelDia, WeekDays } from '../../enums/tiempo.enum';
import { DatePipe, JsonPipe, LowerCasePipe } from '@angular/common';
import { horarioAmenidadesData } from '../../shared/data/horario-amenidades.data';
import { amenidadesdata } from '../../shared/data/amenidades.data';
import { Amenidad } from '../../shared/interfaces/amenidad.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AmenidadMapper } from '../proveedores-residentes/mappers/amenidad-selectoption.mapper';
import { ReservacionAmenidad } from '../../shared/interfaces/reservacion-amenidad.interface';
import { Horario } from '../../shared/interfaces/horario.interface';

@Component({
  selector: 'hh-reservaciones',
  imports: [DatePipe, JsonPipe, LowerCasePipe],
  templateUrl: './reservaciones.component.html',
  styles: ``
})
export class ReservacionesComponent {
  htmlSeguro: SafeHtml = "";
  sanitizer = inject(DomSanitizer);
  diasSemana = [...Object.values(WeekDays)];
  horasDelDia = [...Object.values(HorasDelDia)].filter( x => x >="10:00" && x <= "21:00" && !x.includes("30") );
  
  inicioSemana = signal<Date>(new Date('2025/09/29'));
  
  // TODO: analizar que data puede cachearse en el local storage
  amenidadesOptions = AmenidadMapper.mapAmenidadesToSelectOptionsArray(amenidadesdata);  
  amenidadId = ""; //"d847101d-6286-4938-a25e-3de84208d547";
  amenidad = this.getAmenidadById(this.amenidadId);
  horariosAmenidad = this.getHorariosByAmenidadId(this.amenidadId);
  fechaSeleccionada: Date = new Date();
  capacidadMaxima: number = this.amenidad.capacidadMaxima??10;

  reservaciones= signal<ReservacionAmenidad[]>([...reservacionesamenidadesdata]); 

  sumDays(numDias: number): Date {
    const fechaOriginal = this.inicioSemana(); // o cualquier otra fecha
    const fechaSumada = new Date(fechaOriginal);
    fechaSumada.setDate(fechaSumada.getDate() + numDias);
    console.log(fechaSumada.toISOString()); // muestra la nueva fecha
    return fechaSumada;
  }

  getHorarioByDayHour(strDay: string, strHour: string){
      let horario = this.horariosAmenidad
                          .filter(s => s.day === strDay)
                          .filter(h => h.horainicio <= strHour && h.horafin >= strHour);
      if(horario.length === 0) console.log('Horario no encontrado', strDay, strHour);
      console.log(horario[0].horafin );
      return horario[0];
  }

  openModal(horarioSeleccionado: Date) {
    this.fechaSeleccionada = horarioSeleccionado;
    console.log(horarioSeleccionado);
  }

  setDatetime(fecha: Date, time: string): Date {
      console.log({time});
      const [horas, minutos] = time.split(":").map(Number);

      fecha.setHours(horas);
      fecha.setMinutes(minutos);
      this.fechaSeleccionada = fecha;
      return fecha;
  }

  getAmenidadById(amenidadId: string): Amenidad {
    return amenidadesdata.filter(x => x.id == amenidadId)[0];
  }

  getHorariosByAmenidadId(amenidadId: string): Horario[] {
    return horarioAmenidadesData
          .filter(x => x.amenidadId === amenidadId)
          .flatMap(item => item.horario)
                      
  }


  sanitizeHTML(htmlString: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  getReservationsByDate(fechaBuscada : Date): number {
    const num =  this.reservaciones().reduce((total, r) => {
      const mismaHora = r.horario.getTime() === fechaBuscada.getTime(); // compara fechas exactas
      return total + (mismaHora ? r.numPersonas ?? 0 : 0);
    }, 0);
    return num;
  }

  nextWeek() {
    // const fechaOriginal = new Date("2025-10-09"); // Jueves
    const fechaNueva = new Date(this.inicioSemana());  // Copia de la fecha
    fechaNueva.setDate(fechaNueva.getDate() + 7);
    this.inicioSemana.set(fechaNueva );
  }

  prevWeek() {
    // const fechaOriginal = new Date("2025-10-09"); // Jueves
    const fechaNueva = new Date(this.inicioSemana());  // Copia de la fecha
    fechaNueva.setDate(fechaNueva.getDate() - 7);
    this.inicioSemana.set(fechaNueva );
  }

  onSeleccion(event: Event) {
    this.amenidadId = (event.target as HTMLSelectElement).value;
    this.amenidad = this.getAmenidadById(this.amenidadId);
    this.horariosAmenidad = this.getHorariosByAmenidadId(this.amenidadId);
    // console.log('Theme:', valor);
    // document.documentElement.setAttribute('data-theme', valor);    
    // localStorage.setItem(this.themeKey, valor);
  }

}

