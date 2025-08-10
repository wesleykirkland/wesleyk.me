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

<!-- BEGIN_TF_DOCS -->
# Wesleyk.me

GitHub: [wesleykirkland/wesleyk.me](https://github.com/wesleykirkland/wesleyk.me)

A modern, responsive personal website and blog built with Next.js, featuring security research, PowerShell automation content, technical and personal articles.

[![Netlify Status](https://api.netlify.com/api/v1/badges/43fce32b-eca4-44e6-9af7-97d19a143a5d/deploy-status)](https://app.netlify.com/projects/wesleykme/deploys)

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 15+, TypeScript, React, and Tailwind CSS
- **Blog System**: Markdown-based blog with frontmatter support
- **Responsive Design**: Mobile-first design that works on all devices
- **SEO Optimized**: Meta tags, structured data, and performance optimized
- **Static Export**: Optimized for Netlify deployment
- **Dark Mode Support**: Automatic system preference detection with manual toggle
- **Security Research**: Dedicated section for vulnerability research and case studies
- **Environment Variables**: Easy configuration for personal information

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: Markdown with gray-matter for frontmatter
- **Deployment**: Netlify (with Next.js runtime for API routes)
- **Icons**: Custom SVG icons

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server (Netlify):

```bash
brew install netlify-cli
netlify login
netlify dev
```

Open [http://localhost:8888](http://localhost:8888) in your browser. This injects the ENV vars from Netlify into .env.local and runs it on port 3000 and proxies your 8888 traffic.

3. Run the development server (local):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## 🐳 Container Deployment

### Using Docker

1. Build and run with the provided script:

```bash
./docker-run.sh
```

2. Or manually:

```bash
# Build the image
docker build -f Containerfile -t wesleyk-website .

# Run the container
docker run -d --name wesleyk-website-container -p 3000:3000 wesleyk-website
```

### Using Podman

1. Build and run with the provided script:

```bash
./podman-run.sh
```

2. Or manually:

```bash
# Build the image
podman build -f Containerfile -t wesleyk-website .

# Run the container
podman run -d --name wesleyk-website-container -p 3000:3000 wesleyk-website
```

The containerized website will be available at [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

Your professional title and personal information are configured using environment variables. This makes it easy to update your title without touching the code!

**Environment Variables:**
See `.env.example``

**Required Setup:**
1. **HCaptcha Configuration:**

  - Sign up at [hCaptcha](https://www.hcaptcha.com/)
  - Get your site key and secret key
  - The form will display an error message if the captcha site key is not configured.

2. **SMTP Configuration:**
  - Configure your email provider's SMTP settings

**Important:** The contact form requires server-side functionality (API routes). This means:

- The site is no longer a static export
- Deployment requires a platform that supports Next.js API routes (like Netlify with Next.js runtime, Vercel, etc.)
- For static hosting, you would need to implement the contact form using a third-party service

### Dark Mode

The website includes a built-in dark mode toggle that:

- **Automatically detects** your system's color scheme preference on first visit
- **Remembers your choice** using localStorage across sessions
- **Provides a toggle button** in the header for manual switching
- **Works reliably** regardless of your system's current preference
- **Supports all pages** with consistent dark/light themes
- **Prevents flash** of unstyled content with inline script

The dark mode toggle appears as a sun/moon icon in the header next to the social media links. Click it to instantly switch between light and dark modes.

## 📝 Adding Blog Posts

Create a new markdown file in the `posts/` directory with frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief description of your post"
tags: ["tag1", "tag2", "tag3"]
author: "Wesley Kirkland"
---

Your post content here...
```

Built with ❤️ by Wesley Kirkland in Knoxville, TN - Meme Master of Disaster and with the help of Agentic AI as I'm not a Software Engineer by Trade

---

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.10.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 6.0 |
| <a name="requirement_netlify"></a> [netlify](#requirement\_netlify) | ~> 0.2 |

## Resources

| Name | Type |
|------|------|
| netlify_environment_variable.hcaptcha_secret_key | resource |
| netlify_environment_variable.next_public_full_title | resource |
| netlify_environment_variable.next_public_github_url | resource |
| netlify_environment_variable.next_public_hcaptcha_site_key | resource |
| netlify_environment_variable.next_public_linkedin_url | resource |
| netlify_environment_variable.next_public_name | resource |
| netlify_environment_variable.next_public_overtracking_site_id | resource |
| netlify_environment_variable.next_public_professional_title | resource |
| netlify_environment_variable.next_public_site_description | resource |
| netlify_environment_variable.next_public_tagline | resource |
| netlify_environment_variable.next_public_youtube_playlist | resource |
| netlify_environment_variable.node_version | resource |
| netlify_environment_variable.npm_version | resource |
| netlify_environment_variable.secrets_scan_omit_keys | resource |
| netlify_environment_variable.smtp_from | resource |
| netlify_environment_variable.smtp_host | resource |
| netlify_environment_variable.smtp_password | resource |
| netlify_environment_variable.smtp_port | resource |
| netlify_environment_variable.smtp_tls | resource |
| netlify_environment_variable.smtp_to | resource |
| netlify_environment_variable.smtp_username | resource |
| netlify_site_build_settings.blog_prd | resource |
| netlify_site_domain_settings.blog | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_env"></a> [env](#input\_env) | Environment | `string` | `"prd"` | no |
| <a name="input_next_public_github_url"></a> [next\_public\_github\_url](#input\_next\_public\_github\_url) | GitHub URL | `string` | `"https://github.com/wesleykirkland"` | no |
| <a name="input_next_public_linkedin_url"></a> [next\_public\_linkedin\_url](#input\_next\_public\_linkedin\_url) | LinkedIn URL | `string` | `"https://www.linkedin.com/in/wesleykirkland/"` | no |
| <a name="input_next_public_name"></a> [next\_public\_name](#input\_next\_public\_name) | Public name for the site | `string` | `"Wesley Kirkland"` | no |
| <a name="input_next_public_professional_title"></a> [next\_public\_professional\_title](#input\_next\_public\_professional\_title) | Full Professional Title | `string` | `"Sr. Cloud Development & DevOps Engineer ➡️ Designing and Deploying Cloud-Based Security Controls, Infrastructure, and Frameworks | Helping Organizations Safeguard Critical Assets against Cyber Threats ➡️ AWS/Azure/CI/CD"` | no |
| <a name="input_next_public_site_description"></a> [next\_public\_site\_description](#input\_next\_public\_site\_description) | Site description | `string` | `"Personal website and blog of Wesley Kirkland - Sr. Systems Engineer specializing in PowerShell, O365, Azure, and Security Research"` | no |
| <a name="input_next_public_tagline"></a> [next\_public\_tagline](#input\_next\_public\_tagline) | Public tagline for the site | `string` | `"DevOps Engineer & Security Researcher"` | no |
| <a name="input_next_public_youtube_playlist_url"></a> [next\_public\_youtube\_playlist\_url](#input\_next\_public\_youtube\_playlist\_url) | Youtube Playlist URL | `string` | `"https://www.youtube.com/playlist?list=PL6e0QoXQoTzW_YGyfOmcqGP_wHbiAFmhW"` | no |
| <a name="input_node_version"></a> [node\_version](#input\_node\_version) | Node.js version for builds | `string` | `"22"` | no |
| <a name="input_npm_version"></a> [npm\_version](#input\_npm\_version) | NPM version for builds | `string` | `"latest"` | no |
| <a name="input_region"></a> [region](#input\_region) | AWS Region | `string` | `"us-east-2"` | no |

## Outputs

No outputs.

---

### Before this is applied, you need to configure the git hook on your local machine
```bash
# Test your pre-commit hooks - This will force them to run on all files
pre-commit run --all-files

# Add your pre-commit hooks forever
pre-commit install
```

Note, manual changes to the README will be overwritten when the documentation is updated. To update the documentation, run `terraform-docs -c .config/.terraform-docs.yml .`
<!-- END_TF_DOCS -->