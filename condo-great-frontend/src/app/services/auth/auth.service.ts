import { Injectable } from "@angular/core";
import { environment } from '../../../environments/environment';
import { Usuario } from "../../models/usuario.model";
import { HttpClient } from "@angular/common/http";

import { Router } from "@angular/router";
// import { SubirArchivoService } from "../subir-archivo/subir-archivo.service";
import { throwError } from "rxjs";

 import Swal from 'sweetalert2'
import { fetchSimple, fetchToken } from "../../helpers/fetch";

@Injectable()
export class AuthService {
  usuario: Usuario = new Usuario("", "", "");

  token: string = "";
  menu: any[] = [];

  constructor(
    public http: HttpClient,
    public router: Router,
    // public _subirArchivoService: SubirArchivoService
  ) {
    this.cargarStorage();
  }

  renuevaToken()  {    
    return fetchToken(`/auth/renew`, '?token=' + this.token, 'GET')
        .then((resp:any)=>{
            this.token = resp.token;
            localStorage.setItem("token", resp.token);
        }).catch( err => {
            this.router.navigate(['/login']);
            Swal.fire('Error al renovar el token', 'El token no pudo ser renovado', 'error');
            return throwError(err);
        });
    
    // let url = environment.baseUrl + '/login/renuevatoken';
    // url += '?token=' + this.token;
    // return this.http.get(url).map((resp:any) => {
    //   this.token = resp.token;
    //   localStorage.setItem("token", resp.token);

    // }).catch( err => {
    //   this.router.navigate(['/login']);
    //   Swal.fire('Error al renovar el token', 'El token no pudo ser renovado', 'error');
    //   return throwError(err);
    // });

  }

  estaLogueado() {
    if (this.token === null || this.token === undefined ){
      return false;
    }
    return this.token.length > 5 ? true : false;
  }

  cargarStorage() {
    if (localStorage.getItem("token")) {
      this.token = localStorage.getItem("token") || "";
      this.usuario = JSON.parse(localStorage.getItem("usuario") || "");
    //   this.menu = JSON.parse(localStorage.getItem("menu") || "");
    } else {
      this.token = "";
      this.usuario = new Usuario("", "", "");
      this.menu = [];
    }
  }

  guardarStorage(id: string, token: string, usuario: Usuario, menu:any) {
    localStorage.setItem("id", id);
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("menu", JSON.stringify(menu));

    this.usuario = usuario;
    this.token = token;
    this.menu = menu;
  }

  logout() {
    this.usuario = new Usuario("", "", "");
    this.menu = [];
    this.token = "";

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("menu");

    this.router.navigate(["/login"]);
  }

  loginGoogle(token: string) {
    let url = environment.baseUrl + "/login/google";

    return fetchSimple("/login/google", {}, "GET" )
        .then((resp:any)=>{
      this.guardarStorage(resp.id, resp.token, resp.usuario, resp.menu);
    });

    // return this.http.post(url, { token }).map((resp: any) => {
    //   this.guardarStorage(resp.id, resp.token, resp.usuario, resp.menu);
    //   return true;
    // });

  }

  login(usuario: Usuario, recordar: boolean = false) {
    if (recordar) {
      localStorage.setItem("email", usuario.email);
    } else {
      localStorage.removeItem("email");
    }

    // console.log("iniciando login...", usuario.email);
    
    return fetchSimple("auth", usuario, "POST" )
        .then(async(resp:any)=>{
            const body = await resp.json();
            // console.log(body);            
            if(body.ok){
                console.log(body.usuario);                
                this.guardarStorage(body.uid, body.token, body.usuario, body.menu);
                return true;
              } else{
                Swal.fire('Error en el login', body.msg, 'error');  
              }
            return body;
        })
        .catch( err => {
            // console.log(err.status );
            // console.log(err.error.mensaje );
            Swal.fire('Error en el login', err.error.msg, 'error');
            return throwError(err);
        });

    // let url = environment.baseUrl + "/login";
    // return this.http.post(url, usuario)
    //       .map((resp: any) => {
    //         console.log(resp);
    //         if(resp.ok){
    //           this.guardarStorage(resp.id, resp.token, resp.usuario, resp.menu);            
    //           return true;
    //         } else{
    //           Swal.fire('Error en el login', resp.mensaje, 'error');  
    //         }
    //       })
    //       .catch( err => {
    //         // console.log(err.status );
    //         // console.log(err.error.mensaje );

    //         Swal.fire('Error en el login', err.error.mensaje, 'error');
    //         return throwError(err);
    //       });
  }

