locals {
  source_repo = lower(basename(path.cwd))

  contexts = ["dev", "branch-deploy", "deploy-preview", "production"]
  scopes   = ["builds", "functions", "runtime", ]
}
