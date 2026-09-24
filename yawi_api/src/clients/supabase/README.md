# Supabase Client Module

## Overview
Provee el cliente oficial de Supabase (`@supabase/supabase-js`) como provider de inyección de dependencias (`SUPABASE_CLIENT`) a nivel global en la aplicación.

## Exports
- `SupabaseModule` (@Global): Registra y exporta `SUPABASE_CLIENT`.
- `SUPABASE_CLIENT`: Token de inyección para `SupabaseClient | null`.
- `SupabaseClientProvider`: Factory provider que instancia el cliente.

## Variables de Entorno
| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `SUPABASE_URL` | No* | - | URL del proyecto Supabase (ej. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | No* | - | Service Role Key con permisos de storage |

*Si no se proveen, el provider retorna `null` sin lanzar error, permitiendo operar en modo `STORAGE_METHOD=local`.

## Uso
```typescript
import { Inject, Optional } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../clients/supabase/supabase.client';

constructor(
  @Optional() @Inject(SUPABASE_CLIENT) private readonly supabaseClient: SupabaseClient | null,
) {}
```
