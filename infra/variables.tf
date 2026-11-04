# ---------------------------------------------------------------------------
# Configuración general
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "Región de AWS donde se despliega la demo."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Prefijo para nombrar y etiquetar todos los recursos."
  type        = string
  default     = "yawi-n8n"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,30}$", var.project))
    error_message = "Usa solo minúsculas, números y guiones (3-30 caracteres)."
  }
}

variable "instance_type" {
  description = "Tipo de instancia EC2. t4g.small (2 vCPU / 2 GiB) es el mínimo recomendado para n8n. t4g.micro es más barato pero justo de memoria."
  type        = string
  default     = "t4g.small"
}

variable "ami_architecture" {
  description = "Arquitectura de la AMI: arm64 (Graviton, más barato) o x86_64 (Intel/AMD, free tier t3.micro)."
  type        = string
  default     = "arm64"

  validation {
    condition     = contains(["arm64", "x86_64"], var.ami_architecture)
    error_message = "Debe ser 'arm64' o 'x86_64'."
  }
}

variable "root_volume_size" {
  description = "Tamaño (GiB) del disco raíz gp3."
  type        = number
  default     = 16
}

variable "n8n_tag" {
  description = "Tag de la imagen n8nio/n8n. Usa el MISMO que en local para evitar migraciones de base de datos."
  type        = string
  default     = "latest"
}

variable "custom_hostname" {
  description = "Hostname propio si algún día compras un dominio. Vacío = se usa <ip>.sslip.io (HTTPS automático)."
  type        = string
  default     = ""
}

variable "acme_email" {
  description = "Email para la cuenta ACME de Let's Encrypt (Caddy). Vacío = sin contacto (Let's Encrypt lo acepta). No uses example.com: está prohibido por Let's Encrypt."
  type        = string
  default     = ""
}

variable "admin_cidr" {
  description = "CIDR opcional con acceso SSH (ej: 203.0.113.10/32). Vacío = sin SSH abierto (usa SSM Session Manager)."
  type        = string
  default     = ""
}

variable "timezone" {
  description = "Zona horaria de los workflows de n8n."
  type        = string
  default     = "America/El_Salvador"
}

# ---------------------------------------------------------------------------
# Secretos: deben coincidir con yawi_n8n/.env (ver terraform.tfvars.example)
# ---------------------------------------------------------------------------

variable "db_host" {
  description = "Host de PostgreSQL (Supabase pooler)."
  type        = string
}

variable "db_port" {
  description = "Puerto de PostgreSQL."
  type        = string
  default     = "6543"
}

variable "db_name" {
  description = "Nombre de la base de datos."
  type        = string
  default     = "postgres"
}

variable "db_user" {
  description = "Usuario de PostgreSQL."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Contraseña de PostgreSQL. Usa el valor LITERAL (sin escapar '$' como en docker-compose)."
  type        = string
  sensitive   = true
}

variable "n8n_encryption_key" {
  description = "N8N_ENCRYPTION_KEY. Debe ser la misma que en local para reutilizar las credenciales ya guardadas."
  type        = string
  sensitive   = true
}
