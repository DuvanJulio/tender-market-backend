---
name: new-project-base
description: Base setup guide for new projects from scratch. Covers preferred tech stack, folder structure, conventions, and boilerplate patterns. Use this when initializing a new Next.js admin/dashboard/web app project to ensure consistency with established standards.
---

# New Project Base — Setup Guide

Use this skill when starting a greenfield project. It defines the preferred stack, structure, and patterns to apply from day one.

---

## Tech Stack (Preferred)

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js** (latest, App Router) | SSR, Server Actions, file-based routing |
| Language | **TypeScript** (strict mode) | Type safety across the full stack |
| State | **Redux Toolkit** + React Redux | Predictable global state, great DevTools |
| Forms | **React Hook Form** + **Zod** | Performant forms, schema-driven validation |
| UI Primitives | **Radix UI** | Accessible, unstyled, composable |
| Styling | **Tailwind CSS** (latest) + **CVA** + **clsx** + **tailwind-merge** | Utility-first with type-safe variants |
| Icons | **Lucide React** | Consistent, tree-shakeable |
| Notifications | **Sonner** | Minimal toast API |
| Dates | **date-fns** | Lightweight, locale support |
| Real-time | **@microsoft/signalr** | WebSocket abstraction (if needed) |
| Charts | **Recharts** | Composable, React-native charts (if needed) |
| PDF | **react-pdf** | PDF preview in-browser (if needed) |
| Theme | **next-themes** | Zero-flash dark mode |
| Cookies | **cookies-next** | SSR-compatible cookie access |

---

## Bootstrap Commands

```bash
# Create Next.js app
npx create-next-app@latest <project-name> \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd <project-name>

# Core dependencies
npm install \
  @reduxjs/toolkit react-redux \
  react-hook-form @hookform/resolvers zod \
  @radix-ui/react-dialog @radix-ui/react-select \
  @radix-ui/react-dropdown-menu @radix-ui/react-popover \
  @radix-ui/react-slot @radix-ui/react-label \
  @radix-ui/react-separator @radix-ui/react-tooltip \
  lucide-react \
  sonner \
  date-fns \
  next-themes \
  cookies-next \
  class-variance-authority clsx tailwind-merge
```

---

## Folder Structure

Set this up before writing any feature code.

```
src/
├── app/
│   ├── (auth)/                  # Public route group
│   │   └── sign-in/page.tsx
│   ├── dashboard/               # Protected area
│   │   ├── layout.tsx           # Sidebar + header
│   │   └── home/page.tsx
│   ├── globals.css
│   └── layout.tsx               # Root layout with Providers
├── features/                    # Feature modules (see pattern below)
│   └── dashboard/
│       └── <feature>/
├── components/
│   ├── ui/                      # Base components (Button, Input, etc.)
│   └── global/                  # App-specific composites (FormField, Table, etc.)
├── store/                       # Redux slices + store config
│   └── index.ts
├── lib/
│   ├── api/
│   │   ├── core.ts              # ApiClient class
│   │   ├── client.ts            # clientApi instance
│   │   ├── server.ts            # serverApi instance
│   │   └── error-handler.ts     # Centralized error handling
│   └── utils.ts                 # cn() utility
├── hooks/                       # Custom React hooks
├── helpers/                     # Pure server-side helpers (get-token, etc.)
├── utils/                       # Formatting + calculation utilities
├── types/                       # Shared TypeScript types
├── interfaces/                  # Shared interfaces
├── consts/                      # Enums + constants
└── guard/                       # Auth guard component
```

---

## Essential Files to Create First

### 1. `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. `src/types/status.ts`
```typescript
export type TStatus = 'idle' | 'loading' | 'success' | 'error';
```

### 3. `src/types/pagination-params.ts`
```typescript
export type TPaginationParams = {
  Page?: number;
  Size?: number;
};
```

### 4. `src/types/user-state.ts`
```typescript
export type TUserState = 'authenticated' | 'unauthenticated' | 'checking';
```

### 5. `src/consts/index.ts`
```typescript
export const AUTH_TOKEN = 'auth_token';

export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  EDITOR: 3,
  VIEWER: 4,
} as const;

export const PERMISSIONS = {
  // Add permissions as they are defined
} as const;

export const ROLE_PERMISSIONS: Record<number, string[]> = {
  [ROLES.SUPER_ADMIN]: [],   // fill in
  [ROLES.ADMIN]: [],
  [ROLES.EDITOR]: [],
  [ROLES.VIEWER]: [],
};
```

