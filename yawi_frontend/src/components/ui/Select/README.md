# Componente Select

Selector dropdown reutilizable estilizado con icono Chevron según `DESIGN.md`.

## Props

| Prop          | Tipo                      | Default       | Descripción                          |
| ------------- | ------------------------- | ------------- | ------------------------------------ |
| `value`       | `string`                  | **requerido** | Valor seleccionado actualmente       |
| `onChange`    | `(value: string) => void` | **requerido** | Manejador de cambio                  |
| `options`     | `SelectOption[]`          | **requerido** | Lista de opciones `{ value, label }` |
| `label`       | `string`                  | `undefined`   | Etiqueta accesible                   |
| `placeholder` | `string`                  | `undefined`   | Opción deshabilitada inicial         |
| `error`       | `string`                  | `undefined`   | Mensaje de error traducido           |
| `name`        | `string`                  | `undefined`   | Atributo name                        |
| `id`          | `string`                  | `undefined`   | Atributo id                          |
| `disabled`    | `boolean`                 | `false`       | Estado deshabilitado                 |
| `className`   | `string`                  | `''`          | Clases adicionales                   |

## Ejemplo de uso

```tsx
<Select
  name="country"
  label="País"
  placeholder="Selecciona tu país"
  value={selectedCountry}
  onChange={setSelectedCountry}
  options={countries}
  error={errors.country}
/>
```
