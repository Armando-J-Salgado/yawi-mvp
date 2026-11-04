data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

# ---------------------------------------------------------------------------
# Red: VPC mínima con una subred pública y salida a Internet (sin NAT Gateway)
# ---------------------------------------------------------------------------

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${var.project}-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = { Name = "${var.project}-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = false

  tags = { Name = "${var.project}-public" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = { Name = "${var.project}-public" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ---------------------------------------------------------------------------
# Security Group: solo 80/443 públicos (+ SSH opcional)
# ---------------------------------------------------------------------------

resource "aws_security_group" "n8n" {
  name        = "${var.project}-n8n"
  description = "Acceso publico HTTPS a n8n"
  vpc_id      = aws_vpc.main.id

  ingress {
    description      = "HTTP (ACME y redireccion a HTTPS)"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTPS"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  dynamic "ingress" {
    for_each = var.admin_cidr == "" ? [] : [var.admin_cidr]
    content {
      description = "SSH (opcional)"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    description      = "Salida a Internet (Supabase, n8n, ACME)"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = { Name = "${var.project}-n8n" }
}

# ---------------------------------------------------------------------------
# IAM: la instancia lee sus secretos desde SSM y se administra por Session Manager
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "n8n" {
  name               = "${var.project}-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.n8n.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "n8n" {
  statement {
    sid       = "ReadN8nEnvParameter"
    actions   = ["ssm:GetParameter", "ssm:GetParameters"]
    resources = [aws_ssm_parameter.n8n_env.arn]
  }

  statement {
    sid       = "DecryptSsmSecureString"
    actions   = ["kms:Decrypt"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "n8n" {
  name   = "${var.project}-n8n"
  role   = aws_iam_role.n8n.id
  policy = data.aws_iam_policy_document.n8n.json
}

resource "aws_iam_instance_profile" "n8n" {
  name = "${var.project}-ec2"
  role = aws_iam_role.n8n.name
}

# ---------------------------------------------------------------------------
# AMI: Amazon Linux 2023 (última disponible para la arquitectura elegida)
# ---------------------------------------------------------------------------

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-${var.ami_architecture}"]
  }

  filter {
    name   = "architecture"
    values = [var.ami_architecture]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# ---------------------------------------------------------------------------
# Secretos + hostname derivado de la IP elástica
# ---------------------------------------------------------------------------

locals {
  common_tags = {
    Project   = var.project
    ManagedBy = "Terraform"
    Component = "n8n"
  }

  # sslip.io resuelve <ip-con-guiones>.sslip.io a esa IP -> HTTPS gratis sin dominio.
  eip_dashed = replace(aws_eip.n8n.public_ip, ".", "-")
  n8n_host   = var.custom_hostname != "" ? var.custom_hostname : "${local.eip_dashed}.sslip.io"

  n8n_env = join("\n", [
    "# Generado por Terraform. No editar a mano: cambia infra/variables.tf.",
    "DB_TYPE=postgresdb",
    "DB_POSTGRESDB_HOST=${var.db_host}",
    "DB_POSTGRESDB_PORT=${var.db_port}",
    "DB_POSTGRESDB_DATABASE=${var.db_name}",
    "DB_POSTGRESDB_USER=${var.db_user}",
    "DB_POSTGRESDB_PASSWORD=${var.db_password}",
    "",
    "N8N_ENCRYPTION_KEY=${var.n8n_encryption_key}",
    "",
    "N8N_HOST=${local.n8n_host}",
    "N8N_PORT=5678",
    "N8N_PROTOCOL=https",
    "N8N_WEBHOOK_URL=https://${local.n8n_host}/",
    "WEBHOOK_URL=https://${local.n8n_host}/",
    "N8N_PROXY_HOPS=1",
    "N8N_SECURE_COOKIE=true",
    "",
    "GENERIC_TIMEZONE=${var.timezone}",
    "",
    "N8N_DIAGNOSTICS_ENABLED=false",
    "N8N_PERSONALIZATION_ENABLED=false",
    "",
  ])
}

resource "aws_ssm_parameter" "n8n_env" {
  name        = "/${var.project}/n8n/env"
  description = "Variables de entorno (secretos) del contenedor n8n de la demo"
  type        = "SecureString"
  value       = local.n8n_env
}

# ---------------------------------------------------------------------------
# Cómputo: EC2 con Docker (n8n + Caddy) e IP elástica
# ---------------------------------------------------------------------------

resource "aws_instance" "n8n" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.n8n.id]
  iam_instance_profile        = aws_iam_instance_profile.n8n.name
  user_data_replace_on_change = true

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    region     = var.aws_region
    param_name = aws_ssm_parameter.n8n_env.name
    n8n_host   = local.n8n_host
    n8n_tag    = var.n8n_tag
    acme_email = var.acme_email
  })

  root_block_device {
    volume_type = "gp3"
    volume_size = var.root_volume_size
    encrypted   = true
  }

  metadata_options {
    http_tokens = "required" # IMDSv2 obligatorio
  }

  tags = { Name = "${var.project}-n8n" }

  depends_on = [
    aws_iam_role_policy.n8n,
    aws_ssm_parameter.n8n_env,
  ]
}

resource "aws_eip" "n8n" {
  domain = "vpc"

  tags = { Name = "${var.project}-n8n" }
}

resource "aws_eip_association" "n8n" {
  instance_id   = aws_instance.n8n.id
  allocation_id = aws_eip.n8n.id
}
