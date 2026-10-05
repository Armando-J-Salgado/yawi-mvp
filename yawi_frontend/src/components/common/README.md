# Common Domain Components (`src/components/common`)

## Propósito
Aloja componentes con lógica o modelos de dominio de negocio compartidos por dos o más features de la aplicación (por ejemplo, tarjetas de producto compartidas entre la landing page y el catálogo futuro).

## Contenido
- `ProductCard/`: Tarjeta visual de producto artesanal con imagen, nombre, país de origen, artesano, precio y botón de acción.
- `index.ts`: Barrel export de los componentes comunes.

## Reglas
- **Dominio transversal**: Solo debe albergar componentes que sean consumidos por múltiples features o requeridos transversalmente.
- **Sin acceso directo a APIs**: Recibe datos y callbacks vía props; no realiza peticiones de red directas.
- **Uso del Design System**: Utiliza los componentes base de `components/ui/`.

## Dependencias
- Importa de: `components/ui/`, Lucide React.
- Importado por: `features/landing/`, futuros features (`catalog/`, `checkout/`, etc.).
