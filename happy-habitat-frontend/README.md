# HappyHabitat

## Install Tailwind CSS, PostCSS, and daisyUI
https://daisyui.com/docs/install/angular/

```
npm install daisyui@latest tailwindcss@latest @tailwindcss/postcss@latest postcss@latest --force
```

Add Tailwind CSS plugin for PostCSS to a new.postcssrc.jsonfile at root

```
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```
Put Tailwind CSS and daisyUI in your CSS file (and remove old styles)

src/styles.css
@import "tailwindcss";
@plugin "daisyui";
Run the Angular development server

Terminal
ng serve
Now you can use daisyUI class names!

  ## Install cally para usar el control de calendario
```
  npm install cally
```

## Instalar graficas
https://tradingview.github.io/lightweight-charts/docs

npm install lightweight-charts

Ejemplos:

https://tradingview.github.io/lightweight-charts/docs/series-types

Notas:
* El componente debe tener un templente incluido no un archivo html
```
  template: `<div #container id="container" style="width: 400px; height: 300px;" class="bg-base-300"></div>` 
```

* Para acceder al templete debemos usar 
``` 
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
```

* Debe implementar el metodo **AfterViewInit** para disparar la configuracion de las graficas

* La informacion viene en arreglos de  objetos json con el siguiente formato:
```
[
  { value: 1, time: 'yyyy-MM-dd' },
  { value: 1, time: '2025-09-15' },
  { value: 3, time: '2025-10-15', color: 'green' },
  { value: 4, time: '2025-10-15', color: '#F37824' },
 ]
```
* Tambien se puede cambiar el color de la columna agregando la propiedad color y el nombre o codigo exadecimal.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
