# Demo de n8n en AWS (Terraform)

Infraestructura **mínima** para tener el agente de n8n encendido 24/7, accesible
por cualquiera por **HTTPS** y sin comprar ni administrar un dominio.

La base de datos sigue siendo la de Supabase (externa), así que **no se crea RDS**:
solo se despliega cómputo + una URL pública estable.

## Arquitectura

```
                 sslip.io (DNS gratis)
Internet ──HTTPS──►  <ip>.sslip.io
                          │
                   ┌──────▼───────┐  Elastic IP (IP fija)
                   │  EC2 t4g.small (Graviton)
                   │  ┌─────────┐        ┌──────────┐
                   │  │ Caddy   │─:5678─►│  n8n     │
                   │  │ (TLS)   │        │ (Docker) │
                   │  └─────────┘        └────┬─────┘
                   └───────────────────────────┼───────────────
                                                ▼
                                        Supabase Postgres
                                       (misma BD que en local)
```

### Recursos creados

| Recurso | Por qué |
|---|---|
| `aws_instance` (t4g.small, Amazon Linux 2023) | Único servidor: corre n8n + Caddy en Docker. ARM/Graviton = mejor relación precio/rendimiento. |
| `aws_eip` + asociación | IP fija para que la URL de webhooks no cambie al reiniciar. |
| `aws_vpc` + subred pública + IGW | Red mínima aislada, sin NAT Gateway (que costaría ~$32/mes). |
| `aws_security_group` | Abre solo 80/443 al mundo; SSH opcional restringido a tu IP. |
| `aws_ssm_parameter` (SecureString) | Guarda las variables de entorno (secretos) cifradas. Equivale al `.env` local. |
| `aws_iam_role` + instance profile | Permite a la instancia leer el parámetro SSM y administrarse por Session Manager. |

**Solo cambia `WEBHOOK_URL`**: Terraform lo calcula como
`https://<ip>.sslip.io/` y el resto de valores son idénticos a `yawi_n8n/.env`.

## Costo estimado (us-east-1, on-demand)

| Concepto | Precio aprox. |
|---|---|
| EC2 t4g.small (2 vCPU / 2 GiB) | ~US$ 12.30 / mes |
| Disco gp3 16 GiB | ~US$ 1.30 / mes |
| IPv4 pública (Elastic IP) | ~US$ 3.65 / mes |
| Transferencia de datos | despreciable para una demo |
| VPC / SSM Parameter Store / IAM | **gratis** |
| **Total** | **~US$ 17 / mes** |

> Precios de referencia; verifícalos en la calculadora de AWS antes de aplicar.
> Si quieres recortar: usa `instance_type = "t4g.micro"` (~US$ 6/mes) — 1 GiB de
> RAM es justo pero funciona para una demo sin carga. Si tu cuenta está dentro
> del free tier (12 meses), `t3.micro` + `ami_architecture = "x86_64"`.

## Requisitos

- Terraform >= 1.5
- Credenciales AWS con permisos para crear EC2, VPC, IAM, EIP y SSM
  (`aws configure`, variables de entorno o un perfil).
- El AWS CLI (para conectarte por SSM Session Manager).

## Puesta en marcha

```powershell
cd infra

# 1. Completa los secretos (copia los valores de ../yawi_n8n/.env)
Copy-Item terraform.tfvars.example terraform.tfvars
# edita terraform.tfvars

# 2. Inicializa, revisa y aplica
terraform init
terraform plan
terraform apply
```

Al terminar verás:

```
url = "https://203-0-113-10.sslip.io/"
logs_command = "..."
```

Abre la URL en el navegador (puede tardar ~1 min mientras Caddy obtiene el
certificado) y configura el usuario administrador de n8n. Como usas la **misma
BD y la misma `N8N_ENCRYPTION_KEY`**, tus workflows y credenciales ya están ahí.

## Operación diaria

Ver logs:

```powershell
terraform output -raw logs_command
```

Abrir una shell en el servidor (sin abrir SSH):

```powershell
terraform output -raw connect_command
```

Actualizar la imagen de n8n:

```powershell
# 1) fija la nueva versión en terraform.tfvars (n8n_tag) y
terraform apply          # RECREA la instancia y despliega la nueva imagen

# O, sin recrear la instancia, dentro del servidor vía SSM:
docker pull n8nio/n8n:<tag>
/opt/n8n/reload.sh       # reintenta con la imagen indicada en n8n_tag
```

> **Muy importante:** la base de datos es la misma que en local. n8n migra el
> esquema *hacia adelante* y no permite volver atrás. Verifica que tu n8n local
> use la **misma versión** que `n8n_tag`; si no, al prender el local puede fallar.
> Por eso se recomienda fijar `n8n_tag` (p.ej. `"2.46.6"`) en vez de `latest`.

Cambiar un secreto (BD, `N8N_ENCRYPTION_KEY`, etc.):

```powershell
# 1) edita terraform.tfvars
terraform apply                 # actualiza el parámetro SSM (no recrea la instancia)
# 2) en el servidor, recarga las variables y reinicia el contenedor:
/opt/n8n/reload.sh
```

> El script `reload.sh` vive en la instancia y vuelve a leer SSM sin necesidad
> de recrear la máquina. Puedes ejecutarlo así:
> `aws ssm start-session --target <id> --document-name AWS-StartNonInteractiveCommand --parameters command="/opt/n8n/reload.sh"`

Sobre el certificado TLS: por defecto `acme_email` va vacío y **Let's Encrypt**
emite el certificado sin contacto. Si prefieres un email de contacto, define
`acme_email` en `terraform.tfvars` (no uses `@example.com`: Let's Encrypt lo
rechaza y Caddy tendría que caer al respaldo ZeroSSL).

## Apagar / destruir

Detener sin borrar (deja de facturar cómputo, conserva IP y datos):

```powershell
aws ec2 stop-instances --instance-ids $(terraform output -raw instance_id)
```

Eliminar todo:

```powershell
terraform destroy
```

## Notas de seguridad

- Los secretos **nunca** se escriben en el `user_data` ni en logs: la instancia
  los lee en el arranque desde SSM con su rol IAM.
- `terraform.tfstate` contiene los secretos: está en `.gitignore`. Para uso más
  serio, configura un backend remoto cifrado (S3 + DynamoDB) en `versions.tf`.
- El puerto SSH queda cerrado por defecto; el acceso es vía SSM Session Manager,
  que queda auditado en CloudTrail.
- Para producción real, considera un dominio propio + ACM/WAF y un ALB.
