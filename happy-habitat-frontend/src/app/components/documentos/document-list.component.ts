import { Component } from '@angular/core';
import { documentos } from '../../shared/data/documentos.data';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'hh-document-list',
  imports: [JsonPipe],
  templateUrl: './document-list.component.html',
  styles: ``
})
export class DocumentsListComponent {
  docs = documentos;
}
