export interface CategoryDetailInfo {
  materials: string; // Materiales tradicionales
  techniques: string; // Técnicas ancestrales
  origin: string; // Regiones o comunidades
  culturalNote: string; // Reseña cultural breve
  suggestedTags: { tag: string; label: string }[]; // Sub-filtros específicos
}

export interface Category {
  id: string; // identificador interno
  slug: string; // URL slug → /artesanias/:slug
  tag: string; // tag para filtrar productos (coincide con product.tags[])
  image: string; // ruta en /images/
  titleKey: string; // clave i18n para el nombre
  descriptionKey: string; // clave i18n para descripción SEO
  order: number; // orden de presentación
  details: CategoryDetailInfo;
}

export const CATEGORIES: Category[] = [
  {
    id: 'barro-ceramica',
    slug: 'barro-ceramica',
    tag: 'barro-ceramica',
    image: '/images/alfareria.webp',
    titleKey: 'artesanias.categories.barro_ceramica',
    descriptionKey: 'artesanias.categories.barro_ceramica_desc',
    order: 1,
    details: {
      materials: 'Barro rojo, arcilla negra, engobes naturales, pigmentos minerales.',
      techniques:
        'Modelado a mano, torno de pie, cocción en horno de leña y bruñido con piedra de río.',
      origin: 'Guatajiagua (Morazán), Ilobasco (Cabañas) y San Antonio Palopó.',
      culturalNote:
        'Técnica ancestral de alfarería negra heredada del pueblo lenca, teñida con el tinte natural del fruto del nacascolo.',
      suggestedTags: [
        { tag: 'decoración', label: 'Decoración' },
        { tag: 'barro', label: 'Barro tradicional' },
        { tag: 'cerámica', label: 'Cerámica' },
        { tag: 'vajilla', label: 'Vajilla & Mesa' },
      ],
    },
  },
  {
    id: 'maderas',
    slug: 'maderas',
    tag: 'maderas',
    image: '/images/maderas.webp',
    titleKey: 'artesanias.categories.maderas',
    descriptionKey: 'artesanias.categories.maderas_desc',
    order: 2,
    details: {
      materials: 'Cedro real, palo blanco, caoba, pino y tintes vegetales.',
      techniques:
        'Tallado manual en relieve con gubias, ensamblado de caja y espiga, pulido con cera de abeja.',
      origin: 'La Palma (Chalatenango), Totonicapán y Suchitoto.',
      culturalNote:
        'Fusión de la imaginería colonial con motivos geométricos y de fauna mesoamericana, preservando maderas sostenibles de podas controladas.',
      suggestedTags: [
        { tag: 'decoración', label: 'Decoración' },
        { tag: 'cocina', label: 'Utensilios de cocina' },
        { tag: 'cultural', label: 'Piezas ceremoniales' },
        { tag: 'esculturas', label: 'Esculturas' },
      ],
    },
  },
  {
    id: 'textiles-tejidos',
    slug: 'textiles-tejidos',
    tag: 'textiles-tejidos',
    image: '/images/textiles.webp',
    titleKey: 'artesanias.categories.textiles_tejidos',
    descriptionKey: 'artesanias.categories.textiles_tejidos_desc',
    order: 3,
    details: {
      materials: 'Algodón 100%, lana criolla, tintes de añil (xiquilite), cochinilla y achiote.',
      techniques:
        'Telar de cintura prehispánico, telar de pedal tradicional, bordado en relieve y deshilado.',
      origin: 'San Sebastián (San Vicente), Cacaopera y Santiago Atitlán.',
      culturalNote:
        'Cada urdimbre entrelaza símbolos sagrados de la cosmovisión maya y lenca. El añil salvadoreño es reconocido como el oro azul por su pureza incomparable.',
      suggestedTags: [
        { tag: 'hogar', label: 'Hogar & Hamacas' },
        { tag: 'ropa', label: 'Indumentaria & Huipiles' },
        { tag: 'cultural', label: 'Bordados tradicionales' },
        { tag: 'dormitorio', label: 'Ropa de cama' },
      ],
    },
  },
  {
    id: 'joyeria',
    slug: 'joyeria',
    tag: 'joyeria',
    image: '/images/joyeria.webp',
    titleKey: 'artesanias.categories.joyeria',
    descriptionKey: 'artesanias.categories.joyeria_desc',
    order: 4,
    details: {
      materials: 'Jade jadeíta de Motagua, plata esterlina 925, semillas de tagua y concha nácar.',
      techniques:
        'Filigrana en plata, tallado y pulido de jade con agua, engaste manual y ensartado de semillas.',
      origin: 'Antigua Guatemala, Suchitoto y San Salvador.',
      culturalNote:
        'Para las culturas mesoamericanas, el jade simbolizaba el aliento vital, el agua sagrada y el poder espiritual del maíz tierno.',
      suggestedTags: [
        { tag: 'piedras', label: 'Jade & Gemas' },
        { tag: 'semillas', label: 'Semillas naturales' },
        { tag: 'collares', label: 'Collares' },
        { tag: 'aretes', label: 'Aretes & Pulseras' },
      ],
    },
  },
  {
    id: 'pinturas-arte',
    slug: 'pinturas-arte',
    tag: 'pinturas-arte',
    image: '/images/pinturas.webp',
    titleKey: 'artesanias.categories.pinturas_arte',
    descriptionKey: 'artesanias.categories.pinturas_arte_desc',
    order: 5,
    details: {
      materials: 'Lienzo de manta de algodón, madera de copinol, semillas secas y acrílicos.',
      techniques:
        'Estilo naíf en colores puros, pincelado en miniatura sobre semillas y dibujo geométrico estilizado.',
      origin: 'La Palma (Chalatenango), San Juan Comalapa y Panchimalco.',
      culturalNote:
        'Inspirado por el maestro Fernando Llort, este estilo plasma la armonía comunitaria, la fe y la belleza rural salvadoreña en trazos inconfundibles.',
      suggestedTags: [
        { tag: 'cuadros', label: 'Cuadros & Lienzos' },
        { tag: 'decoración', label: 'Arte decorativo' },
        { tag: 'miniaturas', label: 'Miniaturas' },
        { tag: 'eventos', label: 'Temático' },
      ],
    },
  },
  {
    id: 'accesorios',
    slug: 'accesorios',
    tag: 'accesorios',
    image: '/images/accesorios.webp',
    titleKey: 'artesanias.categories.accesorios',
    descriptionKey: 'artesanias.categories.accesorios_desc',
    order: 6,
    details: {
      materials: 'Fibra de henequén, palma jipi japa, mimbre, cuero curtido vegetal y añil.',
      techniques:
        'Tejido en espiral de palma, cordelería y trenzado de henequén, costura manual en cuero.',
      origin: 'San Sebastián, Tenancingo, Tenosique y Santa Cruz del Quiché.',
      culturalNote:
        'Fibras vegetales recolectadas y procesadas a mano que transforman elementos de la tierra en piezas cotidianas de alta durabilidad y elegancia natural.',
      suggestedTags: [
        { tag: 'bolsos', label: 'Bolsos & Morrales' },
        { tag: 'sombreros', label: 'Sombreros de palma' },
        { tag: 'palma', label: 'Palma tejida' },
        { tag: 'henequén', label: 'Henequén' },
      ],
    },
  },
];
