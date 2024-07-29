terraform {
    required_version = ">= 1.9"
}

data "google_project" "project" {
    project_id = var.project_id
}

