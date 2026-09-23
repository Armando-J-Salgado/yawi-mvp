# YAWI API — Registro de Decisiones Arquitectónicas (ADR)

Este documento registra las decisiones arquitectónicas clave tomadas durante el diseño e implementación de la infraestructura base y los módulos `vendors`, `phone-numbers`, `businesses` y `payment-preferences`.

---

## Índice de Decisiones

| # | Decisión | Estado | Contexto / Justificación |
|---|----------|--------|--------------------------|
| **ADR-001** | Uso de UUID (v4) como Clave Primaria (PK) | Aceptada | Evita enumeración de IDs, favorece sistemas distribuidos y mejora seguridad en APIs públicas. |
| **ADR-002** | Base de datos SQLite in-memory (`better-sqlite3`) para Testing | Aceptada | Provee ejecución ultra rápida, aislamiento total de la base de datos principal y compatibilidad con NestJS v11 sin dependencias externas en CI/CD. |
| **ADR-003** | `DataSource.transaction()` para creación atómica Vendor + PhoneNumber | Aceptada | Garantiza atomicidad sin manejar manualmente `QueryRunner`, asegurando rollback automático ante fallas en cualquiera de las dos entidades. |
| **ADR-004** | `autoLoadEntities: true` en DatabaseModule | Aceptada | Desacopla la configuración central de TypeORM de las entidades específicas; cada módulo registra sus entidades mediante `TypeOrmModule.forFeature()`. |
| **ADR-005** | Columna explícita `owner_id` con relación `@ManyToOne` en PhoneNumber | Aceptada | Permite realizar filtros directos por `owner_id` en repositorios sin necesidad de realizar joins ni queries complejas. |
| **ADR-006** | Soft Delete nativo con `@DeleteDateColumn()` | Aceptada | Aprovecha los métodos nativos de TypeORM (`softRemove`, `softDelete`, `recover`, `restore`, `withDeleted: true`) manteniendo integridad y consistencia en eliminaciones lógicas. |
| **ADR-007** | Query Params individuales mapeados a `FilterDto` en operaciones `list` | Aceptada | Formato RESTful estándar, fácil de cachear y documentar en OpenAPI/Swagger sin requerir serialización compleja en el cliente. |
| **ADR-008** | Hashing de contraseñas con `bcrypt` en capa de servicio | Aceptada | Estándar de la industria para almacenamiento seguro de credenciales con salt automático. Se ejecuta en `VendorsService` antes de persistir. |
| **ADR-009** | Inclusión de `phone_number` dentro de `CreateVendorDto` | Aceptada | Satisface el caso de uso donde todo vendor nace con un teléfono de forma atómica en un único request POST. |
| **ADR-010** | Ejecución secuencial (`maxWorkers: 1` / `--runInBand`) en tests e2e | Aceptada | Evita colisiones de estado en SQLite in-memory y garantiza orden determinístico en pruebas de integración. |
| **ADR-011** | `synchronize: true` en configuración de TypeORM | Aceptada | Agiliza el desarrollo inicial del MVP. Se migrará a migraciones explícitas TypeORM en etapas posteriores. |
| **ADR-012** | Convención de nombres en kebab-case (`phone-numbers`) para directorios | Aceptada | Sigue el estándar estricto del CLI de NestJS (`nest g resource phone-numbers`), manteniendo coherencia en toda la base de código. |
| **ADR-013** | `decimal(10,2)` para columna `balance` en Business | Aceptada | Evita errores de punto flotante (`0.1 + 0.2 ≠ 0.3` en `float`). Precisión exacta requerida para operaciones financieras en USD. |
| **ADR-014** | `balance` con default `0.00` y validación `@Min(0)` en DTO | Aceptada | Valor por defecto coherente para negocios nuevos. `@Min(0)` previene balances negativos desde el DTO. |
| **ADR-015** | `simple-json` para `account_information` en PaymentPreference | Aceptada | Serializa como string en SQLite (testing) y como JSON nativo en PostgreSQL (producción). Garantiza compatibilidad dual sin configuración extra. |
| **ADR-016** | Relaciones inversas `@OneToMany` en Vendor para Business y PaymentPreference | Aceptada | Permite cargar businesses y payment_preferences desde Vendor con `relations: {}` sin necesidad de joins manuales. Consistente con el patrón de `phone_numbers`. |
| **ADR-017** | Patrón `PhoneNumbersService` replicado para Businesses y PaymentPreferences | Aceptada | Ambos módulos siguen la misma estructura: validación de `owner_id` contra `Vendor`, repositorio inyectado con `@InjectRepository`, sin transacciones complejas. Facilita mantenimiento por consistencia. |
