# RDS configuration for Free Tier PostgreSQL

resource "aws_db_instance" "harvelogix_db" {
  identifier           = "${var.app_name}-db-${var.environment}"
  # Free tier eligible engine version
  engine               = "postgres"
  engine_version       = "15.4"
  # Free tier eligible instance classes: db.t3.micro or db.t4g.micro
  instance_class       = "db.t4g.micro"
  
  # Up to 20 GB of DB storage is free tier eligible
  allocated_storage    = 20
  
  db_name              = "harvelogix"
  username             = "harve_admin"
  password             = var.db_password
  
  # For Free Tier, we should disable Multi-AZ
  multi_az             = false
  
  # We disable automated backups to save storage if strict 0 cost is needed, 
  # or keep a minor retention period. Free tier includes 20GB of backup storage.
  backup_retention_period = 1
  
  publicly_accessible  = true # Set true ONLY if pushing data exclusively from a local machine! Protect with SG in prod.
  skip_final_snapshot  = true # Prevent snapshot cost on teardown
  
  tags = {
    Name        = "${var.app_name}-db-${var.environment}"
    Environment = var.environment
    FreeTier    = "true"
  }
}

variable "db_password" {
  description = "Password for the master DB user"
  type        = string
  sensitive   = true
}

output "db_endpoint" {
  value = aws_db_instance.harvelogix_db.endpoint
}
