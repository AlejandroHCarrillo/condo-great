import { PostComments, Posts } from '../data/posts-comments.data';
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comentario } from '../interfaces/comentario.interface';
import { Post } from '../interfaces/post.interface';
import { CommentsListComponent } from './comments-list.component';

@Component({
  selector: 'hh-list-posts',
  standalone: true,
  imports: [CommonModule, CommentsListComponent ],
  templateUrl: './posts-list.component.html'
})
export class PostsListComponent {
  posts = input.required<Post[]>();
  // posts = Posts;
  comentarios = PostComments; 

  obtenerComentarios(postId: number): Comentario[] {
    return this.comentarios.filter(c => c.postId === postId);
  }
}