### 6. `src/lib/api/core.ts`
```typescript
type ApiResponse<T> = {
  status: number;
  data: T;
};

type ApiClientConfig = {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
};

type TokenConfig = {
  tokenProvider?: () => string | null;
};

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private tokenProvider?: () => string | null;

  constructor(config: ApiClientConfig, tokenConfig?: TokenConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.tokenProvider = tokenConfig?.tokenProvider;
  }

  private buildHeaders(data?: unknown): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders };
    const token = this.tokenProvider?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data && !(data instanceof FormData)) headers['Content-Type'] = 'application/json';
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...this.buildHeaders(options.body), ...options.headers },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const contentType = response.headers.get('Content-Type') ?? '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();
      return { status: response.status, data };
    } finally {
      clearTimeout(timeout);
    }
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }
  post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data), ...options });
  }
  put<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data), ...options });
  }
  patch<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'PATCH', body: data instanceof FormData ? data : JSON.stringify(data), ...options });
  }
  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}
```

### 7. `src/lib/api/error-handler.ts`
```typescript
import { redirect } from 'next/navigation';

export async function handleApiError(error: unknown): Promise<string> {
  if (error instanceof Response) {
    if (error.status === 401) {
      redirect('/sign-in?session=expired');
    }
    try {
      const body = await error.json();
      return body?.message ?? 'Error inesperado';
    } catch {
      return 'Error inesperado';
    }
  }
  if (error instanceof Error) return error.message;
  return 'Error inesperado';
}
```

### 8. `src/store/index.ts`
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
// import slices here

export const store = configureStore({
  reducer: {
    // add slices here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### 9. `src/app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/global/providers';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: '<App Name>',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

### 10. `src/components/global/providers.tsx`
```typescript
'use client';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
```

---

## Feature Module Pattern

Every domain feature must follow this structure.

```
features/dashboard/<feature>/
├── actions/                     # 'use server' API calls
│   └── index.ts
├── modules/
│   └── create/
│       ├── actions/             # POST/PUT server actions
│       ├── template/            # Form container component
│       ├── types/               # TCreate* form types
│       └── interfaces/
├── template/
│   └── index.tsx                # Orchestrator: manages modal/sheet state
├── views/
│   ├── <feature>-list.tsx
│   ├── <feature>-create.tsx
│   └── <feature>-edit.tsx
├── components/                  # Feature-scoped reusable components
├── interfaces/                  # IFeature* data interfaces
└── index.ts                     # Barrel export
```

### Template Component (Orchestrator)
```typescript
// features/dashboard/<feature>/template/index.tsx
'use client';
export const FeatureTemplate = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector(selectFeatureCreateView);

  return (
    <div>
      <FeatureListView />
      <Sheet open={isOpen} onOpenChange={(open) => dispatch(setCreateViewIsOpen(open))}>
        <SheetContent>{isOpen && <FeatureCreateView />}</SheetContent>
      </Sheet>
    </div>
  );
};
```

### Page File (thin)
```typescript
// app/dashboard/<feature>/page.tsx
import { FeatureTemplate } from '@/features/dashboard/<feature>';
export default function FeaturePage() {
  return <FeatureTemplate />;
}
```

---

## Redux Slice Pattern

```typescript
// store/<feature>/<feature>-slice.ts
import { createAppSlice } from '@/store/create-app-slice'; // or buildCreateSlice
import type { TStatus } from '@/types/status';

interface FeatureState {
  listView: {
    status: TStatus;
    items: IFeature[];
    total_items: number;
    page: number;
  };
  createView: { status: TStatus; isOpen: boolean };
  editView: { status: TStatus; isOpen: boolean; item: IFeature | null };
}

const initialState: FeatureState = {
  listView: { status: 'idle', items: [], total_items: 0, page: 1 },
  createView: { status: 'idle', isOpen: false },
  editView: { status: 'idle', isOpen: false, item: null },
};

export const featureSlice = createAppSlice({
  name: 'feature',
  initialState,
  reducers: (create) => ({
    fetchList: create.asyncThunk(
      async (params?: TListParams) => apiGetList(params),
      {
        pending: (state) => { state.listView.status = 'loading'; },
        rejected: (state) => { state.listView.status = 'error'; },
        fulfilled: (state, action) => {
          state.listView.items = action.payload.data?.items ?? [];
          state.listView.total_items = action.payload.data?.total_items ?? 0;
          state.listView.status = 'success';
        },
      }
    ),
    setCreateViewIsOpen: create.reducer((state, action: PayloadAction<boolean>) => {
      state.createView.isOpen = action.payload;
    }),
  }),
  selectors: {
    selectListView: (state) => state.listView,
    selectItems: (state) => state.listView.items,
    selectCreateView: (state) => state.createView,
    selectEditView: (state) => state.editView,
  },
});

export const { fetchList, setCreateViewIsOpen } = featureSlice.actions;
export const { selectListView, selectItems, selectCreateView, selectEditView } = featureSlice.selectors;
```

---

## Server Action Pattern

```typescript
// features/dashboard/<feature>/actions/index.ts
'use server';
import { serverApi } from '@/lib/api/server';
import { handleApiError } from '@/lib/api/error-handler';
import { ENDPOINT } from './endpoints';

export const apiGetList = async (
  params?: TListParams
): Promise<{ ok: boolean; message: string; data?: IApiListResponse }> => {
  try {
    const response = await serverApi.get<IApiListResponse>(ENDPOINT, { params });
    if (response.status === 200) {
      return { ok: true, message: 'OK', data: response.data.data };
    }
    return { ok: false, message: response.data.message };
  } catch (error) {
    return { ok: false, message: await handleApiError(error) };
  }
};
```

---

## Form Pattern

```typescript
// features/dashboard/<feature>/modules/create/template/index.tsx
'use client';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Campo requerido'),
  // ...
});

type TCreateFeature = z.infer<typeof schema>;

export const FeatureCreateTemplate = () => {
  const dispatch = useAppDispatch();
  const methods = useForm<TCreateFeature>({
    resolver: zodResolver(schema),
    mode: 'all',
  });

  const onSubmit = async (data: TCreateFeature) => {
    const result = await dispatch(createFeature(data)).unwrap();
    if (result.ok) {
      toast.success('Creado exitosamente');
      dispatch(setCreateViewIsOpen(false));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {/* form fields */}
        <Button type="submit" disabled={methods.formState.isSubmitting}>
          Guardar
        </Button>
      </form>
    </FormProvider>
  );
};
```

---

## TypeScript Naming Conventions

| Pattern | Prefix | Example |
|---|---|---|
| Form/payload types | `T` | `TCreateBusiness`, `TListParams` |
| Domain interfaces | `I` | `IBusiness`, `IUserData` |
| API response interfaces | `IApi` | `IApiGetListResponse` |
| Status type | — | `TStatus = 'idle' \| 'loading' \| 'success' \| 'error'` |
| Enum (string unions) | — | `NotificationTypeEnum` |
| Constants object | SCREAMING_SNAKE | `ROLES`, `PERMISSIONS` |

---

## Styling Rules

1. **Never** use inline styles — only Tailwind
2. Always use `cn()` for conditional/merged classnames
3. Use CVA for components with variants
4. Use CSS variables for theme tokens — no hardcoded colors
5. `data-*` attributes for semantic states (`data-error`, `data-slot`, `data-active`)
6. Dark mode via `dark:` prefix + `next-themes`
7. One depth strategy per project: **borders-only** (dense tools) or **subtle shadows** (approachable products)

---

## Authentication Checklist

- [ ] Store token in HTTP-only cookie (obfuscated name)
- [ ] `AuthGuard` component in root layout — redirects unauthenticated users
- [ ] `getAuthToken()` server helper for Server Actions
- [ ] `clientApi` uses `localStorage` token (client-only pages)
- [ ] `serverApi` uses cookie token (Server Actions)
- [ ] 401 responses auto-redirect to `/sign-in?session=expired`
- [ ] Role-based permission checks before rendering sensitive UI

---

## `next.config.ts` Baseline

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/sign-in', permanent: true },
    ];
  },
  env: {
    URL: process.env.URL,
    URN: process.env.URN,
  },
};

