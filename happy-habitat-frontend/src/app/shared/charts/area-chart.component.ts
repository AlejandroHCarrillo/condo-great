import { Component, ElementRef, ViewChild, AfterViewInit, input } from '@angular/core';
import { AreaSeries, ColorType, createChart, HistogramSeries, LineData} from 'lightweight-charts';

@Component({
  selector: 'hh-area-chart',
  standalone: true,
  imports: [],
  template: `<div #container id="container" style="width: 300px; height: 300px;" class=" bg-base-300"></div>` 
})

export class AreaChartComponent implements AfterViewInit  {
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
    let areaSeries = chart.addSeries(AreaSeries, 
      { lineColor: '#2962FF', 
        topColor: '#2962FF', 
        bottomColor: 'rgba(41, 98, 255, 0.28)' }
    );

    areaSeries.setData(this.data()); 
    
    chart.timeScale().fitContent();
  }  

}