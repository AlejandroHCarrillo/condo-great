import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ReportPeriodKey } from '../../data/report-period.data';
import { REPORT_PERIOD_OPTIONS } from '../../data/report-period.data';

@Component({
  selector: 'hh-report-period-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-period-filter.component.html'
})
export class ReportPeriodFilterComponent {
  readonly options = REPORT_PERIOD_OPTIONS;

  /** Período seleccionado actualmente. */
  selectedPeriod = input.required<ReportPeriodKey>();
  /** Se emite cuando el usuario cambia el período. */
  selectedPeriodChange = output<ReportPeriodKey>();

  onSelectionChange(value: string): void {
    this.selectedPeriodChange.emit(value as ReportPeriodKey);
  }
}
