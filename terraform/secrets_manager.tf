module "secrets_manager" {
  source  = "terraform-aws-modules/secrets-manager/aws"
  version = "~> 2.0"

  # Secret
  name                    = "website-wesleyk-me"
  description             = "Wesleyk.me Secrets in JSON"
  recovery_window_in_days = 7

  # Version - We will replace in the console
  create_random_password           = true
  random_password_length           = 64
  random_password_override_special = "!@#$%^&*()_+"

  tags = local.tags
}

# Get our secrets from AWS to inject into our build
data "aws_secretsmanager_secret_version" "latest" {
  secret_id = module.secrets_manager.secret_id
}
