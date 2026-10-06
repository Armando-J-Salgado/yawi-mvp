# Design Style Guide

## Objetivo

Construir una experiencia visual premium, amigable y moderna que combine:

- La calidez humana y confiable de Etsy.
- La limpieza editorial del sitio de viajes.
- La organización visual de la landing de ONG.
- La paleta moderna y vibrante de Vireo.

La experiencia debe sentirse:

- Humana
- Cercana
- Moderna
- Limpia
- Premium pero accesible
- Visualmente ligera
- Optimista y tecnológica

Evitar estilos corporativos fríos, futuristas extremos o diseños oscuros agresivos.

---

# Color System

## Primary Brand Colors

Inspirados en Vireo.

```css
Primary Navy: #18245B
Primary Indigo: #6776FF
Soft Lavender: #B7B1FF
Peach Accent: #F4A782
```

## Secondary Colors

```css
Background: #FAF9F7
Surface: #FFFFFF
Border: #ECECEC
Muted Text: #707070
Primary Text: #1D1D1D
```

---

# Color Usage Rules

## Primary Navy (#18245B)

Usar para:

- Logo
- Header
- Botones principales
- Textos prioritarios
- Títulos importantes
- Íconos destacados

Nunca convertir la página completa en un fondo azul oscuro.

---

## Primary Indigo (#6776FF)

Usar para:

- Hover states
- Links
- Indicadores
- Métricas
- Elementos activos

---

## Soft Lavender (#B7B1FF)

Usar para:

- Fondos decorativos
- Blurs
- Gradientes suaves
- Ilustraciones
- Elementos de soporte visual

Nunca usar para texto principal.

---

## Peach Accent (#F4A782)

Usar solamente para:

- CTA importantes
- Etiquetas destacadas
- Estados positivos
- Subrayados visuales
- Micro detalles decorativos

Debe ocupar menos del 10% del área visible.

---

# Brand Personality

La interfaz debe transmitir:

- Confianza
- Descubrimiento
- Curiosidad
- Cercanía
- Calidad
- Optimismo

Debe parecer una mezcla entre:

- Marketplace moderno
- Producto SaaS premium
- Revista digital de calidad

No debe verse como:

- Banco
- ERP empresarial
- Dashboard industrial
- Sitio gubernamental
- Aplicación futurista tipo cyberpunk

---

# Background Strategy

Utilizar fondos cálidos y suaves.

```css
Main Background: #FAF9F7
Cards: #FFFFFF
```

El fondo debe sentirse similar a papel premium o una superficie editorial ligera.

Evitar:

```css
#FFFFFF en toda la pantalla
```

porque genera sensación clínica.

---

# Gradient System

Inspirado directamente en Vireo.

Ejemplo principal:

```css
linear-gradient(
  135deg,
  #18245B,
  #6776FF,
  #B7B1FF,
  #F4A782
)
```

Principios:

- Gradientes suaves
- Transiciones largas
- Bordes difuminados
- Nunca colores neón

---

# Typography

## Headings

Características:

```css
font-weight: 700-800
letter-spacing: -0.03em
line-height: 1.1
```

Sensación:

- Editorial
- Elegante
- Clara
- Fuerte

Los títulos deben ser grandes y cortos.

---

## Body Text

Características:

```css
font-size: 16px-18px
line-height: 1.7
font-weight: 400
```

Priorizar siempre la legibilidad.

---

## Hierarchy

```text
Heading XL
Heading L
Heading M
Body
Caption
```

Nunca utilizar más de dos familias tipográficas.

---

# Layout Philosophy

Inspiración principal:

- Etsy
- Globe Trekker
- Landing ONG

Principio:

La interfaz debe sentirse abierta y respirable.

Mucho espacio en blanco.

---

## Section Spacing

```css
80px - 140px
```

entre secciones principales.

---

## Component Spacing

```css
24px - 40px
```

entre widgets relacionados.

---

## Internal Padding

```css
24px - 40px
```

para tarjetas y contenedores.

---

# Widget Design System

Todos los widgets deben ser independientes visualmente.

Características:

```css
background: white;
border-radius: 24px;
border: 1px solid rgba(0, 0, 0, 0.05);
```

La información debe caber en una sola lectura rápida.

---

## Widget Structure

```text
[Icono]

Título corto

Descripción breve

Acción opcional
```

---

## Widget Behavior

Hover:

```css
translateY(-4px)
```

Sombras suaves.

Nunca usar:

- Rebotes
- Rotaciones
- Efectos exagerados

---

# Card Design

Inspiradas en Etsy y Globe Trekker.

Características:

```css
border-radius: 20px - 28px;
background: white;
overflow: hidden;
```

Las tarjetas deben sentirse amigables y modernas.

---

## Card Content

Prioridad:

```text
Imagen
Título
Resumen
Acción
```

Reducir ruido visual.

---

# Iconography

Inspiración:

- Vireo
- ONG
- Productos modernos

Características:

- Simples
- Redondeados
- Delgados
- Modernos

Tamaños recomendados:

```css
24px
32px
48px
```

Evitar:

- Estilo industrial
- Estilo empresarial pesado
- Iconos excesivamente detallados

---

# Photography Direction

Las imágenes deben ser:

- Reales
- Luminosas
- Cálidas
- Naturales
- Cercanas

No deben parecer:

- Fotos corporativas
- Stock artificial
- Marketing genérico

---

## Image Treatment

Aplicar:

- Contraste moderado
- Saturación natural
- Enfoque suave
- Fondos ligeramente desenfocados

---

# Hero Section Rules

Distribución recomendada:

```text
40% contenido
60% visual
```

Estructura:

```text
Título

Descripción breve

CTA Primario
CTA Secundario

Visual destacado
```

Nunca saturar la hero section con demasiado texto.

---

# CTA System

## Primary Button

```css
background: #18245b;
color: white;
border-radius: 999px;
padding: 14px 28px;
font-weight: 600;
```

---

## Secondary Button

```css
background: transparent;
border: 1px solid #18245b;
color: #18245b;
```

---

## CTA Rules

El usuario siempre debe identificar:

```text
Una acción principal
Una acción secundaria
```

Nunca más de dos CTAs compitiendo visualmente.

---

# Decorative Elements

Inspiración:

- Vireo
- Landing ONG

Se permiten:

- Blurs
- Dots
- Formas orgánicas
- Círculos flotantes
- Gradientes suaves
- Ondas abstractas

No usar:

- Glassmorphism pesado
- Neón
- Efectos futuristas
- Objetos 3D llamativos

---

# Visual Density

Regla principal:

```text
Menos texto
Más estructura visual
```

La página debe sentirse:

- Escaneable
- Ligera
- Moderna

Evitar bloques extensos de contenido.

---

# Responsive Behavior

## Desktop

Usar grids de:

```text
2 columnas
3 columnas
4 columnas
```

según el contexto.

---

## Tablet

Reducir a:

```text
2 columnas
```

---

## Mobile

Reducir a:

```text
1 columna
```

Mantener:

- Tarjetas grandes
- Bordes redondeados
- Jerarquía clara
- CTAs visibles

La versión móvil debe sentirse cercana al lenguaje visual de una aplicación moderna.

---

# Etsy Influence Rules

Tomar de Etsy:

- Simplicidad visual
- Navegación intuitiva
- Espacios generosos
- Sensación humana
- Productos y contenido como protagonistas

No copiar:

- Estética marketplace saturada
- Densidad de elementos
- Exceso de categorías visibles

---

# Globe Trekker Influence Rules

Tomar:

- Composición editorial
- Tarjetas grandes
- Secciones bien
