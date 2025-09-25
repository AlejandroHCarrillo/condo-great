import { Component, input } from '@angular/core';
import { Anuncio } from '../../../shared/interfaces/announcement.interface';

@Component({
  selector: 'hh-anuncios-list',
  imports: [],
  templateUrl: './anuncios-list.component.html',
  styles: ``
})
export class AnunciosListComponent {
  anuncios = input.required<Anuncio[]>();
  // posts = computed(()=>{
  //   return AnuncioPostMapper.mapAnunciosToPostsArray(this.anuncios());
  // }) 
  
}
