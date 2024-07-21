variable "project_id" {
  type        = string
  description = "The GCP project ID"
}

variable "region" {
  type        = string
  default     = "us-east1"
  description = "The region you want your assets to be created and hosted from"
}

variable "deploy_bucket" {
  type        = string
  description = "The cloud storage bucket for your entire project"
}

variable "deploy_prefix" {
  type        = string
  description = "For local/dev deployments consider using your name or nickname"
}