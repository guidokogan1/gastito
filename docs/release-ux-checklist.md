# Release UX Checklist

Usar antes de publicar cambios grandes de UI/mobile.

- Verificar `pnpm typecheck`, `pnpm test` y `pnpm build`.
- Probar manualmente 390px, 430px, 768px y desktop.
- Confirmar que bottom nav muestra solo navegación y que “Más” contiene destinos secundarios.
- Confirmar que el FAB abre nuevo movimiento con `?compose=1`.
- Abrir/cerrar cada sheet con teclado, overlay, botón cerrar y Escape.
- Confirmar que el foco vuelve al trigger después de cerrar un sheet.
- Crear, editar y borrar/desactivar al menos un recurso de catálogo.
- Cargar un gasto y un ingreso, revisar signo, color, categoría, medio y cuenta.
- Cambiar mes en Resumen y Movimientos.
- Revisar empty states con y sin datos.
- Revisar auth: login, registro, recuperar contraseña y reset.
- Revisar dark mode si el tema está habilitado en el entorno.
