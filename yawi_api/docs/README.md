# YAWI API — Documentación Técnica de Arquitectura y Desarrollo

Bienvenido a la carpeta de documentación de `yawi_api`. Esta sección contiene las especificaciones técnicas, planes de trabajo y registros de decisiones arquitectónicas del backend de YAWI.

---

## 📚 Documentos Disponibles

1. **[Plan de Implementación (`IMPLEMENTATION_PLAN.md`)](./IMPLEMENTATION_PLAN.md)**:
   - Guía exhaustiva paso a paso para la implementación de la infraestructura base, módulos `vendors` y `phone-numbers`, configuración de TypeORM, Swagger, transacciones, TDD y pruebas de integración.

2. **[Registro de Decisiones Arquitectónicas — ADR (`DECISIONS.md`)](./DECISIONS.md)**:
   - Resumen y justificación técnica de todas las decisiones estructurales clave (UUIDs, SQLite en testing, convenciones de nombres, soft delete, transaccionalidad, hashing con bcrypt, etc.).

---

## 🛠️ Módulos del Sistema

Cada carpeta dentro de `src/` cuenta con su respectivo `README.md` con detalles técnicos específicos:

- **[Database Module](../src/database/README.md)**: Configuración de TypeORM, seeding y reseteo.
- **[Vendors Module](../src/vendors/README.md)**: Entidades, DTOs, transacciones y endpoints de Vendors.
- **[Phone Numbers Module](../src/phone-numbers/README.md)**: Gestión de números telefónicos y relación N:1 con Vendors.
