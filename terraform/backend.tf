terraform {
  required_version = ">= 1.10.0"

  backend "s3" {
    region       = "us-east-2"
    bucket       = "wesleyk-prd-terraform-state"
    key          = "netlify-wesleykme.tfstate"
    encrypt      = "true"
    use_lockfile = true
  }
}
