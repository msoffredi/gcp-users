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
    google_storage_bucket.deploy_bucket,
    data.archive_file.source
  ]
}

resource "google_cloudfunctions2_function" "users_api_fn" {
  provider    = google
  name        = "users-api-${var.deploy_prefix}"
  description = "Users serverless microservice API"
  # project     = var.project_id
  location    = var.region 

  depends_on  = [
    google_storage_bucket.deploy_bucket,
    google_storage_bucket_object.zip,
  ]

  build_config {
    runtime     = "nodejs18"
    entry_point = "handler" # Set the entry point

    source {
      storage_source {
        bucket = google_storage_bucket.deploy_bucket.name
        object = google_storage_bucket_object.zip.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "128Mi"
    timeout_seconds    = 100
  }
}

# resource "google_cloud_run_service_iam_member" "member" {
#   location = google_cloudfunctions2_function.users_api.location
#   service  = google_cloudfunctions2_function.users_api.name
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }

output "function_uri" {
    description = "Users microservice API function URI"
    value       = google_cloudfunctions2_function.users_api_fn.service_config[0].uri
}
