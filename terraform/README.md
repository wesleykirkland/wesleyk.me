# Terraform Infrastructure

This directory contains Terraform configuration for deploying the website infrastructure to Netlify.

## Workflow Overview

The Terraform workflow uses the [TF-via-PR](https://github.com/OP5dev/TF-via-PR) GitHub Action for secure plan and apply automation:

- **Pull Requests**: Generates encrypted Terraform plans with security scanning
- **Push to main**: Applies the changes automatically after successful plan
- **PR Comments**: Trigger plans/applies manually via comments

### Comment Commands

You can trigger Terraform operations by commenting on pull requests:

- `/terraform plan` - Generate a new Terraform plan
- `/terraform apply` - Apply Terraform changes (use with caution!)

The workflow will:
1. Check out the correct PR branch
2. Run the requested Terraform command
3. Update the commit status on the PR
4. Add a comment with the result

## Plan Encryption

Plan files are encrypted using AES-256-CTR encryption with the `TF_PLAN_PASSPHRASE` secret to protect sensitive data in GitHub artifacts.

### Required Secrets

You need to configure the following GitHub repository secret:

- `TF_PLAN_PASSPHRASE`: A secure passphrase for encrypting/decrypting Terraform plan files

### Decrypting Plan Files Locally

If you need to decrypt a plan file locally for debugging:

1. Download the plan artifact from the GitHub Actions workflow
2. Extract the zip file
3. Decrypt using OpenSSL:

```bash
unzip tfplan-*.zip
openssl enc -d -aes-256-ctr -pbkdf2 -salt \
  -in   tfplan.encrypted \
  -out  tfplan.decrypted \
  -pass pass:"<your-passphrase>"
terraform show tfplan.decrypted
```

## Security Features

- **Checkov**: Infrastructure security scanning
- **tfsec**: Terraform security analysis
- **Encrypted plan files**: Sensitive data protection
- **OIDC authentication**: Secure AWS access without long-lived credentials

## Environment Variables

The workflow requires these environment variables:

- `NETLIFY_API_TOKEN`: Netlify API token for resource management
- `TF_LOG`: Set to `ERROR` for minimal logging
- `TF_IN_AUTOMATION`: Set to `true` for automation-friendly output

## Outputs

The Terraform configuration outputs:

- `site_url`: The deployed website URL
- `admin_url`: Netlify admin panel URL  
- `site_id`: Netlify site identifier

## Manual Operations

For manual Terraform operations:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Note: Ensure you have the required environment variables set and AWS credentials configured.
