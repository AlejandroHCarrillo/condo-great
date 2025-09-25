import { Component, input } from '@angular/core';

@Component({
  selector: 'hh-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styles: ``
})
export class PaginationComponent {
  totalPages = input.required<number>();
  currentPage = input.required<number>();
}
