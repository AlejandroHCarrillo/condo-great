import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'svg-viewer',
  imports: [CommonModule],
  template: `<div [innerHTML]='safeSvg'></div>`,
  styleUrl: './SvgViewer.component.css',
})
export class SvgViewerComponent {  
  // visor de archivos SVG, no me funciono para strings dinamicos
  private sanitizer = inject(DomSanitizer);
  svgString = input.required<string>();
  rawSvg: string = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
                      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
                    </svg>`;

  safeSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.svgString());

 }
