# Components

Reusable, **presentational** UI of the app (Yawi marketplace of handmade products).
Components render data and emit events. They do **not** fetch, persist, or hold business rules.

> Read this file before creating or moving any file in `src/`. If a rule here conflicts with a request, ask before breaking it.

---

## 1. Layering and dependency direction

```
pages  ->  features  ->  components (ui / layout / common)
              |
              v
        hooks / store  ->  services  ->  api  ->  lib (supabase, queryClient, env)
```

- A layer may import only from layers **to its right/below**. Never upwards.
- `components/*` must never import from `api/`, `services/`, `store/` or `lib/`.
- Only `api/` talks to Supabase / HTTP. Nothing else calls `fetch` or the Supabase client.
- Features must not import from other features' internals. Use the feature's `index.ts` (public API) or lift the shared piece to `components/common` / `services`.

---

## 2. `src/components/` subfolders

| Folder | Purpose | May contain | Must NOT contain |
|---|---|---|---|
| `ui/` | Design-system primitives, domain-agnostic | `Button`, `Input`, `Select`, `Modal`, `Badge`, `Spinner`, `Skeleton`, `Rating`, `Tabs` | Domain words (product, cart, order), data fetching, Redux, i18n keys |
| `layout/` | Structural shells shared by many pages | `AppLayout`, `Header`, `Footer`, `NavBar`, `AccountLayout`, `PageContainer` | Page content, business logic |
| `common/` | Shared composed components that know the domain but are used by **2+ features** | `ProductCard`, `PriceTag`, `SellerBadge`, `EmptyState`, `ErrorState`, `Pagination`, `SearchBar` | Fetching, store access. Receive everything via props |

Component-specific to **one** feature does not go here. It goes in `src/features/<feature>/components/`.

### Component folder convention

```
ProductCard/
  ProductCard.tsx          # component (named export)
  ProductCard.test.tsx     # colocated test
  ProductCard.module.css   # optional, if not using global/utility styles
  index.ts                 # export { ProductCard } from './ProductCard'
```

- One component per file, `PascalCase` folder and file, named exports (no default exports except pages for lazy loading).
- Props typed with an exported `interface <Name>Props`.
- Text shown to the user comes from props or from `useTranslation` in **feature** components. `ui/` receives text via props only.

---

## 3. Rest of `src/` (where everything else goes)

| Path | Responsibility | Naming |
|---|---|---|
| `api/` | Raw backend calls. One file per resource. Returns typed DTOs, throws typed errors. No React, no mapping logic | `products.api.ts`, `orders.api.ts`, `auth.api.ts` |
| `services/` | Pure domain logic: DTO -> domain model mapping, calculations (cart totals, shipment status labels), orchestration of several `api` calls. No React | `cart.service.ts`, `shipment.service.ts` |
| `features/<name>/` | Vertical slice for a business capability (see below) | `catalog`, `cart`, `checkout`, `orders`, `profile`, `seller`, `auth` |
| `pages/` | Route-level components. Compose features and layout, read route params. **No logic beyond composition** | `OrderTrackingPage/OrderTrackingPage.tsx` |
| `routes/` | Router config, route guards (`RequireAuth`, `RequireRole`), lazy imports | `index.tsx`, `guards.tsx` |
| `hooks/` | Generic, reusable hooks with no domain knowledge | `useDebounce`, `useMediaQuery`, `useLocalStorage` |
| `store/` | Redux Toolkit root store, typed `useAppDispatch/useAppSelector`. Slices that are feature-specific live in the feature | `store.ts`, `hooks.ts` |
| `context/` | React Context for app-wide, rarely changing values: auth session, locale, theme | `AuthContext.tsx` |
| `i18n/` | i18n setup and EN/ES translation JSON (replaces `data/` for translations) | `locales/en/*.json`, `locales/es/*.json` |
| `data/` | Static non-translation content (constants, option lists, category definitions) | `categories.ts` |
| `lib/` | Third-party client setup and config | `supabase.ts`, `queryClient.ts`, `env.ts` |
| `types/` | Global shared domain types and generated DB types | `database.types.ts`, `common.ts` |
| `utils/` | Small pure helpers, no I/O, no React | `formatCurrency.ts`, `formatDate.ts`, `slugify.ts` |
| `assets/` | Images, icons, fonts | |
| `test/` | Test infrastructure only (see section 6) | `setup.ts`, `test-utils.tsx`, `mocks/` |

