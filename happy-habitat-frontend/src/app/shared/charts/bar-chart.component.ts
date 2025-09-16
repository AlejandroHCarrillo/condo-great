import { Component, ElementRef, ViewChild, AfterViewInit, input } from '@angular/core';
import { ColorType, createChart, HistogramSeries, LineData} from 'lightweight-charts';

@Component({
  selector: 'hh-bar-chart',
  standalone: true,
  imports: [],
  template: `<div #container id="container" style="width: 300px; height: 300px;" class=" bg-base-300"></div>` 
})

export class BarChartComponent implements AfterViewInit  {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  data = input.required<LineData[]>();

ngAfterViewInit(): void {  
  const container = this.containerRef.nativeElement;
  // console.log({container});

  let chartOptions = { layout: { 
                                      textColor: 'black', 
                                      background: { 
                                        type: ColorType.Solid, 
                                        color: 'white' } 
                                  } 
                        };

  let chart = createChart(container, chartOptions);
  let histogramSeries = chart.addSeries(HistogramSeries, 
    { color: 'green', 
      // title: 'histogram title',
      // base: 15
    }
  );
  histogramSeries.setData(this.data()); 
  
  chart.timeScale().fitContent();
}  

}