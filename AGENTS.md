# AGENTS.md — StockMind / reglas comunes

## Alcance y propósito
Estas instrucciones corresponden a StockMind: aplicación web para ventas, inventario y pronóstico de demanda de una MYPE ficticia, Lima 2026. El piloto utiliza datos sintéticos, con reglas de generación documentadas.

Componentes acordados:
- Angular + TypeScript + PrimeNG: interfaz.
- C# + ASP.NET Core: API y reglas de negocio.
- Python + FastAPI + XGBoost Regressor: servicio analítico.
- MongoDB: persistencia operativa y resultados.

Este archivo es opcional en la carpeta que contiene los tres proyectos. Cada proyecto conserva su propio AGENTS.md, que también funciona de forma independiente. No asumir que las instrucciones de una carpeta hermana se cargaron: leer explícitamente su AGENTS.md si la tarea requiere revisar o modificar ese proyecto.

## Responsabilidades entre proyectos
- Angular consume la API de C#. No se conecta directamente a MongoDB ni a FastAPI.
- C# autoriza operaciones, registra ventas/compras/movimientos, mantiene saldos, calcula ABC, stock de seguridad, punto de reposición y EOQ, y conserva auditoría.
- Python prepara series semanales por SKU, entrena, realiza backtesting, compara XGBoost con promedio móvil de cuatro semanas y devuelve pronósticos y métricas.
- C# coordina la comunicación con Python. Evitar dos implementaciones autoritativas de la misma regla.
- Ningún componente ejecuta compras automáticas: las sugerencias requieren revisión y aprobación humana.

## Reglas de trabajo
1. Leer README, instrucciones aplicables, manifiestos, configuración y código relacionado antes de editar.
2. Identificar versiones y herramientas realmente instaladas. No actualizar frameworks, cambiar gestor de paquetes ni añadir dependencias por rutina.
3. Para una refactorización de arquitectura, presentar primero un diagnóstico breve y el orden de cambios. Continuar con la implementación si la tarea ya la autoriza; si se pidió solo análisis, entregar solo análisis.
4. Conservar contratos, comportamiento y datos existentes salvo cambio solicitado. Refactorizar en pasos pequeños.
5. No reformatear archivos ajenos al cambio ni sobrescribir trabajo del usuario.
6. Elegir la solución más simple que satisfaga el caso. No crear carpetas vacías, interfaces por cada clase, microservicios nuevos ni patrones sin necesidad concreta.
7. Aplicar SRP en componentes/servicios; OCP en variaciones reales; DIP en acceso a datos y servicios externos; contratos pequeños e intercambiables para ISP y LSP.
8. Mantener nombres descriptivos, funciones enfocadas, tipado y tratamiento explícito de errores.
9. No inventar comandos, pruebas aprobadas, mediciones ni resultados.
10. Al finalizar, informar qué cambió, por qué, cómo se verificó y qué quedó pendiente.

## Contratos e integración
Antes de modificar un DTO, endpoint, enum o campo:
- Identificar productores y consumidores en los otros repositorios.
- Revisar OpenAPI y los contratos existentes; acordar nombres, unidades, nulabilidad, fechas y formato de errores.
- Actualizar consumidores, documentación y pruebas de integración afectados.
- Mantener identificadores externos como cadenas; no exponer tipos internos de MongoDB.
- Usar ISO 8601 en intercambios. Conservar instantes en UTC y definir explícitamente la zona de negocio y el inicio de semana al agregar demanda.
- Definir precisión y redondeo de importes, cantidades y métricas. Los cálculos monetarios autoritativos viven en C#.
- No serializar NaN o infinito; una métrica no calculable se devuelve como null con motivo.
- Diferenciar resultado válido, falta de datos, error y resultado antiguo.

El pronóstico identifica al menos SKU, fecha de corte, horizonte, semanas estimadas, unidad, método, versión del modelo/dataset y estado. El horizonte previsto es de cuatro semanas, configurable si el contrato lo permite.

## Datos, evaluación y reposición
- Mantener datos sintéticos identificables y generación reproducible por semilla. No presentarlos como registros ni mejoras observadas en una empresa real.
- Respetar orden temporal en entrenamiento, validación y prueba. Nunca utilizar ventas posteriores al corte para construir variables, seleccionar modelos o aplicar ABC en una simulación histórica.
- Priorizar SKU A/B con historial suficiente. La suficiencia se define antes de evaluar, considerando rezagos y horizonte. 52 semanas es una referencia de diseño y 26 un piloto propuesto, no una garantía estadística.
- Documentar contingencia por promedio móvil o categoría; no repartir una predicción de categoría entre SKU sin regla explícita.
- MAE, RMSE y WAPE son métricas principales de regresión; R² es complementaria. F1 solo aplica a una clasificación con etiquetas y umbrales definidos.
- Separar métricas predictivas de indicadores operativos: quiebres, excedente, exactitud y tiempo de planificación.
- No afirmar que XGBoost mejora la referencia ni que se logró la meta preliminar de 10 % sin evidencia.
- No generar EOQ sin costos requeridos, ni stock de seguridad/ROP sin sus insumos y unidades coherentes. Indicar qué falta.
- Definir estados de sugerencia, aprobación y ejecución; aprobar una sugerencia no equivale a recibir productos.
- Conservar usuario, fecha, motivo y valores relevantes en la auditoría.

