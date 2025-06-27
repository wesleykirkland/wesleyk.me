# Environment variables for Netlify site
# This file manages environment variables for the Netlify deployment

# Build environment variables
resource "netlify_environment_variable" "node_version" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NODE_VERSION"
  values = [
    {
      value   = var.node_version
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "npm_version" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NPM_VERSION"
  values = [
    {
      value   = var.npm_version
      context = "all"
    }
  ]
}

# Public environment variables
resource "netlify_environment_variable" "next_public_professional_title" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_PROFESSIONAL_TITLE"
  values = [
    {
      value   = var.next_public_professional_title
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_full_title" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_FULL_TITLE"
  values = [
    {
      value   = var.next_public_professional_title
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_name" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_NAME"
  values = [
    {
      value   = var.next_public_name
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_tagline" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_TAGLINE"
  values = [
    {
      value   = var.next_public_tagline
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_site_description" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_SITE_DESCRIPTION"
  values = [
    {
      value   = var.next_public_site_description
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_github_url" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_GITHUB_URL"
  values = [
    {
      value   = var.next_public_github_url
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_linkedin_url" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_LINKEDIN_URL"
  values = [
    {
      value   = var.next_public_linkedin_url
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_youtube_playlist" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_YOUTUBE_PLAYLIST"
  values = [
    {
      value   = var.next_public_youtube_playlist_url
      context = "all"
    }
  ]
}

# Secret-based environment variables
resource "netlify_environment_variable" "smtp_host" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_HOST"
  secret_values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_HOST"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "smtp_port" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_PORT"
  secret_values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_PORT"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "smtp_username" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_USERNAME"
  secret_values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_USERNAME"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "smtp_password" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_PASSWORD"
  values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_PASSWORD"]
      context = "all"
    }
  ]
  scopes = [
    "builds",
    "functions",
    "runtime",
    "post-processing"
  ]
}

resource "netlify_environment_variable" "smtp_from" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_FROM"
  secret_values = [
    {
      # Potentially change to env specific from address for more dev slots long term
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_FROM"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "smtp_to" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_TO"
  secret_values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_TO"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "smtp_tls" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "SMTP_TLS"
  secret_values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["SMTP_TLS"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_hcaptcha_site_key" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_HCAPTCHA_SITE_KEY"
  values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["NEXT_PUBLIC_HCAPTCHA_SITE_KEY"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "hcaptcha_secret_key" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "HCAPTCHA_SECRET_KEY"
  secret_values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["HCAPTCHA_SECRET_KEY"]
      context = "all"
    }
  ]
}

resource "netlify_environment_variable" "next_public_overtracking_site_id" {
  site_id = data.netlify_site.wesleyk_me.id
  team_id = data.netlify_team.team.id

  key = "NEXT_PUBLIC_OVERTRACKING_SITE_ID"
  values = [
    {
      value   = jsondecode(data.aws_secretsmanager_secret_version.latest.secret_string)["NEXT_PUBLIC_OVERTRACKING_SITE_ID"]
      context = "all"
    }
  ]
}
