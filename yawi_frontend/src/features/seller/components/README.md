# Seller Feature Components (`src/features/seller/components`)

## Propósito

Contiene los componentes de presentación que estructuran las 9 secciones de la Landing Page "Vender con Yawi".

## Contenido

- `SellerHeroSection/`: Hero con propuesta de valor para artesanos, CTA `#registro` y placeholder de imagen.
- `SellerProblemSection/`: Grid de 5 problemas comunes que enfrentan los artesanos con iconos Lucide.
- `SellerHowYawiHelpsSection/`: 3 bloques de solución (más clientes, más ingresos, más simple) con tarjetas hoverables.
- `SellerPromiseSection/`: Sección destacada con fondo gradiente y lista de beneficios en pills con iconos de verificación.
- `SellerEarlyAlliesSection/`: Oferta de lanzamiento y beneficios para primeros aliados divididos en 3 tiers destacados.
- `SellerHowItWorksSection/`: Timeline de 4 pasos para comenzar a vender (horizontal en desktop, vertical en mobile).
- `SellerMarketsSection/`: Vitrina de mercados internacionales disponibles y próximos con banderas y estado.
- `SellerStorySection/`: Historia del significado de Yawi con tratamiento editorial premium y fondo gradiente con orbs.
- `SellerFinalCtaSection/`: Cierre con llamada a la acción y anchor `#registro`.

## Reglas

- **Autocontenidos**: Cada sección consume internamente las traducciones del namespace `seller`.
- **Cero strings hardcodeados**: Todo texto visible proviene de i18n.
- **Tokens de diseño**: Uso exclusivo de tokens de color centralizados en `@theme` vía Tailwind CSS v4.
- **Responsabilidad única**: Cada sección es autónoma y se encarga exclusivamente de su presentación.

## Dependencias

- Importa de: `components/ui/`, `i18n/`, `features/seller/seller-images.json`.
- Importado por: `features/seller/index.ts`.
