# Landing Feature Components (`src/features/landing/components`)

## Propósito

Contiene los componentes de presentación que estructuran las 9 secciones de la Landing Page de Yawi.

## Contenido

- `HeroSection/`: Sección principal con propuesta de valor, CTAs y collage de imágenes 40/60.
- `WhyYawiSection/`: 4 pilares de propuesta de valor con tarjetas e iconos.
- `CategoriesSection/`: Grid responsive de categorías artesanales (`CategoryCard`).
- `StorySection/`: Historia y filosofía artesanal con métricas de impacto y fotografía destacada.
- `ExploreLatamSection/`: Vitrina de países latinoamericanos con insignias de disponibilidad (`CountryCard`).
- `FeaturedProductsSection/`: Carrusel interactivo horizontal con `scroll-snap` y tarjetas de producto.
- `CultureSection/`: Bloque de impacto cultural con frase inspiracional y diseño editorial.
- `TestimonialsSection/`: Testimonios cruzados de comprador y maestro artesano (`TestimonialCard`).
- `FinalCtaSection/`: Cierre con llamada a la acción en fondo gradiente navy/indigo.

## Reglas

- **Responsabilidad única**: Cada sección es autónoma y se encarga exclusivamente de su presentación.
- **Componentes auxiliares**: Componentes usados solo dentro de una sección (ej. `CategoryCard`, `CountryCard`, `TestimonialCard`, `ProductCarousel`) viven dentro de la carpeta de dicha sección.
- **Tokens de diseño**: Uso exclusivo de clases Tailwind v4 que referencian `@theme`.

## Dependencias

- Importa de: `components/ui/`, `components/common/`, `features/landing/hooks/`, `features/landing/types.ts`.
- Importado por: `features/landing/index.ts`.
