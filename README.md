# StockMind Frontend

Aplicacion Angular standalone organizada por capacidades de negocio. El
frontend consume solamente la API C#; nunca llama directamente al servicio
Python ni contiene reglas de entrenamiento o inventario.

## Arquitectura

- `core`: sesion, guards, interceptores y layouts de alcance global.
- `shared`: componentes presentacionales reutilizables, sin reglas de negocio.
- `features`: rutas, paginas, modelos y servicios separados por modulo:
  autenticacion, productos, inventario, ventas, predicciones y analitica.
- `environments`: URL de la API por ambiente.

Las rutas de cada feature se cargan de forma diferida. Los contratos publicos
usan camelCase y reflejan los DTO del backend; la traduccion al contrato
snake_case de analytics pertenece al adaptador C#.

## Ejecucion

Requiere una version de Node compatible con Angular 22: `^22.22.3`,
`^24.15.0` o `>=26.0.0`.

```powershell
npm install
npm start
```

La configuracion de desarrollo apunta a `http://localhost:8080/api`.

## Verificacion

```powershell
npm run build
```
