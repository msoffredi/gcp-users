resource "google_api_gateway_api" "users_api_gw" {
    provider     = google-beta
    api_id       = "users-api-${var.deploy_prefix}"
    # project      = var.project_id
    display_name = "Users API ${var.deploy_prefix}"
}

resource "google_api_gateway_api_config" "users_api_cfg" {
    provider        = google-beta
    api             = google_api_gateway_api.users_api_gw.api_id
    # api_config_id_prefix = "api"
    # project         = var.project_id
    display_name    = "Users API config ${var.deploy_prefix}"
    depends_on      = [ 
        google_api_gateway_api.users_api_gw
    ]

    openapi_documents {
        document {
            path     = "${path.module}/../openapi2.yaml"
            contents = filebase64("${path.module}/../openapi2.yaml")
        }
    }

    lifecycle {
        create_before_destroy = true
    }   
}

resource "google_api_gateway_gateway" "users_api_gw_gw" {
    provider        = google-beta
    # region          = var.region
    # project         = var.project_id
    api_config      = google_api_gateway_api_config.users_api_cfg.id

    gateway_id      = "users-api-gw-${var.deploy_prefix}"
    display_name    = "Users API gateway ${var.deploy_prefix}"

    depends_on      = [
        google_api_gateway_api_config.users_api_cfg
    ]
}
