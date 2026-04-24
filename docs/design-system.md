# Design System (Gastito)

Este design system está basado literalmente en la estética y el lenguaje visual de `Economía Familiar` (Tailwind v4 + shadcn/ui). La idea es que `gastito` no vuelva a “inventar estilos” por pantalla: se trabaja con tokens, componentes y reglas estables.

## Tokens

- **Colores**: se definen como CSS variables (OKLCH) en `src/app/globals.css`. Consumir vía clases Tailwind (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, etc.).
- **Tipografía**:
  - Body/UI: `--font-sans-modern` (sans moderna, legible).
  - Títulos de página: `.page-title` (serif editorial + italic).
  - Subtítulos: `.page-description`.
  - Secciones: `.section-title` / `.section-description`.
- **Radii**: `--radius` y derivados (`--radius-sm` ... `--radius-4xl`).
- **Spacing**: usar `gap-4/gap-6` y helpers `.space-grid-*` para layouts repetidos.

## Componentes Base

- Botones: `src/components/ui/button.tsx` (`variant` + `size`).
- Submit/Pending: `src/components/app/submit-button.tsx` (usa `useFormStatus`).
- Confirmaciones: `src/components/app/confirm-form.tsx` (confirm previo a acciones destructivas).
- Inputs: `src/components/ui/input.tsx`.
- Cards: `src/components/ui/card.tsx`.
- Tablas: `src/components/ui/table.tsx` (usar `TableContainer` + `Table` + `TableRow` + `TableCell`).
- Skeleton: `src/components/ui/skeleton.tsx`.
- States: `src/components/app/loading-state.tsx`, `src/components/app/empty-state.tsx`.
- Header: `src/components/app/page-header.tsx`.

## Reglas (Do / Don't)

### Do

- Usar tokens: `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`.
- Usar `Card` + `.card-page` para contenedores “panel” principales.
- Espaciado consistente: `gap-4` (interno), `gap-6` (secciones), padding de página con `.space-grid-8` o `p-8`.
- Loading/empty: siempre renderizar un estado explícito (no dejar un “hueco”).
- Accesibilidad: `focus-visible` (ya viene en `Button`/`Input`).
- Feedback: para acciones server (`save*` / `delete*`), redirigir con `?message=` o `?error=` y mostrar con `FlashMessage`.

### Don't

- No crear nuevos colores hardcodeados (hex/rgb) en componentes o páginas.
- No meter estilos ad-hoc en `globals.css` por feature; si hace falta, crear un componente reutilizable.
- No mezclar diferentes radios/espaciados sin razón (evitar “pixel soup”).
