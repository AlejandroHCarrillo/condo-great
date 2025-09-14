import { Anuncio } from "../../../shared/interfaces/announcement.interface";
import { Post } from "../../../shared/interfaces/post.interface";

export class AnuncioPostMapper {

    static mapAnuncioToPost(anuncio: Anuncio): Post {
        return {
                    id: anuncio.id,
                    titulo: anuncio.titulo,
                    contenido: anuncio.descripcion,
                    autorId: 0,
                    fechaCreacion: anuncio.fecha,
                    etiquetas: []
        };    
    }

    static mapAnunciosToPostsArray(anuncios: Anuncio[]): Post[] {
        return anuncios.map((anuncio) => this.mapAnuncioToPost(anuncio));
    }
}