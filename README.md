# Gastito

Versión publicable y separada de la plataforma original. Esta app está pensada para hogares familiares, con onboarding simple, login por email vía Supabase Auth, catálogo base editable y operación `ARS-only`.

## Qué incluye

- Registro, login, logout y recuperación de contraseña con Supabase Auth
- Onboarding para crear un hogar y sembrar datos base
- Dashboard simple
- CRUD de movimientos, categorías, medios de pago, cuentas, deudas y gastos fijos
- Ownership por `householdId` en todos los datos operativos

## Qué deja afuera a propósito

- USD, FX y cotizaciones
- Inversiones
- Metas de auto
- Importaciones desde Excel
- Asistente IA
- Configuración técnica ligada a la operación privada actual

## Variables de entorno

Copiá `apps/hogar-finanzas/.env.example` a un `.env` local para esta app:

```bash
PUBLIC_APP_DATABASE_URL="postgresql://postgres.<project-ref>:<PASSWORD>@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
PUBLIC_APP_DIRECT_URL="postgresql://postgres.<project-ref>:<PASSWORD>@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY>"
PUBLIC_APP_SITE_URL="http://localhost:3000"
```

## Comandos

```bash
cd apps/hogar-finanzas
pnpm db:generate
pnpm db:validate
pnpm db:push
pnpm typecheck
pnpm test
pnpm build
```

## Flujo correcto de arranque

1. Configurar `.env` con las variables de Supabase y Postgres.
2. Ejecutar `pnpm db:generate`.
3. Ejecutar `pnpm db:push`.
4. Ejecutar `pnpm dev`.
5. Registrarte en `/register`, validar sesión y completar onboarding.
