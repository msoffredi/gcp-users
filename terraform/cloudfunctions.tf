data "archive_file" "source" {
  type        = "zip"
  source_dir  = "${path.module}/../dist"
  output_path = "${path.module}/tmp/function.zip"
}

resource "google_storage_bucket_object" "zip" {
  source       = data.archive_file.source.output_path
  content_type = "application/zip"
  name         = "src-${data.archive_file.source.output_md5}.zip"
  bucket       = var.deploy_bucket

  depends_on = [
    data.archive_file.source
  ]
}

resource "google_cloudfunctions2_function" "users_api_fn" {
    provider    = google
    name        = "users-api-${var.deploy_prefix}"
    description = "Users serverless microservice API"
    location    = var.region 

    depends_on  = [
      google_storage_bucket_object.zip,
    ]

    build_config {
      runtime           = "nodejs18"
      entry_point       = "apiHandler"
      docker_repository = "projects/sample-ms-soffredi/locations/us-east1/repositories/gcf-artifacts"

      source {
        storage_source {
          bucket = var.deploy_bucket
          object = google_storage_bucket_object.zip.name
        }
      }
    }

    service_config {
        max_instance_count = 1
        available_memory   = "128Mi"
        timeout_seconds    = 100

        environment_variables = {
            DB_USER     = var.db_user
            DB_PASSWORD = var.db_password
            DB_HOST     = var.db_host
            DB_NAME     = "gcp-ms-soffredi-db-${var.deploy_prefix}"
        }
    }
}

resource "google_cloud_run_service_iam_member" "member" {
  location = google_cloudfunctions2_function.users_api_fn.location
  service  = google_cloudfunctions2_function.users_api_fn.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloudfunctions2_function" "users_events_fn" {
    provider    = google
    name        = "users-events-${var.deploy_prefix}"
    description = "Users serverless events function"
    location    = var.region 

    depends_on  = [
      google_storage_bucket_object.zip,
    ]

    build_config {
      runtime           = "nodejs18"
      entry_point       = "eventsHandler"
      docker_repository = "projects/sample-ms-soffredi/locations/us-east1/repositories/gcf-artifacts"

      source {
        storage_source {
          bucket = var.deploy_bucket
          object = google_storage_bucket_object.zip.name
        }
      }
    }

    service_config {
        max_instance_count = 1
        available_memory   = "128Mi"
        timeout_seconds    = 100

        environment_variables = {
            DB_USER     = var.db_user
            DB_PASSWORD = var.db_password
            DB_HOST     = var.db_host
            DB_NAME     = "gcp-ms-soffredi-db-${var.deploy_prefix}"
        }

        ingress_settings                = "ALLOW_INTERNAL_ONLY"
        all_traffic_on_latest_revision  = true
    }

    event_trigger {
        trigger_region = var.region
        event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
        pubsub_topic   = data.google_pubsub_topic.client-events-topic.id
        retry_policy   = "RETRY_POLICY_RETRY"
    }
}

resource "google_cloud_run_service_iam_member" "member2" {
  location = google_cloudfunctions2_function.users_events_fn.location
  service  = google_cloudfunctions2_function.users_events_fn.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}
