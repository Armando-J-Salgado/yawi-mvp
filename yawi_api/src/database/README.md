# 🗄️ Database Module

Este módulo centraliza la configuración de persistencia relacional con **TypeORM**, la conexión con PostgreSQL (Supabase) y herramientas para inicialización y limpieza de datos.

---

## 📋 Responsabilidades

1. **Configuración Global de TypeORM (`database.module.ts`)**:
   - Conexión asíncrona mediante `TypeOrmModule.forRootAsync()`.
   - Carga dinámica de credenciales desde `.env.local` usando `ConfigService`.
   - `autoLoadEntities: true`: Permite que cada módulo registre sus propias entidades con `.forFeature([Entity])`.
   - `synchronize: true`: Mantiene sincronizado el esquema de la base de datos para desarrollo del MVP.

2. **Servicio de Base de Datos (`database.service.ts`)**:
   - `isDatabaseEmpty()`: Verifica si la base de datos se encuentra vacía.
   - `seed()`: Inserta registros de prueba (3 vendors con números telefónicos asociados, 3 businesses y 3 payment preferences) si no existen registros previos.
   - `clear()`: Limpia/trunca todas las tablas (`payment_preferences`, `businesses`, `phone_numbers`, `vendors`) respetando claves foráneas (`CASCADE`).

3. **Script de Limpieza (`clear-database.script.ts`)**:
   - Punto de entrada para el comando `npm run migrate:fresh`.

---

## ⚙️ Variables de Entorno Requeridas

Definidas en `yawi_api/.env.local`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=yawi_api_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```

---

## 🚀 Comandos Útiles

```bash
# Limpiar todas las tablas de la base de datos (fresh reset)
npm run migrate:fresh
```