  // crearUsuario(usuario: Usuario): any {
  //   return fetchToken('usuario', usuario, 'POST')
  //       .then((resp:any)=>{
  //           if(!resp.ok){
  //               console.log("Hubo un error creando el usuario");                
  //           }
  //           return resp.usuario;
  //       });

  //   // let url = environment.baseUrl + "/usuario";
  //   // return this.http.post(url, usuario)
  //   //   .map((resp: any) => {
  //   //     Swal.fire("Usuario creado", usuario.email, "success");
  //   //   return resp.usuario;
  //   // }).catch( err => {
  //   //   Swal.fire(err.error.mensaje, err.error.errors.message, 'error');      
  //   //   return throwError(err);
  //   // });

  // }

  // actualizarUsuario(usuario: Usuario) {

  //   return fetchToken(`usuario/${usuario._id}`, usuario, 'PUT')
  //               .then((resp: any)=>{
  //                   if(usuario._id === this.usuario._id){
  //                       let usuarioDB: Usuario = resp.usuario;
  //                       console.log("usuarioDB: ", usuarioDB);
                        
  //                       this.guardarStorage("usuarioDB._id", this.token, usuarioDB, this.menu);
  //                     }
              
  //                     Swal.fire("Usuario actualizado", usuario.nombre, "success");
              
  //                     return true;              
  //               })
  //               .catch( err => {
  //                   Swal.fire(err.error.mensaje, err.error.errors.message, 'error');      
  //                   return throwError(err);
  //                 });

  //   // let url = environment.baseUrl + "/usuario/" + usuario._id;
  //   // url += "?token=" + this.token;

  //   // return this.http.put(url, usuario)
  //   //   .map((resp: any) => {
  //   //     // this.usuario = resp.usuario;
  //   //     // Solo cuando actualizamos nuestro propio perfil actualiza el local storage
  //   //     if(usuario._id === this.usuario._id){
  //   //       let usuarioDB: Usuario = resp.usuario;
  //   //       this.guardarStorage(usuarioDB._id, this.token, usuarioDB, this.menu);
  //   //     }

  //   //     Swal.fire("Usuario actualizado", usuario.nombre, "success");

  //   //     return true;
  //   // }).catch( err => {
  //   //   Swal.fire(err.error.mensaje, err.error.errors.message, 'error');      
  //   //   return throwError(err);
  //   // });
  // }

  // cambiarImagen(archivo: File, id: string) {
  //   this._subirArchivoService
  //     .subirArchivo(archivo, "usuarios", id)
  //     .then((resp: any) => {
  //       this.usuario.img = resp.usuario.img;
  //       Swal.fire("Imagen Actualizada", this.usuario.nombre, "success");
  //       this.guardarStorage(id, this.token, this.usuario, this.menu);
  //     })
  //     .catch((err: any) => {
  //       console.log(err);
  //     });
  // }

  // cargarUsuarios(desde: number = 0) {
  //   let url = environment.baseUrl + "/usuario?desde=" + desde;

  //   return this.http.get(url);
  // }

  // buscarUsuarios(termino: string) {
  //   return fetchToken(`/busqueda/coleccion/usuario/${termino}`, null, 'GET');
    
  //   // let url = environment.baseUrl + "/busqueda/coleccion/usuario/" + termino;
  //   // return this.http.get(url).map((resp: any) => resp.usuario);
  // }

  // borrarUsuario(id: string) {
  //   // console.log("borrando usuario");
  //   return fetchToken(`usuario/${id}`, {}, 'DELETE');

  //   // let url = environment.baseUrl + "/usuario/" + id;
  //   // url += "?token=" + this.token;
  //   // return this.http.delete(url).map(resp => {
  //   //   Swal.fire("El usuario ha sido eliminado", "El usuario ha sido eliminado correctamente", "success");
  //   //   return true;      
  //   // });
  // }
}