### State management decision

| Kind of state | Tool |
|---|---|
| Server data (products, orders, shipment, profiles) | **TanStack Query** hooks inside features. Do not copy server data into Redux |
| Cross-page client state (cart, active filters if shared) | **Redux Toolkit** slice |
| App-wide static-ish values (auth session, locale, theme) | **Context** |
| Local UI state (open modal, input value) | `useState` / `useReducer` in the component |

### Feature slice structure

```
features/orders/
  components/        # components used only by this feature
  hooks/             # useShipmentTracking, useOrders (TanStack Query wrappers)
  store/             # optional: orders.slice.ts
  types.ts           # feature-local types
  index.ts           # PUBLIC API of the feature (only export what others need)
```

---

## 4. "Where does this go?" cheat sheet

| I need to... | Put it in |
|---|---|
| Add a generic button/input/modal | `components/ui/` |
| Add a card used by catalog and seller storefront | `components/common/` |
| Add a filter sidebar used only in catalog | `features/catalog/components/` |
| Call Supabase or an HTTP endpoint | `api/<resource>.api.ts` |
| Convert API shape to UI shape, compute totals | `services/<domain>.service.ts` |
| Expose server data to components | `features/<x>/hooks/use<Thing>.ts` (TanStack Query) |
| Store cart items | `features/cart/store/cart.slice.ts` |
| Add a new route/screen | `pages/<Name>Page/` + register in `routes/index.tsx` |
| Protect a route by role (customer / seller) | `routes/guards.tsx` |
| Add user-facing text | `i18n/locales/{en,es}/<namespace>.json` (both languages) |
| Format a price or date | `utils/` |
| Configure a third-party SDK | `lib/` |

---

## 5. Hard rules for AI agents

1. **Do not** call `fetch`, `axios` or the Supabase client from a component, hook or page. Only from `api/`.
2. **Do not** hardcode user-facing strings. Add keys to both `en` and `es`.
3. **Do not** create new top-level folders in `src/` without explicit approval.
4. **Do not** put types inline in many files. Domain types go in `types/` (shared) or `features/<x>/types.ts` (local).
5. Every new `service` and every new component with logic ships with a test.
6. Use the `@/` path alias (`@/components/ui`), no `../../../` chains.
7. Handle the three states in every data-driven UI: loading, error, empty.
8. Prefer extending an existing component over creating a near-duplicate. Search `components/` first.
9. Keep components under ~150 lines. Extract hooks or subcomponents beyond that.
10. There is no product management UI. Do not create product create/edit/upload screens or API functions.

---

## 6. Testing

| Type | Tool | Location |
|---|---|---|
| Unit (services, utils, slices) | Vitest | Colocated: `cart.service.test.ts` next to the file |
| Component / hook | Vitest + React Testing Library + `@testing-library/jest-dom` | Colocated: `ProductCard.test.tsx` |
| API mocking | MSW (Mock Service Worker) | `src/test/mocks/handlers.ts` |
| End-to-end (critical flows) | Playwright | Repo-level `e2e/` folder, outside `src/` |

Test infrastructure in `src/test/`:

```
src/test/
  setup.ts          # jest-dom matchers, MSW server start/stop
  test-utils.tsx    # renderWithProviders (Router + Redux + QueryClient + i18n)
  mocks/
    handlers.ts     # MSW handlers
    factories.ts    # buildProduct(), buildOrder(), buildShipment()
```

Priorities: services and slices (pure logic) first, then feature hooks and components, then e2e for
search -> add to cart -> checkout -> track shipment, and login by role.
Query by role/text in tests (`getByRole`), never by CSS class.

---

## 7. Worked example: new page "Order tracking" (`/orders/:orderId/tracking`)

Goal: a customer sees the shipment status timeline of an order.

**Files to create, in this order:**

