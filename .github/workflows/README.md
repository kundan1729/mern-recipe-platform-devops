# GKE CI/CD Setup

This repository uses `.github/workflows/deploy-gke.yml` to validate, build, and deploy to GKE.

## One-time GCP Setup

Use **Workload Identity Federation (OIDC)** so GitHub Actions authenticates to GCP **without static key files**.

Create a deploy service account and grant minimum required roles:

```bash
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions GKE Deployer"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:github-actions-deployer@<GCP_PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:github-actions-deployer@<GCP_PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding <GCP_PROJECT_ID> \
  --member="serviceAccount:github-actions-deployer@<GCP_PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/container.clusterViewer"
```

Create a Workload Identity Pool and Provider, then allow your GitHub repo to impersonate the service account:

```bash
gcloud iam workload-identity-pools create github-pool \
  --location="global" \
  --display-name="GitHub Pool"

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"

gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@<GCP_PROJECT_ID>.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/attribute.repository/<GITHUB_OWNER>/<GITHUB_REPO>"
```

## Required GitHub Repository Variables

Set these in **Settings -> Secrets and variables -> Actions -> Variables**:

- `GCP_PROJECT_ID`: GCP project ID
- `GAR_LOCATION`: Artifact Registry region (example: `asia-south1`)
- `GAR_REPOSITORY`: Artifact Registry repo name (example: `my-repo`)
- `GKE_CLUSTER`: GKE cluster name
- `GKE_LOCATION`: GKE zone or region
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: full provider resource name, for example:
  - `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
- `GCP_SERVICE_ACCOUNT_EMAIL`: service account email, for example:
  - `github-actions-deployer@<GCP_PROJECT_ID>.iam.gserviceaccount.com`

## Required GitHub Repository Secrets

No GCP credential secret is required with OIDC setup.

## GitHub CLI Setup (optional, fastest)

If you use `gh` CLI, run these commands from your repository root:

```bash
gh variable set GCP_PROJECT_ID --body "<GCP_PROJECT_ID>"
gh variable set GAR_LOCATION --body "asia-south1"
gh variable set GAR_REPOSITORY --body "my-repo"
gh variable set GKE_CLUSTER --body "<GKE_CLUSTER_NAME>"
gh variable set GKE_LOCATION --body "<GKE_ZONE_OR_REGION>"
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --body "projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
gh variable set GCP_SERVICE_ACCOUNT_EMAIL --body "github-actions-deployer@<GCP_PROJECT_ID>.iam.gserviceaccount.com"
```

Also ensure your cluster has namespace and app secret:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic mern-app-secret \
  --namespace mern-app \
  --from-literal=MONGO_URI="<mongo-uri>" \
  --from-literal=JWT_SECRET="<jwt-secret>" \
  --from-literal=GROQ_API_KEY="<groq-key>" \
  --from-literal=YOUTUBE_API_KEY="<youtube-key>" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Trigger behavior

- Push to `main`: runs validation and deployment
- Pull request to `main`: runs validation only
- Manual run: supported via `workflow_dispatch`

## Security notes

- Do not commit `.env*`, service account keys, kubeconfigs, or any plaintext credentials.
- Keep runtime secrets in Kubernetes secret `mern-app-secret` and GitHub Secrets/Variables.
- Prefer rotating app secrets periodically and using least-privilege IAM roles.
