import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardDto } from '../shared/interfaces/dashboard.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/Dashboard`;

  getDashboard(communityId: string, ultimosMeses: number = 6): Observable<DashboardDto> {
    const params = { communityId, ultimosMeses: String(ultimosMeses) };
    return this.http.get<DashboardDto>(this.API_URL, { params }).pipe(
      catchError((err) => {
        this.logger.error('Error fetching dashboard', err, 'DashboardService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}
