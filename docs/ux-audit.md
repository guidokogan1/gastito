# UX Audit (Gastito)

Este documento lista mejoras de UX/UI inspiradas en patrones comunes de fintech (claridad, confianza, feedback inmediato, acciones rápidas y jerarquía visual). Varias mejoras ya fueron ejecutadas en el código; otras quedan como backlog.

Leyenda:
- ✅ Implementado en este pase
- 🧭 Backlog recomendado

## Información Arquitectónica (IA) y navegación

1. ✅ Resaltar el link activo del sidebar con `aria-current="page"`.
2. ✅ Agregar iconos por sección para reconocimiento visual rápido.
3. ✅ Menú colapsable en mobile (evitar que el sidebar “empuje” el contenido).
4. 🧭 Agrupar navegación en “Operación” (Movimientos) y “Catálogo” (Categorías / Cuentas / Medios) para reducir carga cognitiva.
5. 🧭 Agregar “Acción principal” persistente: “Cargar movimiento” (botón primario) en todas las pantallas privadas.
6. 🧭 Agregar breadcrumbs o “contexto” de sección en pantallas profundas.
7. 🧭 Agregar atajo a “Buscar” (Cmd/Ctrl+K) para navegar rápido.
8. ✅ Skip link “Saltar al contenido” para accesibilidad y navegación por teclado.

## Feedback, estados y confianza

9. ✅ Mensajes de éxito visibles tras acciones (crear/editar/borrar) vía `?message=...`.
10. ✅ Mensajes de error consistentes via `?error=...` y `FlashMessage`.
11. ✅ Componente `FlashMessage` con tonos `success/warning/error/info`.
12. ✅ Botones con estado “pending” (`SubmitButton`) para evitar doble submit.
13. ✅ Confirmación antes de borrar recursos (evita acciones irreversibles por error).
14. 🧭 Reemplazar `window.confirm` por un diálogo consistente (shadcn) con copy más claro.
15. 🧭 Añadir “deshacer” (undo) para borrados lógicos cuando aplique.
16. ✅ `loading.tsx` en el segmento privado para transiciones más suaves.
17. 🧭 Skeletons específicos por pantalla (dashboard y tablas) en lugar de loader genérico.
18. 🧭 Estados vacíos con CTAs directos (ej: “Crear categoría” / “Cargar movimiento”).

## Copywriting y consistencia (es-AR)

19. ✅ Corregir acentos y ortografía: “Categorías”, “Catálogo”, “Todavía”, “Empezá”, “Edición”, “Últimos”.
20. ✅ Evitar jerga técnica (“perfiles técnicos”, “FX”) en descripciones si no aporta a la tarea.
21. 🧭 Estándar de “vos”: Podés / Creá / Guardá / Empezá en toda la app.
22. 🧭 Microcopy por campo (por qué se pide, ejemplos concretos).
23. 🧭 Copys de confirmación más específicos (qué se borra y qué impacto tiene).

## Auth + onboarding

24. ✅ Auto-focus en el primer campo (login/register/reset/forgot/onboarding).
25. ✅ Pending states en submit (evita incertidumbre).
26. 🧭 Validación inline (email, password, mínimo 8 chars) antes del submit.
27. 🧭 Indicador de fuerza de contraseña y reglas (más claro que un error tardío).
28. 🧭 Onboarding en pasos (progresivo) para reducir fricción (nombre del hogar, confirmación, seed).
29. 🧭 Explicar “qué se crea” con una lista corta y escaneable (no párrafo).
30. 🧭 “Modo demo” local sin auth (para validar UX sin infra).

## Dashboard (“Resumen”)

31. ✅ CTA principal en header: “Cargar movimiento”.
32. 🧭 Métricas con comparación vs. mes anterior (tendencia).
33. 🧭 Proyección fin de mes (forecast) basada en ritmo actual.
34. 🧭 Sección “Acciones rápidas”: crear gasto fijo, crear deuda, etc.
35. 🧭 Mostrar “última actualización” y qué incluye el resumen (transparencia).
36. 🧭 Filtrar por mes (selector mes/año) con estado persistente.

## Movimientos

37. ✅ Búsqueda por texto (detalle / categoría / cuenta / medio).
38. ✅ Filtro por tipo (todos / gastos / ingresos).
39. ✅ Estado vacío de filtros con CTA “Limpiar filtros”.
40. ✅ Confirmación antes de borrar movimiento.
41. 🧭 Ordenar por monto y por fecha (toggle) con estado persistente.
42. 🧭 Chips para filtros rápidos (hoy, semana, mes, sin categoría).
43. 🧭 Mostrar totales del filtro actual (gasto/ingreso neto).
44. 🧭 Input de monto con máscara (separadores) y preview ARS formateado.
45. 🧭 Atajo “Enter” para guardar + “Esc” para cancelar edición.

## Catálogo (Categorías / Medios / Cuentas)

46. ✅ Confirmación antes de borrar.
47. ✅ Pending en “Guardar / Borrar / Crear”.
48. ✅ Etiquetas de tipo legibles (p.ej. cuentas “Banco/Billetera/Efectivo”).
49. 🧭 Edición inline con feedback “Guardado” por fila (sin recargar toda la página).
50. 🧭 Reordenar columnas: acciones al final, estado como badge.
51. 🧭 Búsqueda rápida por nombre (filtra tabla).
52. 🧭 “Desactivar” como acción primaria y “Borrar” como secundaria (seguro).

## Deudas

53. ✅ Confirmación antes de borrar.
54. ✅ Pending en “Guardar cambios / Guardar deuda”.
55. 🧭 Mostrar badge de estado (activa/inactiva) y dirección (debemos/nos deben).
56. 🧭 Timeline de pagos/ajustes (audit simplificado).
57. 🧭 Separar “monto original” vs “saldo” con ayudas visuales.

## Gastos fijos

58. ✅ Confirmación antes de borrar.
59. ✅ Pending en acciones.
60. ✅ Copy consistente: “Día de vencimiento”.
61. 🧭 Próximo vencimiento + alerta cuando está cerca.
62. 🧭 Vista calendario/lista con orden por proximidad.

## Accesibilidad

63. ✅ `aria-current` en navegación activa.
64. ✅ Skip link para teclado.
65. 🧭 Asegurar labels asociados (`htmlFor`) en todos los inputs (incl. edición inline).
66. 🧭 Estados de foco visibles y consistentes en todos los componentes interactivos.
67. 🧭 Anuncios para screen readers en toasts/flash (polite vs assertive).

## Limpieza técnica (impacta UX)

68. ✅ Eliminar shims CSS legacy que rompían Tailwind v4 (`@apply` a clases custom).
69. ✅ Reducir CSS legacy no usado (botones/cards/tablas antiguas).
70. 🧭 Unificar “forms” repetidos en componentes (AuthCard, CrudCard).
71. 🧭 E2E smoke básico (login → onboarding → movimiento) para evitar regresiones.

