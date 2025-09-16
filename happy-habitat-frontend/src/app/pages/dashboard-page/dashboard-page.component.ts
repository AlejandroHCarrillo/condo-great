import { Component, signal } from '@angular/core';
import { BarChartComponent } from "../../shared/charts/bar-chart.component";
import { LineData } from 'lightweight-charts';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {

  reportSignal = signal<LineData[]>([
    { time: '2025-09-01', value: 12, color: 'red' },
    { time: '2025-09-02', value: 18, color: 'navy' },
    { time: '2025-09-03', value: 14 },
    { time: '2025-09-04', value: 20 },
  ]);


}
