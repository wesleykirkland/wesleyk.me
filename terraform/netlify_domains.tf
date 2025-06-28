resource "netlify_site_domain_settings" "blog" {
  site_id = data.netlify_site.wesleyk_me.id

  custom_domain                = "wesleyk.me"
  deploy_preview_custom_domain = "preview.wesleyk.me"
}
