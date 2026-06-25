import os
from dotenv import load_dotenv
import functions_framework
import requests
from plaid.api import plaid_api
from plaid import ApiClient, Configuration
from google.cloud import bigquery
from google.cloud import secretmanager

load_dotenv()
project_id=os.getenv("PROJECT_ID")

client = secretmanager.SecretManagerServiceClient()

def secret_value_puller(secret_name: str):
# projects/YOUR_PROJECT_ID/secrets/SECRET_NAME/versions/latest
    name = "projects/" + f"{project_id}/" + "secrets/" + secret_name + "/versions/latest"
    response = client.access_secret_version(request={"name": name})
    payload = response.payload.data.decode("UTF-8")
    print(f"Payload: {payload}")

secret_value_puller(secret_name="plaid-client-id")