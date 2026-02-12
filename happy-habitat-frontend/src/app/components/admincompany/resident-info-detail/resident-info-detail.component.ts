import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { VehicleDto } from '../../../shared/interfaces/vehicle.interface';
import { PetDto } from '../../../shared/interfaces/pet.interface';
import { ResidentVisitDto } from '../../../shared/interfaces/resident-visit.interface';
import { Preferencia, PreferenciaUsuario } from '../../../shared/interfaces/preferencia.interface';
import { preferenciasData, preferenciasUsuariosData } from '../../../shared/data/preferencias.data';
import { UsersService } from '../../../services/users.service';
import { VehiclesService } from '../../../services/vehicles.service';
import { PetsService } from '../../../services/pets.service';
import { ResidentVisitsService } from '../../../services/resident-visits.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-resident-info-detail',
  imports: [CommonModule],
  templateUrl: './resident-info-detail.component.html'
})
export class ResidentInfoDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private vehiclesService = inject(VehiclesService);
  private petsService = inject(PetsService);
  private visitsService = inject(ResidentVisitsService);
  private authService = inject(AuthService);

  residentId = signal<string>('');
  resident = signal<Residente | null>(null);
  residentDbId = signal<string>(''); // ID del Resident en la base de datos
  
  vehicles = signal<VehicleDto[]>([]);
  pets = signal<PetDto[]>([]);
  visits = signal<ResidentVisitDto[]>([]);
  preferences = signal<Array<{ preferencia: Preferencia; valores: string[] }>>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    // Obtener el ID del residente desde los parámetros de la ruta
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.residentId.set(id);
        this.loadResidentData(id);
      }
    });
  }

  loadResidentData(id: string): void {
    this.isLoading.set(true);
    
    // Obtener del backend
    this.usersService.getUserById(id).subscribe({
      next: (userDto) => {
        if (userDto.residentInfo?.id) {
          // Obtener el ID del Resident de la base de datos
          const residentDbId = userDto.residentInfo.id;
          this.residentDbId.set(residentDbId);
          
          // Mapear a Residente para el frontend
          const resident: Residente = {
            id: id, // User ID
            fullname: userDto.residentInfo.fullName,
            email: userDto.residentInfo.email,
            phone: userDto.residentInfo.phone,
            number: userDto.residentInfo.number,
            address: userDto.residentInfo.address,
            comunidades: userDto.residentInfo.communityIds?.map(cid => cid.toString()) || []
          };
          this.resident.set(resident);
          
          // Cargar datos desde el backend
          this.loadVehicles(residentDbId);
          this.loadPets(residentDbId);
          this.loadVisits(residentDbId);
          this.loadPreferences(id); // Usar User ID para preferencias
          this.isLoading.set(false);
        } else {
          // Si no tiene ResidentInfo, redirigir
          console.error('User does not have resident info:', id);
          this.isLoading.set(false);
          this.router.navigate(['/admincompany/residentes']);
        }
      },
      error: (error) => {
        // Si no se encuentra, redirigir
        console.error('Resident not found:', id, error);
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/residentes']);
      }
    });
  }

  loadVehicles(residentDbId: string): void {
    console.log('Loading vehicles for residentDbId:', residentDbId);
    this.vehiclesService.getVehiclesByResidentId(residentDbId).subscribe({
      next: (vehicles) => {
        console.log('Vehicles loaded:', vehicles.length, vehicles);
        this.vehicles.set(vehicles);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.vehicles.set([]);
      }
    });
  }

  loadPets(residentDbId: string): void {
    console.log('Loading pets for residentDbId:', residentDbId);
    this.petsService.getPetsByResidentId(residentDbId).subscribe({
      next: (pets) => {
        console.log('Pets loaded:', pets.length, pets);
        this.pets.set(pets);
      },
      error: (error) => {
        console.error('Error loading pets:', error);
        this.pets.set([]);
      }
    });
  }

  loadVisits(residentDbId: string): void {
    console.log('Loading visits for residentDbId:', residentDbId);
    this.visitsService.getVisitsByResidentId(residentDbId).subscribe({
      next: (visits) => {
        console.log('Visits loaded:', visits.length, visits);
        this.visits.set(visits);
      },
      error: (error) => {
        console.error('Error loading visits:', error);
        this.visits.set([]);
      }
    });
  }

  loadPreferences(residentId: string): void {
    // Buscar las preferencias del usuario
    const userPreferences = preferenciasUsuariosData.filter(
      pref => pref.idResidente === residentId
    );

    // Mapear las preferencias con sus valores
    const preferencesWithDetails = userPreferences.map(userPref => {
      const preferencia = preferenciasData.find(p => p.id === userPref.idPreferencia);
      return {
        preferencia: preferencia!,
        valores: userPref.valores || []
      };
    }).filter(item => item.preferencia); // Filtrar preferencias no encontradas

    this.preferences.set(preferencesWithDetails);
  }

  getComunidadNombre(comunidadId: string): string {
    const user = this.authService.currentUser();
    if (user?.communities) {
      const comunidad = user.communities.find(c => c.id === comunidadId);
      if (comunidad) {
        return comunidad.nombre;
      }
    }
    return 'Sin comunidad';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    // Preservar la comunidad seleccionada al regresar
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/residentes'], {
        queryParams: { comunidad: comunidadId }
      });
    } else {
      this.router.navigate(['/admincompany/residentes']);
    }
  }
}
