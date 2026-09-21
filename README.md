# YAWI MVP

## Descripción General

YAWI es una aplicación compuesta por tres componentes principales:

- **Frontend:** React + Vite + TypeScript
- **Backend:** NestJS + TypeScript
- **Automatización:** n8n
- **Persistencia:** PostgreSQL (Supabase)

El proyecto se desarrolla mediante una arquitectura **Monorepo**, donde todos los componentes comparten un único repositorio Git.

---

# Estructura del Proyecto

```text
mvp/
│
├── yawi_api/
│   ├── src/
│   ├── .env.local
│   ├── .env.example
│   ├── Dockerfile
│   └── ...
│
├── yawi_frontend/
│   ├── src/
│   ├── .env.local
│   ├── .env.example
│   ├── Dockerfile
│   └── ...
│
├── yawi_n8n/
│   ├── .env
│   ├── .env.example
│   └── ...
│
├── docker-compose.local.yml
├── .gitignore
└── README.md
```

---

# Requisitos

Antes de ejecutar el proyecto es necesario contar con:

- Git
- Docker Desktop
- Docker Compose
- Node.js (opcional para desarrollo fuera de Docker)

Verificar instalación:

```powershell
docker --version
docker compose version
git --version
```

---

# Variables de Entorno

## Backend

Archivo:

```text
yawi_api/.env.local
```

Variables mínimas:

```env
NODE_ENV=development
PORT=3000

DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=1d

CORS_ORIGIN=http://localhost:4173
```

---

## Frontend

Archivo:

```text
yawi_frontend/.env.local
```

Variables mínimas:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=YAWI
```

---

## n8n

Archivo:

```text
yawi_n8n/.env
```

Variables mínimas:

```env
DB_TYPE=postgresdb

DB_POSTGRESDB_HOST=
DB_POSTGRESDB_PORT=
DB_POSTGRESDB_DATABASE=
DB_POSTGRESDB_USER=
DB_POSTGRESDB_PASSWORD=YOUR_DATABASE_PASSWORD

N8N_ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY

N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http

WEBHOOK_URL=http://localhost:5678/
```

### Importante

Si las credenciales contienen el carácter:

```text
$
```

deben escaparse para Docker Compose usando:

```text
$$
```

Ejemplo:

```env
DB_POSTGRESDB_PASSWORD=MyPassword$$123
```

---

# Primer Arranque

Desde la raíz del proyecto:

```powershell
docker compose -f docker-compose.local.yml up -d --build
```

Este comando:

- Construye las imágenes locales necesarias.
- Crea los contenedores.
- Inicia el entorno completo.

---

# Acceso a los Servicios

Frontend:

```text
http://localhost:4173
```

Backend:

```text
http://localhost:3000
```

n8n:

```text
http://localhost:5678
```

---

# Comandos Útiles

## Ver contenedores activos

```powershell
docker ps
```

---

## Ver todos los contenedores

```powershell
docker ps -a
```

---

## Ver logs de Backend

```powershell
docker logs yawi_api
```

---

## Ver logs de Frontend

```powershell
docker logs yawi_frontend
```

---

## Ver logs de n8n

```powershell
docker logs yawi_n8n
```

---

## Seguir logs en tiempo real

```powershell
docker logs -f yawi_api
```

```powershell
docker logs -f yawi_frontend
```

```powershell
docker logs -f yawi_n8n
```

---

## Reiniciar el entorno completo

```powershell
docker compose -f docker-compose.local.yml down
```

Luego:

```powershell
docker compose -f docker-compose.local.yml up -d
```

---

## Forzar reconstrucción

```powershell
docker compose -f docker-compose.local.yml up -d --build --force-recreate
```

---

## Eliminar contenedores detenidos

```powershell
docker container prune
```

---

## Eliminar imágenes no utilizadas

```powershell
docker image prune
```

---

# Convenciones de Desarrollo

## Backend

Ubicación:

```text
yawi_api/
```

Tecnología:

```text
NestJS
```

Alias recomendado:

```ts
import { AuthService } from 'src/auth/auth.service';
```

---

## Frontend

Ubicación:

```text
yawi_frontend/
```

Tecnología:

```text
React + Vite + TypeScript
```

Todas las llamadas API deben utilizar:

```env
VITE_API_URL
```

Evitar URLs hardcodeadas.

---

## Automatizaciones

Ubicación:

```text
yawi_n8n/
```

Tecnología:

```text
n8n
```

Los workflows y credenciales deben persistirse en PostgreSQL y nunca depender del almacenamiento local del contenedor.

---

# Flujo de Trabajo Recomendado

1. Crear o actualizar variables de entorno.
2. Levantar el entorno con Docker Compose.
3. Verificar acceso a Frontend, Backend y n8n.
4. Realizar desarrollo.
5. Validar cambios localmente.
6. Realizar commit.

---

# CI/CD

> Pendiente de implementación.