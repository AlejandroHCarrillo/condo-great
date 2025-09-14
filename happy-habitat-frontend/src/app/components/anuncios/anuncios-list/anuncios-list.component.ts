import { AnuncioPostMapper } from './../../proveedores-residentes/mappers/proveedor-residente.mapper copy';
import { Post } from './../../../shared/interfaces/post.interface';
import { Component, computed, input } from '@angular/core';
import { Anuncio } from '../../../shared/interfaces/announcement.interface';
import { PostsListComponent } from "../../../shared/post/posts-list.component";

@Component({
  selector: 'hh-anuncios-list',
  imports: [PostsListComponent],
  templateUrl: './anuncios-list.component.html',
  styles: ``
})
export class AnunciosListComponent {
  anuncios = input.required<Anuncio[]>();
  posts = computed(()=>{
    return AnuncioPostMapper.mapAnunciosToPostsArray(this.anuncios());
  }) 
  
}
