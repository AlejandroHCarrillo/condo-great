import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { residentesdata } from '../../../shared/data/residentes.data';
import { comunidadesData } from '../../../shared/data/comunidades.data';

@Component({
  selector: 'hh-admincompany-residentes',
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-residentes.component.html'
})
export class AdmincompanyResidentesComponent {
  private authService = inject(AuthService);

  // Comunidad seleccionada para filtrar
  // '' = sin selección, 'all' = todas las comunidades, 'id' = comunidad específica
  selectedComunidadId = signal<string>('');

  // Obtener el usuario actual
  currentUser = computed(() => this.authService.currentUser());

  // Obtener las comunidades asociadas al admin company
  comunidadesAsociadas = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    // Priorizar usar user.communities que tiene todas las comunidades completas
    if (user.communities && user.communities.length > 0) {
      return user.communities;
    }
    
    // Fallback: obtener desde residentInfo.comunidades (array de IDs)
    if (user.residentInfo) {
      const comunidadesIds = (user.residentInfo as any).comunidades || [];
      // Filtrar las comunidades que coinciden con los IDs
      return comunidadesData.filter(comunidad => 
        comunidadesIds.includes(comunidad.id)
      );
    }
    
    return [];
  });

  // Todos los residentes (en producción vendría de un servicio)
  allResidentes = signal<Residente[]>(residentesdata);

  // Residentes filtrados por la comunidad seleccionada y ordenados
  residentesFiltrados = computed(() => {
    const residentes = this.allResidentes();
    const comunidadId = this.selectedComunidadId();
    
    let residentesFiltrados: Residente[] = [];
    
    // Si no hay selección, no mostrar nada
    if (!comunidadId || comunidadId === '') {
      return [];
    }
    
    // Si se seleccionó "todas las comunidades"
    if (comunidadId === 'all') {
      const comunidadesIds = this.comunidadesAsociadas().map(c => c.id);
      residentesFiltrados = residentes.filter(residente => 
        residente.comunidades?.some(comId => comunidadesIds.includes(comId))
      );
    } else {
      // Filtrar por la comunidad seleccionada
      residentesFiltrados = residentes.filter(residente => 
        residente.comunidades?.includes(comunidadId)
      );
    }
    
    // Ordenar por: 1. Comunidad, 2. Número de casa, 3. Nombre
    return residentesFiltrados.sort((a, b) => {
      // 1. Ordenar por comunidad (primera comunidad del array)
      const comunidadA = a.comunidades && a.comunidades.length > 0 
        ? this.getComunidadNombre(a.comunidades[0]) 
        : '';
      const comunidadB = b.comunidades && b.comunidades.length > 0 
        ? this.getComunidadNombre(b.comunidades[0]) 
        : '';
      
      if (comunidadA !== comunidadB) {
        return comunidadA.localeCompare(comunidadB);
      }
      
      // 2. Si las comunidades son iguales, ordenar por número de casa
      const numeroA = a.number || '';
      const numeroB = b.number || '';
      
      if (numeroA !== numeroB) {
        return numeroA.localeCompare(numeroB, undefined, { numeric: true, sensitivity: 'base' });
      }
      
      // 3. Si los números son iguales, ordenar por nombre
      return a.fullname.localeCompare(b.fullname);
    });
  });

  // Obtener el nombre de la comunidad por ID
  getComunidadNombre(comunidadId: string): string {
    const comunidad = comunidadesData.find(c => c.id === comunidadId);
    return comunidad?.nombre || 'Sin comunidad';
  }

  // Manejar cambio de selección de comunidad
  onComunidadChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedComunidadId.set(select.value);
  }
}

