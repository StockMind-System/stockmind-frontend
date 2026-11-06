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

## Alcance del MVP operativo

Con la API C# y MongoDB iniciados, el frontend permite:

- iniciar sesion con las cuentas sinteticas del backend;
- usar JWT rotativos de 30 minutos, avisar dos minutos antes del cierre por
  inactividad y renovar el token cuando se detecta interaccion, respetando un
  maximo absoluto de 12 horas;
- consultar, crear y desactivar productos;
- consultar y registrar ventas de un producto;
- consultar y registrar movimientos de inventario;
- registrar compras, aprobarlas o rechazarlas y confirmar su recepcion;
- revisar alertas de reposicion y el resumen de indicadores;
- calcular ABC, stock de seguridad, ROP y EOQ cuando existen insumos;
- generar pronosticos semanales y evaluar MAE, RMSE, WAPE y R2;
- ver en el inicio un resumen actualizado desde la API.

El flujo operativo no necesita que FastAPI este iniciado. Las pantallas de
pronosticos y analitica dependen del servicio Python en el puerto `8000`; los
demas flujos siguen disponibles si analytics esta temporalmente fuera de
servicio.

Para una demostracion local, inicia primero el backend y MongoDB en el puerto
`8080`, despues ejecuta `npm start` y abre `http://localhost:4200`. Una cuenta
de desarrollo es `dayana@stockmind.demo` con la contrasena `StockMind-123`.

## Verificacion

```powershell
npm run build
```
