resource "mongodbatlas_project" "atlas-project" {
  org_id    = var.atlas_org_id
  name      = var.atlas_project_name
}

resource "random_password" "db-user-password" {
  length            = 16
  special           = true
  override_special  = "_%@"
}

resource "mongodbatlas_database_user" "db-user" {
    username            = "gcp-ms-soffredi-user"
    password            = random_password.db-user-password.result
    project_id          = mongodbatlas_project.atlas-project.id
    auth_database_name  = "admin"

    roles {
        role_name       = "readWrite"
        database_name   = "users-${var.deploy_prefix}"
    }
}

# resource "mongodbatlas_advanced_cluster" "atlas-cluster" {
#     project_id    = mongodbatlas_project.atlas-project.id
#     name          = "${var.atlas_project_name}-cluster-${var.deploy_prefix}"
#     cluster_type  = "REPLICASET"

#     replication_specs {
#         region_configs {
#             electable_specs {
#                 instance_size = "M0"
#             }

#             provider_name = "GCP"
#             priority      = 7
#             region_name   = var.atlas_region
#         }
#     }
# }

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


# output "connection_string_prv" {
#     description = "List of Serverless Private Endpoint Connections"
#     value = mongodbatlas_serverless_instance.db-instance.connection_strings_private_endpoint_srv
# }

output "connection_string_pub" {
    description = "Public connection string that you can use to connect to this serverless instance"
    value = mongodbatlas_serverless_instance.db-instance.connection_strings_standard_srv
}
