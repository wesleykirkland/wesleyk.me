resource "netlify_site_domain_settings" "blog" {
  site_id                      = data.netlify_site.blog.id
  custom_domain                = "blog.wesleyk.me"
  domain_aliases               = ["blog-alias.wesleyk.me"]
  branch_deploy_custom_domain  = "blog-branch.wesleyk.me"
  deploy_preview_custom_domain = "blog-dp.wesleyk.me"
}
