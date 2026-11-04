output "url" {
  description = "URL pública (HTTPS) de la demo de n8n."
  value       = "https://${local.n8n_host}/"
}

output "public_ip" {
  description = "IP elástica asociada a la instancia."
  value       = aws_eip.n8n.public_ip
}

output "instance_id" {
  value = aws_instance.n8n.id
}

output "ssm_parameter_name" {
  description = "Parámetro (SecureString) que contiene las variables de entorno."
  value       = aws_ssm_parameter.n8n_env.name
}

output "connect_command" {
  description = "Abre una shell en la instancia vía SSM Session Manager (sin SSH)."
  value       = "aws ssm start-session --target ${aws_instance.n8n.id} --region ${var.aws_region}"
}

output "logs_command" {
  description = "Comando para ver los logs del contenedor de n8n."
  value       = "aws ssm start-session --target ${aws_instance.n8n.id} --region ${var.aws_region} --document-name AWS-StartNonInteractiveCommand --parameters command=\"docker logs --tail 100 -f yawi_n8n\""
}
