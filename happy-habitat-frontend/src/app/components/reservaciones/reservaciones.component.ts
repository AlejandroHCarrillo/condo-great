import { ReservacionAmenidad } from './../../shared/interfaces/reservacion-amenidad.interface';
import { reservacionesamenidadesdata } from './../../shared/data/reservaciones-amenidades.data';
import { Component, computed, inject, signal } from '@angular/core';
import { HorasDelDia, WeekDays } from '../../enums/tiempo.enum';
import { DatePipe, JsonPipe, LowerCasePipe } from '@angular/common';
import { horarioAmenidadesData } from '../../shared/data/horario-amenidades.data';
import { amenidadesdata } from '../../shared/data/amenidades.data';
import { Amenidad } from '../../shared/interfaces/amenidad.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AmenidadMapper } from '../proveedores-residentes/mappers/amenidad-selectoption.mapper';
import { Horario } from '../../shared/interfaces/horario.interface';
import { v4 as UUIDV4 } from 'uuid';

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
  residente = { 
              id: "4f8ddeb4-01a3-4bdf-bc4a-7c43f5d27ef7",
              casa: '120',
  }; // YO
  
  inicioSemana = signal<Date>(new Date('2025/09/29'));
  
  // TODO: analizar que data puede cachearse en el local storage
  amenidadesOptions = AmenidadMapper.mapAmenidadesToSelectOptionsArray(amenidadesdata);  
  amenidadId = ""; //"d847101d-6286-4938-a25e-3de84208d547";
  amenidad = this.getAmenidadById(this.amenidadId);
  horariosAmenidad = this.getHorariosByAmenidadId(this.amenidadId);
  fechaSeleccionada: Date = new Date();
  capacidadMaxima: number = this.amenidad?.capacidadMaxima??35;

  reservaciones = signal<ReservacionAmenidad[]>([]); 
  misReservaciones = computed(() => this.reservaciones().filter( x => x.amenidadId === this.amenidad.id && x.residenteId === this.residente.id) );
  showMisReservas : boolean = false;

  sumDays(numDias: number): Date {
    const fechaOriginal = this.inicioSemana(); // o cualquier otra fecha
    const fechaSumada = new Date(fechaOriginal);
    fechaSumada.setDate(fechaSumada.getDate() + numDias);
    // console.log(fechaSumada.toISOString()); // muestra la nueva fecha
    return fechaSumada;
  }

  getHorarioByDayHour(strDay: string, strHour: string){
      let horario = this.horariosAmenidad
                          .filter(s => s.day === strDay)
                          .filter(h => h.horainicio <= strHour && h.horafin >= strHour);
      if(horario.length === 0) {
        // console.log('Horario no encontrado', strDay, strHour);
        return { day: '', horainicio: '', horafin: '', isOpen: true, nota:"" };
      }
      // console.log(horario[0].horafin );
      return horario[0];
  }

  setSelectedDate(horarioSeleccionado: Date) {
    this.fechaSeleccionada = new Date(horarioSeleccionado);
    console.log("Fecha seleccionada:", horarioSeleccionado.toString() );
  }

  setDatetime(fecha: Date, time: string): Date {
      // console.log({time});
      const [horas, minutos] = time.split(":").map(Number);

      fecha.setHours(horas);
      fecha.setMinutes(minutos);
      // this.fechaSeleccionada = fecha;
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

  getReservacionsByAmenidadId(amenidadId : string) {
    return reservacionesamenidadesdata.filter(x => x.amenidadId === amenidadId
      && new Date(x.horario) >= new Date(this.inicioSemana())
    )
  }

  onSeleccion(event: Event) {
    this.amenidadId = (event.target as HTMLSelectElement).value;
    this.amenidad = this.getAmenidadById(this.amenidadId);
    this.capacidadMaxima = this.amenidad.capacidadMaxima ? this.amenidad.capacidadMaxima : 99;
    
    this.horariosAmenidad = this.getHorariosByAmenidadId(this.amenidadId);
    this.reservaciones.set(this.getReservacionsByAmenidadId(this.amenidadId));
    // console.log('Theme:', valor);
    // document.documentElement.setAttribute('data-theme', valor);    
    // localStorage.setItem(this.themeKey, valor);
  }

  doReservation(fecha: Date, numeroPersonas: number) {
    const newReservation : ReservacionAmenidad  = {
      id: UUIDV4(),
      amenidadId: this.amenidadId,
      residenteId: this.residente.id,
      horario: fecha,
      numPersonas: numeroPersonas
    };
    console.log("Nueva reservacion: ", newReservation);    
    this.reservaciones.set([...this.reservaciones(), newReservation]);
  }

  deleteReservation(reservation: ReservacionAmenidad) {
    console.log({reservation});
    const index = this.reservaciones().findIndex( x => x.id === reservation.id!);
    this.reservaciones().splice(index, 1);
    // this.reservaciones().removeAt(index);
    this.misReservaciones = computed(() => this.reservaciones().filter( x => x.amenidadId === this.amenidad.id && x.residenteId === this.residente.id) );

  }

  toggleVerReservas() {
    this.showMisReservas = !this.showMisReservas;
  }


}

