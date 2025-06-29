# Terraform and Provider versions
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    netlify = {
      source  = "registry.terraform.io/netlify/netlify"
      version = "~> 0.2"
    }
  }
}
