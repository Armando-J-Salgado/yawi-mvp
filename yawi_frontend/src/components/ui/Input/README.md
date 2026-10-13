# Componente Input

Componente de entrada de texto genérico y reutilizable para formularios de Yawi.

## Props

| Prop           | Tipo                                                            | Default       | Descripción                                    |
| -------------- | --------------------------------------------------------------- | ------------- | ---------------------------------------------- |
| `value`        | `string`                                                        | **requerido** | Valor controlado del input                     |
| `onChange`     | `(value: string) => void`                                       | **requerido** | Manejador de cambio de valor                   |
| `type`         | `'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search'` | `'text'`      | Tipo HTML del input                            |
| `label`        | `string`                                                        | `undefined`   | Etiqueta accesible                             |
| `placeholder`  | `string`                                                        | `undefined`   | Texto de ayuda del placeholder                 |
| `error`        | `string`                                                        | `undefined`   | Mensaje de error traducido (activa borde rojo) |
| `name`         | `string`                                                        | `undefined`   | Atributo name de HTML                          |
| `id`           | `string`                                                        | `undefined`   | Atributo id de HTML (fallback a name)          |
| `disabled`     | `boolean`                                                       | `false`       | Estado deshabilitado                           |
| `className`    | `string`                                                        | `''`          | Clases de estilo para el wrapper               |
| `autoComplete` | `string`                                                        | `undefined`   | Atributo autocomplete HTML                     |

## Ejemplo de uso

```tsx
<Input
  type="email"
  name="email"
  label="Correo electrónico"
  placeholder="tu@correo.com"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```
