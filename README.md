# mern-recipe-platform-devops

Production-ready DevOps repository for a MERN-based AI Recipe platform with:
- Frontend and backend as independent repositories (tracked as submodules)
- Local development with Docker Compose
- Kubernetes manifests for deployment on GKE
- Secure GitHub Actions CI/CD using OIDC (no static cloud keys)

## Repository Structure

- .github/workflows: CI/CD workflow and setup documentation
- k8s: Kubernetes manifests (namespace, services, deployments, ingress, autoscaling, observability)
- docker-compose.yml: local container orchestration
- recipe-client-dev: frontend submodule repository
- recipe-server-dev: backend submodule repository

## Submodules

This root repository tracks app code as submodules.

Clone with submodules:

```bash
git clone --recurse-submodules https://github.com/kundan1729/mern-recipe-platform-devops.git
```

If already cloned:

```bash
git submodule update --init --recursive
```

## Local Development (Docker Compose)

Start services:

```bash
docker compose up --build
```

Default ports:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Kubernetes Deployment (GKE)

Apply manifests manually:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend/backend-service.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/autoscaling/hpa.yaml
kubectl apply -f k8s/ingress/ingress.yaml
```

Ingress routes:
- /api -> backend-service:5000
- / -> frontend-service:80

## CI/CD (GitHub Actions)

Workflow file:
- .github/workflows/deploy-gke.yml

Behavior:
- Push to main: validate, build, push images, deploy to GKE
- Pull request to main: validation only
- Manual run: supported

Security:
- Uses Workload Identity Federation (OIDC)
- No long-lived GCP JSON key required
- Runtime app secrets should be provided via Kubernetes Secret mern-app-secret

Detailed setup steps are in:
- .github/workflows/README.md

## Required GitHub Variables

Set in repository settings:
- GCP_PROJECT_ID
- GAR_LOCATION
- GAR_REPOSITORY
- GKE_CLUSTER
- GKE_LOCATION
- GCP_WORKLOAD_IDENTITY_PROVIDER
- GCP_SERVICE_ACCOUNT_EMAIL

## Security Checklist

- Never commit .env files, cloud keys, or kubeconfig files
- Keep secrets in GitHub Secrets and Kubernetes Secrets
- Rotate credentials and use least-privilege IAM roles

## Useful Commands

Check submodule state:

```bash
git submodule status
```

Update submodules to latest remote heads:

```bash
git submodule update --remote --merge
```

## License

This project is licensed under the MIT License. See LICENSE for details.
