import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comentario } from '../interfaces/comentario.interface';

@Component({
  selector: 'hh-list-comments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments-list.component.html'
})
export class CommentsListComponent {
  comentarios = input.required<Comentario[]>(); 
}