export default nextConfig;
```

---

## `.env.local` Template

```env
URL=https://api.example.com
URN=/api/v1
NEXT_PUBLIC_URL_WEB_SOCKET=wss://api.example.com/hub
```

---

## Launch Checklist (Before First Feature)

- [ ] Folder structure created
- [ ] `cn()` utility in `src/lib/utils.ts`
- [ ] Shared types: `TStatus`, `TPaginationParams`, `TUserState`
- [ ] `ApiClient` class + `clientApi` + `serverApi` instances
- [ ] `handleApiError` utility
- [ ] Redux store configured + typed `useAppDispatch` / `useAppSelector`
- [ ] `Providers` component (Redux + ThemeProvider)
- [ ] Root layout with `Providers` + `Toaster`
- [ ] `AuthGuard` component
- [ ] Dashboard layout with sidebar + header
- [ ] `next.config.ts` with root redirect
- [ ] `.env.local` with API base URLs
- [ ] Base UI components: `Button`, `Input`, `Label`, `Sheet`, `Dialog`, `Select`
- [ ] `CustomFormField` component wired to React Hook Form context

---

## Do's and Don'ts

**Do:**
- Set up the full folder structure before writing features
- Use `TStatus` in every async slice state
- Use Server Actions (`'use server'`) for all API calls
- Always dispatch via Redux — never call server actions from components directly
- Use `zodResolver` for all form validation
- Keep page files to a single `return <FeatureTemplate />`
- Use Sonner `toast.success` / `toast.error` for all feedback
- Write error messages in the project's locale

**Don't:**
- Put business logic in page files
- Call APIs from `useEffect` — use Redux thunks dispatched on mount
- Hardcode API URLs — always use env variables via `next.config.ts`
- Mix `'use client'` and `'use server'` in the same file
- Use `any` — prefer `unknown` and narrow types
- Skip the `AuthGuard` wrapper
- Create global CSS classes — use Tailwind utilities