## Seguridad y calidad
- Secretos mediante configuración externa; ejemplos sin credenciales reales.
- Permisos efectivos en C#, aunque Angular oculte acciones.
- Entradas externas validadas, límites de carga y paginación donde corresponda.
- No registrar tokens, contraseñas ni payloads sensibles.
- Probar reglas y escenarios de fallo relevantes: saldos, duplicados, concurrencia, permisos, cortes temporales y fallos de integración.
- Ejecutar las comprobaciones configuradas que correspondan al cambio; no añadir pruebas que solo reproduzcan detalles internos.
- Azure fue considerado como opción de despliegue. No imponer servicios ni publicar sin una tarea que lo autorice.



---

# AGENTS.md — StockMind / Angular

## Contexto, alcance y tecnologías
Este proyecto implementa la interfaz de StockMind, aplicación de ventas, inventarios y pronósticos para una MYPE ficticia. El piloto usa datos sintéticos.

Stack acordado: Angular, TypeScript y PrimeNG, con estilos CSS. No usar SCSS para código nuevo. RxJS, Router, HttpClient y Reactive Forms son herramientas del ecosistema Angular a utilizar cuando corresponda.

PrimeIcons y Chart.js son complementos propuestos para iconos y gráficos de PrimeNG; verificar package.json y compatibilidad antes de incorporarlos. No asumir que ya están instalados ni que toda librería mencionada fue un acuerdo previo.

Antes de trabajar, revisar package.json, lockfile, angular.json, tsconfig, README e instrucciones aplicables. Respetar versiones instaladas y el gestor de paquetes existente. No migrar Angular/PrimeNG ni modificar su sistema de temas como parte de una tarea ajena.

## Límite de responsabilidad
- La UI consume la API ASP.NET Core. Nunca conectar Angular directamente a MongoDB o al servicio Python.
- Mostrar y gestionar entradas; las reglas autoritativas de stock, roles, ABC, stock de seguridad, ROP y EOQ viven en C#.
- Python produce pronósticos y métricas. Angular los presenta sin recalcularlos con otra definición.
- No importar clases de implementación de C# o Python; consumir contratos HTTP.
- Ninguna compra se ejecuta automáticamente desde una predicción.

## Arquitectura
Organizar por funcionalidades, manteniendo la estructura existente si ya es coherente. Para módulos nuevos, una referencia es:
- src/app/core/: configuración transversal, sesión, interceptores, guards y servicios de alcance global.
- src/app/shared/: componentes visuales, pipes y utilidades usados realmente por varios módulos.
- src/app/features/<funcionalidad>/pages/: pantallas y coordinación del caso de uso.
- src/app/features/<funcionalidad>/components/: presentación propia del módulo.
- src/app/features/<funcionalidad>/data-access/: llamadas HTTP y adaptación de DTO.
- src/app/features/<funcionalidad>/models/: tipos del módulo.
- src/app/features/<funcionalidad>/state/: estado/facade solo si la complejidad lo requiere.

Funcionalidades: autenticación, inicio, productos, ventas, compras, inventario, pronósticos, reposición e indicadores. No generar todas esas carpetas de forma anticipada.

Preferir componentes standalone en código nuevo si la versión y estructura lo permiten. No convertir NgModules existentes sin necesidad. Usar lazy loading para funcionalidades cuando aporte al tamaño y navegación.

Dependencias: pages coordina components y data-access/state; componentes de presentación reciben datos y emiten eventos. shared no depende de features; core no importa pantallas.

## SOLID y código limpio
- SRP: cada componente, servicio y función tiene una responsabilidad reconocible.
- OCP: composición, inputs y outputs para variaciones reales; no duplicar pantallas casi idénticas.
- ISP: contratos y props pequeños; evitar modelos gigantes para todo el sistema.
- DIP: usar la DI de Angular para servicios. Introducir InjectionToken/contratos solo cuando exista una sustitución útil.
- LSP: sustituciones de servicios/componentes mantienen significado, errores y estados esperados.
- No crear un repositorio genérico ni replicar capas del backend en la UI.
- Mantener nombres de archivo y símbolos coherentes con el proyecto y Angular. Código en inglés y textos de interfaz en español, salvo convención existente.
- TypeScript estricto; evitar any y aserciones que oculten errores. Un tipo declarado no valida el JSON recibido: comprobar estructura en límites críticos.
- Extraer duplicación significativa; no hacer abstracciones para fragmentos triviales.

