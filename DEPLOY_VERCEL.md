# Despliegue en Vercel — TenderMarket

Dos proyectos en Vercel: **backend primero**, luego **frontend**.

## 1. Backend (`tender-market-backend`)

1. [vercel.com/new](https://vercel.com/new) → Importar repo del backend.
2. Framework: **Next.js** (auto). No cambies Root Directory.
3. **Environment Variables** → pegar desde tu Supabase:

   | Nombre | Dónde lo sacas |
   |--------|----------------|
   | `SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `SUPABASE_ANON_KEY` | Supabase → anon public |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → service_role (secreto) |
   | `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` (por ahora) |

   Opcional: `SUPABASE_PRODUCTOS_BUCKET=productos-imagenes`

4. Deploy → copia la URL, ej. `https://tender-market-backend.vercel.app`
5. Prueba: abre `https://TU-BACKEND.vercel.app/api/stats` (debe responder JSON).

## 2. Frontend (`tender-market`)

1. Importar repo del frontend en Vercel.
2. **Environment Variables**:

   | Nombre | Valor |
   |--------|--------|
   | `NEXT_PUBLIC_API_URL` | `https://TU-BACKEND.vercel.app` (sin `/` final) |

3. Deploy → copia la URL, ej. `https://tender-market.vercel.app`

## 3. Enlazar frontend ↔ backend

En el proyecto **backend** en Vercel, edita variables:

```
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://TU-FRONTEND.vercel.app
```

O usa solo:

```
FRONTEND_URL=https://TU-FRONTEND.vercel.app
```

(CORS también acepta automáticamente cualquier `*.vercel.app`.)

**Redeploy** el backend.

## 4. Supabase Auth

Authentication → URL Configuration:

- **Site URL:** `https://TU-FRONTEND.vercel.app`
- **Redirect URLs:** `https://TU-FRONTEND.vercel.app/**` y `http://localhost:3000/**`

## 5. Desarrollo local

```bash
# Backend
cd tender-market-backend
cp .env.example .env.local   # pegar credenciales Supabase
pnpm install && pnpm dev

# Frontend (otra terminal)
cd tender-market
cp .env.example .env.local
pnpm install && pnpm dev
```

## Checklist

- [ ] Backend en Vercel con 4 variables Supabase/CORS
- [ ] Frontend con `NEXT_PUBLIC_API_URL`
- [ ] CORS / `FRONTEND_URL` actualizado y backend redeployed
- [ ] Supabase Auth URLs de producción
- [ ] Login y catálogo probados en la URL de Vercel
