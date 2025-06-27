variable "env" {
  description = "Environment"
  type        = string
  default     = "prd"
}

variable "region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-2"
}

# Netlify Configuration
variable "site_name" {
  description = "Name of the Netlify site"
  type        = string
  default     = "wesleyk-me"
}

variable "custom_domain" {
  description = "Custom domain for the site (e.g., wesleyk.me)"
  type        = string
  default     = "wesleyk.me"
}

# Repository Configuration
variable "github_repo" {
  description = "GitHub repository path (owner/repo)"
  type        = string
  default     = "wesleykirkland/wesleyk.me"
}

variable "production_branch" {
  description = "Git branch to deploy from"
  type        = string
  default     = "main"
}

variable "publish_directory" {
  description = "Directory to publish (Next.js output)"
  type        = string
  default     = "out"
}

# Build Configuration
variable "node_version" {
  description = "Node.js version for builds"
  type        = string
  default     = "22"
}

variable "npm_version" {
  description = "NPM version for builds"
  type        = string
  default     = "latest"
}

# Site Configuration
variable "next_public_name" {
  description = "Public name for the site"
  type        = string
  default     = "Wesley Kirkland"
}

variable "next_public_tagline" {
  description = "Public tagline for the site"
  type        = string
  default     = "DevOps Engineer & Security Researcher"
}

variable "next_public_professional_titlenext_public_professional_title" {
  description = "Public Title"
  type        = string
  default     = "Sr. Systems Engineer"
}

variable "next_public_professional_title" {
  description = "Full Professional Title"
  type        = string
  default     = "Sr. Cloud Development & DevOps Engineer ➡️ Designing and Deploying Cloud-Based Security Controls, Infrastructure, and Frameworks | Helping Organizations Safeguard Critical Assets against Cyber Threats ➡️ AWS/Azure/CI/CD"
}

variable "next_public_site_description" {
  description = "Site description"
  type        = string
  default     = "Personal website and blog of Wesley Kirkland - Sr. Systems Engineer specializing in PowerShell, O365, Azure, and Security Research"
}

variable "next_public_github_url" {
  description = "GitHub URL"
  type        = string
  default     = "https://github.com/wesleykirkland"
}

variable "next_public_linkedin_url" {
  description = "LinkedIn URL"
  type        = string
  default     = "https://www.linkedin.com/in/wesleykirkland/"
}

variable "next_public_youtube_playlist_url" {
  description = "Youtube Playlist URL"
  type        = string
  default     = "https://www.youtube.com/playlist?list=PL6e0QoXQoTzW_YGyfOmcqGP_wHbiAFmhW"
}

variable "next_public_site_url" {
  description = "Public site URL"
  type        = string
  default     = "https://wesleyk.me"
}

# Analytics Configuration

# Email Configuration
variable "email_host" {
  description = "SMTP host for email"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_port" {
  description = "SMTP port for email"
  type        = string
  default     = "587"
}

variable "email_user" {
  description = "SMTP username for email"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_pass" {
  description = "SMTP password for email"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_from" {
  description = "From email address"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_to" {
  description = "To email address for contact form"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_tls" {
  description = "Use TLS for email"
  type        = string
  default     = "true"
}

# Captcha Configuration
variable "hcaptcha_site_key" {
  description = "hCaptcha site key"
  type        = string
  default     = ""
  sensitive   = true
}

variable "hcaptcha_secret" {
  description = "hCaptcha secret key"
  type        = string
  default     = ""
  sensitive   = true
}

# Security Configuration
variable "content_security_policy" {
  description = "Content Security Policy header"
  type        = string
  default     = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hcaptcha.com https://js.hcaptcha.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://hcaptcha.com https://js.hcaptcha.com; frame-src https://hcaptcha.com https://js.hcaptcha.com; object-src 'none'; base-uri 'self';"
}

# Notification Configuration
variable "slack_webhook_url" {
  description = "Slack webhook URL for deployment notifications"
  type        = string
  default     = ""
  sensitive   = true
}

# Feature Flags
variable "enable_forms" {
  description = "Enable Netlify Forms"
  type        = bool
  default     = false
}

variable "enable_identity" {
  description = "Enable Netlify Identity"
  type        = bool
  default     = false
}

variable "enable_large_media" {
  description = "Enable Netlify Large Media"
  type        = bool
  default     = false
}

variable "enable_split_testing" {
  description = "Enable split testing"
  type        = bool
  default     = false
}

# Performance Configuration
variable "enable_asset_optimization" {
  description = "Enable asset optimization (CSS/JS minification)"
  type        = bool
  default     = true
}

variable "enable_image_optimization" {
  description = "Enable image optimization"
  type        = bool
  default     = true
}

variable "enable_pretty_urls" {
  description = "Enable pretty URLs (remove .html extension)"
  type        = bool
  default     = false
}