## Componentes, estado y asincronía
- Separar plantilla, estilos CSS y clase cuando facilite lectura.
- Mantener plantillas sin cálculos de negocio ni transformaciones costosas.
- Estado local para controles y filtros; no introducir NgRx u otro gestor global sin necesidad concreta.
- Usar signals/computed para estado local/derivado si la versión y convenciones los admiten. Usar RxJS para HTTP y flujos asíncronos.
- No duplicar estado derivable ni sincronizarlo con effects innecesarios.
- Evitar suscripciones anidadas. Elegir operadores según cancelación, orden y concurrencia; no cancelar mutaciones de negocio con switchMap por rutina.
- Gestionar suscripciones de larga duración con async pipe, takeUntilDestroyed o el mecanismo compatible ya existente.
- Para búsqueda/filtros, cancelar consultas antiguas cuando corresponda. Evitar respuestas tardías que sustituyan resultados más recientes.
- Usar OnPush y seguimiento estable de listas si son compatibles; no introducir memoización sin evidencia.
- Un servicio global no debe conservar estado accidental de otra pantalla o usuario.

## HTTP y autenticación
- Centralizar URL base y configuración; no codificar direcciones en componentes. La configuración incluida en el frontend es pública y nunca contiene secretos.
- Centralizar transporte transversal en interceptores; mantener reglas específicas del caso en servicios del módulo.
- Tipar solicitudes, respuestas, paginación, errores, métricas y estados.
- Mantener fechas, SKU, IDs y unidades según contratos ASP.NET Core.
- Diferenciar carga inicial, actualización, éxito, error, datos vacíos y resultado desactualizado.
- No transformar un error en una lista vacía silenciosamente.
- Distinguir 401 de 403 y respetar el mecanismo de sesión existente. No cambiar almacenamiento de tokens por rutina.
- Los guards mejoran navegación; C# debe comprobar autorización.
- Bloquear envíos duplicados en UI y utilizar idempotencia del backend cuando exista.
- Reintentos automáticos solo para operaciones seguras o idempotentes; no repetir una venta a ciegas.

## Formularios y UX
- Usar Reactive Forms tipados para ventas, compras, productos, ajustes y parámetros.
- Validar campos requeridos, cantidades, precios y formatos. Mostrar errores junto al campo; conservar los valores tras fallos recuperables.
- El backend confirma disponibilidad y permisos; la validación visual no reemplaza ese control.
- Preferir componentes PrimeNG existentes para tablas, botones, diálogos, formularios, mensajes y navegación.
- Usar tablas paginadas y filtros del servidor cuando el volumen lo requiera; no descargar todo el historial.
- Tema y variables CSS centralizados; reutilizar espaciados y colores. Evitar estilos globales que alteren todos los componentes PrimeNG y evitar ::ng-deep como solución habitual.
- Respetar teclado, foco, labels, contraste y diseño adaptable.
- Confirmar operaciones importantes mediante UI comprensible; incluir motivo en ajustes.

## Pantallas y reglas de presentación
- Inicio: resumen de ventas, bajo stock y alertas pendientes.
- Ventas/compras: registrar y consultar operaciones por SKU/fecha; informar el resultado real del backend.
- Inventario: saldo, movimientos, conteos y diferencias. No editar saldos directamente desde la UI.
- Pronósticos: real frente a estimado por semana, horizonte previsto de cuatro semanas, XGBoost frente a promedio móvil de cuatro semanas, MAE/RMSE/WAPE y fecha de corte.
- Reposición: ABC, parámetros usados, stock de seguridad, ROP, EOQ cuando sea calculable, recomendación y revisión humana.
- Indicadores: quiebres, excedente, exactitud y tiempo de planificación con periodos comparables.
- Mostrar null como “No calculable” o “Sin datos”, con motivo; nunca como cero. Mostrar WAPE en porcentaje conforme al contrato.
- R² solo como complemento si se entrega. F1 solo si se implementó un problema de clasificación separado.
- No inventar datos reales futuros para completar un gráfico. Identificar valores sintéticos y resultados antiguos.
- Si faltan costos o plazos, mostrar insumos pendientes de reposición; no ocultar el problema.
- Chart.js mediante la integración PrimeNG cuando exista; añadir una alternativa textual/tabla que explique el gráfico.

## Verificación y flujo Codex
1. Revisar módulo, servicios y contratos relacionados; reutilizar soluciones existentes.
2. Si se refactoriza arquitectura, explicar brevemente diagnóstico y pasos antes de editar.
3. Implementar cambios mínimos sin remodelar toda la aplicación.
4. Verificar casos afectados: validación, carga, error, vacío, permisos y doble envío.
5. Ejecutar build, comprobación de tipos, lint y pruebas que estén configurados y sean aplicables. Obtener comandos de package.json/CI; no suponer npm si se usa otro gestor.
6. No migrar el runner de pruebas ni instalar herramientas para cumplir un comando inventado.
7. Si cambian contratos, revisar AGENTS.md y código de C# y actualizar integración.
8. Reportar archivos cambiados, decisiones y verificaciones; no declarar checks ejecutados si no se ejecutaron.

Referencias de consulta: https://angular.dev/style-guide · https://angular.dev/guide/forms/reactive-forms · https://primeng.org/


