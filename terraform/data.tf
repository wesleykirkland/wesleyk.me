# https://answers.netlify.com/t/is-a-netlify-site-id-private/15238/7
data "netlify_site" "wesleyk_me" {
  id = "43fce32b-eca4-44e6-9af7-97d19a143a5d"
}

data "netlify_team" "team" {
  slug = "wesley-q8pstfm"
}

data "aws_region" "this" {}

output "region" {
  description = "test"
  value       = data.aws_region.this.region
}
