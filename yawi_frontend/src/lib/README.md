# Lib (`src/lib`)

## Propósito

Contiene instancias compartidas y configuraciones de librerías de terceros (ej. clientes HTTP, TanStack Query, etc.).

## Contenido

- `queryClient.ts`: Instancia global y configuración predeterminada de `QueryClient` para TanStack Query (`staleTime: 5 min`, `retry: 2`).
