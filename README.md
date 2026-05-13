# Nawaiam Web

Aplicacion Next.js con:

- Home comercial
- Login con NextAuth (credentials)
- Area de juegos tipo test
- Persistencia de resultados con Prisma

## Desarrollo Local

1. Crea `.env` a partir de `.env.example`.
2. Ejecuta:

```bash
npm install
npm run prisma:generate
npm run dev
```

## Base de Datos en Vercel Postgres

Configura estas variables en Vercel:

- `DATABASE_URL`: usar `POSTGRES_PRISMA_URL` (pooled)
- `DIRECT_URL`: usar `POSTGRES_URL_NON_POOLING` (direct)
- `AUTH_SECRET`
- `DEMO_USER_EMAIL`
- `DEMO_USER_PASSWORD`

La app ya viene preparada para deploy con:

- `vercel.json` con build command: `npm run vercel-build`
- Script `vercel-build`: `prisma generate && prisma migrate deploy && next build`

## Comandos Utiles

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run build
```
