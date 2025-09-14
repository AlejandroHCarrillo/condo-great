// import { RESTCountry } from '../interfaces/rest-country.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
// import { CountryMapper } from '../mappers/country.mapper';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { EntradaDirectorio } from '../../../shared/interfaces/entrada-directorio.inteface';
import { RESTProveedorServicioResidente } from '../interfaces/rest-proveedor-servicio-residente.interface';
import { ProveedorServicioMapper } from '../mappers/proveedor-residente.mapper';
// import type { Country } from '../interfaces/country.interface';
// import { Region } from '../interfaces/region.type';

const API_URL = 'https://restcountries.com/v3.1'; 

@Injectable({
  providedIn: 'root'
})
export class ProveedoresResidentesService {
private http =  inject(HttpClient);
private queryCacheProveedores = new Map<string, EntradaDirectorio[]>();
// private queryCacheCountry = new Map<string, Country[]>();
// private queryCacheRegion = new Map<string, Country[]>();

searchByServiceKind(query: string): Observable<EntradaDirectorio[]> {
  query = query.trim().toLowerCase();
  console.log(`Se recibio el emit en el servicio: ${query}`);
  
  if (this.queryCacheProveedores.has(query)) { //verifica si ya tienen lan informacion para ese query
    console.log(`Usando Capital cache para ${query}`);
    return of(this.queryCacheProveedores.get(query)!);
  }

  const fullURL = `${API_URL}/capital/${query}`;

  console.log(`Enviando peticion ${query} a la API `);
  return this.http
  .get<RESTProveedorServicioResidente[]>(fullURL)
        .pipe(
          map(restProvedores =>   ProveedorServicioMapper.mapRESTProveedoresToProveedoresArray(restProvedores) ),
          tap(proveedores => this.queryCacheProveedores.set(query, proveedores) ), // guarda en cache la info
          // delay(300), 
          catchError((error) => {
            console.log(`Error fetching: ${error}`);
            return throwError(() => new Error(`No se encontraron proveedores para esa busqueda: ${query}`));
          })
        );
  }

//   searchByCountry(query: string): Observable<Country[]> {
//   query = query.trim().toLowerCase();

//   if (this.queryCacheCountry.has(query)) { //verifica si ya tienen lan informacion para ese query
//     console.log(`Usando country cache para ${query}`);
//     return of(this.queryCacheCountry.get(query)!);
//   }

//   const fullURL = `${API_URL}/name/${query}`;
//   // console.log({ fullURL });
//   return this.http
//   .get<RESTCountry[]>(fullURL)
//         .pipe(
//           map(restCountries =>   CountryMapper.mapRESTCountriesToCountriesArray(restCountries) ),
//           tap(countries => this.queryCacheCountry.set(query, countries) ), // guarda en cache la info
// //          delay(300), 
//           catchError((error) => {
//             console.log(`Error fetching: ${error}`);
//             return throwError(() => new Error(`No se encontraron países para la capital: ${query}`));
//           })
//         );
//   }

  // searchCountryByCode(code: string): Observable<Country|undefined> {
  // code = code.trim().toLowerCase();
  // const fullURL = `${API_URL}/alpha/${code}`;
  // // console.log({ fullURL });
  // return this.http
  // .get<RESTCountry[]>(fullURL)
  //       .pipe(
  //         map(restCountries =>   CountryMapper.mapRESTCountriesToCountriesArray(restCountries) ),
  //         map(countries => countries.at(0) ) ,
  //         catchError((error) => {
  //           console.log(`Error fetching: ${error}`);
  //           return throwError(() => new Error(`No se encontra un países con ese codigo: ${code}`));
  //         })

  //       );
  // }

  // searchByRegion(region: Region): Observable<Country[]> {
  //   console.log("servicio searchByRegion", region);
  //   console.log(this.queryCacheRegion);
  //   console.log(`this.queryCacheCountry.has(${region as string}): `, this.queryCacheCountry.has(region as string));

  //   if (this.queryCacheRegion.has(region as string)) { //verifica si ya tienen lan informacion para ese query
  //     console.log(`Usando region cache para ${region}`);
  //     return of(this.queryCacheRegion.get(region as string) ?? []);
  //   }

  //   const fullURL = `${API_URL}/region/${region}`;
  //   console.log({ fullURL });
  //   return this.http
  //   .get<RESTCountry[]>(fullURL)
  //         .pipe(
  //           map(restCountries =>   CountryMapper.mapRESTCountriesToCountriesArray(restCountries) ),
  //           tap(countries => this.queryCacheRegion.set(region, countries) ), // guarda en cache la info
  // //          delay(300), 
  //           catchError((error) => {
  //             console.log(`Error fetching: ${error}`);
  //             return throwError(() => new Error(`No se encontraron países para la región: ${region}`));
  //           })
  //         );
  //   }


}
