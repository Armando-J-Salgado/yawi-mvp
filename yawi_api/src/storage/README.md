# Storage Module

## Overview
Módulo que encapsula la infraestructura de almacenamiento de archivos. Implementa el patrón Adapter para desacoplar el mecanismo de almacenamiento del resto de la aplicación.

## Subdirectorios
- `adapters/`: Contiene la clase abstracta `StorageAdapter`, los adapters concretos (`LocalStorageAdapter`, `SupabaseStorageAdapter`) y sus DTOs/interfaces.
- `services/`: Contiene los servicios de bajo nivel con la lógica real de I/O (`LocalStorageService`, `SupabaseStorageService`).

## Exports
- `LocalStorageAdapter`
- `SupabaseStorageAdapter`

## Dependencias
- `SupabaseModule` (global)
- `ConfigModule` (global)
