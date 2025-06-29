locals {
  tags = {
    Environment = var.env
    SourceRepo  = local.source_repo
    Provisioner = "Terraform"
    Terraform   = "true"
  }
}
