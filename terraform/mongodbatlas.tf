resource "mongodbatlas_project" "atlas-project" {
  org_id    = var.atlas_org_id
  name      = var.atlas_project_name
}

# resource "random_password" "db-user-password" {
#   length            = 16
#   special           = true
#   override_special  = "_%@"
# }

resource "mongodbatlas_database_user" "db-user" {
    username            = var.db_user
    password            = var.db_password
    project_id          = mongodbatlas_project.atlas-project.id
    auth_database_name  = "admin"

    roles {
        role_name       = "readWriteAnyDatabase"
        database_name   = "admin"
    }
}

resource "mongodbatlas_serverless_instance" "db-instance" {
    project_id   = mongodbatlas_project.atlas-project.id
    name         = "gcp-ms-soffredi"

    provider_settings_backing_provider_name = "GCP"
    provider_settings_provider_name = "SERVERLESS"
    provider_settings_region_name = var.atlas_region
}

resource "mongodbatlas_project_ip_access_list" "ip" {
  project_id = mongodbatlas_project.atlas-project.id
  cidr_block = "0.0.0.0/0"
  comment    = "Public access"
}

output "connection_string_pub" {
    description = "Public connection string that you can use to connect to this serverless instance"
    value = mongodbatlas_serverless_instance.db-instance.connection_strings_standard_srv
}