```
src/
  types/shipment.ts
  api/orders.api.ts                     (add getShipmentByOrderId)
  services/shipment.service.ts
  services/shipment.service.test.ts
  features/orders/
    hooks/useShipmentTracking.ts
    components/ShipmentTimeline/
      ShipmentTimeline.tsx
      ShipmentTimeline.test.tsx
      index.ts
    index.ts
  pages/OrderTrackingPage/OrderTrackingPage.tsx
  routes/index.tsx                      (register route, wrapped in RequireAuth)
  i18n/locales/{en,es}/orders.json      (add keys)
```

**1. Types** (`types/shipment.ts`)

```ts
export type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered';

export interface ShipmentEvent {
  status: ShipmentStatus;
  occurredAt: Date;
}

export interface Shipment {
  orderId: string;
  carrier: string;
  trackingCode: string;
  events: ShipmentEvent[];
  currentStatus: ShipmentStatus;
}
```

**2. API**: raw call only (`api/orders.api.ts`)

```ts
import { supabase } from '@/lib/supabase';

export interface ShipmentDto {
  order_id: string;
  carrier: string;
  tracking_code: string;
  events: { status: string; occurred_at: string }[];
}

export async function getShipmentByOrderId(orderId: string): Promise<ShipmentDto> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .single();
  if (error) throw error;
  return data;
}
```

**3. Service**: mapping and logic, no React (`services/shipment.service.ts`)

```ts
import { getShipmentByOrderId } from '@/api/orders.api';
import type { Shipment, ShipmentStatus } from '@/types/shipment';

export async function fetchShipment(orderId: string): Promise<Shipment> {
  const dto = await getShipmentByOrderId(orderId);
  const events = dto.events
    .map((e) => ({ status: e.status as ShipmentStatus, occurredAt: new Date(e.occurred_at) }))
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  return {
    orderId: dto.order_id,
    carrier: dto.carrier,
    trackingCode: dto.tracking_code,
    events,
    currentStatus: events.at(-1)?.status ?? 'preparing',
  };
}
```

**4. Hook**: server state (`features/orders/hooks/useShipmentTracking.ts`)

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchShipment } from '@/services/shipment.service';

export function useShipmentTracking(orderId: string) {
  return useQuery({
    queryKey: ['shipment', orderId],
    queryFn: () => fetchShipment(orderId),
    enabled: Boolean(orderId),
  });
}
```

**5. Feature component**: renders, receives data via props (`ShipmentTimeline.tsx`)

```tsx
import type { Shipment } from '@/types/shipment';
import { Badge } from '@/components/ui/Badge';

interface ShipmentTimelineProps {
  shipment: Shipment;
  labels: Record<string, string>; // translated status labels
}

export function ShipmentTimeline({ shipment, labels }: ShipmentTimelineProps) {
  return (
    <ol aria-label="Shipment timeline">
      {shipment.events.map((e) => (
        <li key={`${e.status}-${e.occurredAt.toISOString()}`}>
          <Badge>{labels[e.status]}</Badge>
          <time dateTime={e.occurredAt.toISOString()}>{e.occurredAt.toLocaleDateString()}</time>
        </li>
      ))}
    </ol>
  );
}
```

**6. Page**: composition only (`pages/OrderTrackingPage/OrderTrackingPage.tsx`)

```tsx
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShipmentTracking } from '@/features/orders';
import { ShipmentTimeline } from '@/features/orders';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/common/ErrorState';

export default function OrderTrackingPage() {
  const { orderId = '' } = useParams();
  const { t } = useTranslation('orders');
  const { data, isLoading, isError, refetch } = useShipmentTracking(orderId);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const labels = {
    preparing: t('status.preparing'),
    shipped: t('status.shipped'),
    in_transit: t('status.in_transit'),
    delivered: t('status.delivered'),
  };
  return <ShipmentTimeline shipment={data} labels={labels} />;
}
```

**7. Checklist before finishing**

- [ ] No component/page imports from `api/` or `lib/`
- [ ] Loading, error and empty states handled
- [ ] Keys added to `en` and `es`
- [ ] Route registered and guarded
- [ ] Service test (sorting, default status) and component test (renders events) added
- [ ] Feature `index.ts` exports only the public pieces