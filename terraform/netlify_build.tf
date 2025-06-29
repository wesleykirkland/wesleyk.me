resource "netlify_site_build_settings" "blog_prd" {
  site_id = data.netlify_site.wesleyk_me.id

  build_command          = "npm run build"
  publish_directory      = ".next"
  production_branch      = "main"
  branch_deploy_branches = ["main"]
}
