import { Component } from '@angular/core';
import { DocumentsEditComponent } from "../../components/documentos/document-edit.component";
import { DocumentsListComponent } from "../../components/documentos/document-list.component";

@Component({
  selector: 'app-documents-page',
  imports: [DocumentsEditComponent, DocumentsListComponent],
  templateUrl: './documents-page.component.html',
  styles: ``
})
export class DocumentsPageComponent {

}
