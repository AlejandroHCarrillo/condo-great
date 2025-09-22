import { Component } from '@angular/core';
import { documentos } from '../../shared/data/documentos.data';
@Component({
  selector: 'hh-document-list',
  imports: [],
  templateUrl: './document-list.component.html',
  styles: ``
})
export class DocumentsListComponent {
  docs = documentos;
}
