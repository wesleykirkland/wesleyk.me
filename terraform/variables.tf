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
  default     = "Solutions Architect & Security Researcher"
}

variable "next_public_professional_title" {
  description = "Full Professional Title"
  type        = string
  default     = "Solutions Architect"
}

variable "next_public_site_description" {
  description = "Site description"
  type        = string
  default     = "Personal website and blog of Wesley - Solutions Architect specializing in AWS, O365, Web Presence, and Security Research"
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

# Security Configuration
# variable "content_security_policy" {
#   description = "Content Security Policy header"
#   type        = string
#   default     = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hcaptcha.com https://js.hcaptcha.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://hcaptcha.com https://js.hcaptcha.com; frame-src https://hcaptcha.com https://js.hcaptcha.com; object-src 'none'; base-uri 'self';"
# }
