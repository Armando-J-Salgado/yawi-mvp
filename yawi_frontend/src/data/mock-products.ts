import type { ProductDto } from '@/types/product';

/**
 * ⚠️ DATASET MOCK TEMPORAL.
 *
 * Simula la respuesta del futuro `GET /products` de `yawi_api` (que aún no existe).
 * Las `image_urls` apuntan a assets públicos del frontend (`/images/...`) para que el
 * catálogo se vea completo en desarrollo. `business_id` referencia negocios que pueden
 * o no existir en el backend: el join con `GET /businesses` es best-effort.
 *
 * Para sustituirlo por la API real, basta con reemplazar el cuerpo de
 * `src/api/products.api.ts` por `fetch(...)`. Este archivo puede eliminarse entonces.
 */
export const MOCK_PRODUCTS: ProductDto[] = [
  {
    id: 'p-001',
    business_id: 'b-mendoza',
    business_name: 'Familia Mendoza',
    name: 'Tapiz Zapoteco de Lana Natural',
    tags: ['textiles', 'decoracion', 'hecho a mano'],
    image_urls: ['/images/producto1.webp', '/images/textiles.webp'],
    price: 120,
  },
  {
    id: 'p-002',
    business_id: 'b-lopez',
    business_name: 'María López',
    name: 'Huipil Bordado con Hilos de Seda',
    tags: ['ropa', 'textiles', 'hecho a mano'],
    image_urls: ['/images/productos2.webp', '/images/ropa.webp'],
    price: 85,
  },
  {
    id: 'p-003',
    business_id: 'b-jimenez',
    business_name: 'Don Pedro Jiménez',
    name: 'Vasija Ceremonial de Barro Negro',
    tags: ['ceramica', 'decoracion'],
    image_urls: ['/images/producto3.webp', '/images/alfareria.webp'],
    price: 65,
  },
  {
    id: 'p-004',
    business_id: 'b-castro',
    business_name: 'Elena Castro',
    name: 'Aretes Filigrana en Plata 925',
    tags: ['joyeria', 'plata'],
    image_urls: ['/images/productos4.webp', '/images/joyeria.webp'],
    price: 95,
  },
  {
    id: 'p-005',
    business_id: 'b-huaman',
    business_name: 'Manuel Huamán',
    name: 'Máscara Tradicional Tallada en Cedro',
    tags: ['madera', 'decoracion'],
    image_urls: ['/images/productos5.webp', '/images/maderas.webp'],
    price: 110,
  },
  {
    id: 'p-006',
    business_id: 'b-espinoza',
    business_name: 'Rosa Espinoza',
    name: 'Sombrero Fino de Paja Toquilla',
    tags: ['accesorios', 'hecho a mano'],
    image_urls: ['/images/producto6.webp'],
    price: 140,
  },
  {
    id: 'p-007',
    business_id: 'b-mendoza',
    business_name: 'Familia Mendoza',
    name: 'Manta Tejida en Telar de Cintura',
    tags: ['textiles', 'ropa'],
    image_urls: ['/images/textiles.webp'],
    price: 75,
  },
  {
    id: 'p-008',
    business_id: 'b-castro',
    business_name: 'Elena Castro',
    name: 'Collar de Cuentas de Jade',
    tags: ['joyeria', 'decoracion'],
    image_urls: ['/images/joyeria.webp'],
    price: 60,
  },
  {
    id: 'p-009',
    business_id: 'b-jimenez',
    business_name: 'Don Pedro Jiménez',
    name: 'Jarrón de Barro Artesanal',
    tags: ['ceramica', 'hecho a mano'],
    image_urls: null,
    price: 45,
  },
  {
    id: 'p-010',
    business_id: 'b-huaman',
    business_name: 'Manuel Huamán',
    name: 'Tabla de Madera Tallada para Cocina',
    tags: ['madera', 'cocina'],
    image_urls: ['/images/maderas.webp'],
    price: 38,
  },
];
