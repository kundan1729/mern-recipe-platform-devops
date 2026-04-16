# Project Running Guide

This guide shows how to run the recipe platform locally, on Kubernetes, and how to open the common GUI/monitoring tools such as Kubernetes Dashboard, Grafana, Prometheus, and Alertmanager.

## 1. Prerequisites

Install these tools first:

- Docker Desktop
- Node.js 18 or later
- `kubectl`
- A Kubernetes cluster if you want to use the manifests

## 2. Local Run With Docker Compose

From the repository root, start both services:

```bash
docker compose up --build
```

Default local ports:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

If you want logs:

```bash
docker compose logs -f frontend
docker compose logs -f backend
```

## 3. Run Frontend And Backend Separately

### Backend

Go to the backend folder and start the server:

```bash
cd recipe-server-dev
npm install
npm run dev
```

Backend default port:

- `5000`

Backend environment variables used by the app:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`

### Frontend

Go to the frontend folder and start the Vite app:

```bash
cd recipe-client-dev
npm install
npm run dev
```

Frontend default dev port:

- `5173`

If you want the frontend to talk to the backend locally, make sure the API base URL points to the backend port you are using, usually `http://localhost:5000`.

Frontend environment variables used by the app:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 4. Kubernetes Deployment

Apply the manifests in this order from the repository root:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend/backend-service.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/autoscaling/hpa.yaml
kubectl apply -f k8s/ingress/managed-certificate.yaml
kubectl apply -f k8s/ingress/ingress.yaml
```

Check the namespace and workloads:

```bash
kubectl get ns
kubectl get pods -n mern-app
kubectl get svc -n mern-app
kubectl get ingress -n mern-app
```

Ingress routes in this repo:

- `https://itskundan.live/` -> frontend-service on port `80`
- `https://itskundan.live/api` -> backend-service on port `5000`
- `https://www.itskundan.live/` -> frontend-service on port `80`
- `https://www.itskundan.live/api` -> backend-service on port `5000`

## 5. Open The App Locally With Port Forwarding

If you do not want to use the ingress, you can forward the services to your machine.

### Frontend

```bash
kubectl port-forward -n mern-app svc/frontend-service 3000:80
```

Open:

- http://localhost:3000

### Backend

```bash
kubectl port-forward -n mern-app svc/backend-service 5000:5000
```

Open:

- http://localhost:5000
- http://localhost:5000/health
- http://localhost:5000/metrics

## 6. Kubernetes Dashboard

If Kubernetes Dashboard is installed in your cluster, use one of these methods.

### Option A: Port-forward the Dashboard service

Find the service first:

```bash
kubectl get svc -A | findstr dashboard
```

Then forward it, replacing the service name if needed:

```bash
kubectl port-forward -n kubernetes-dashboard svc/kubernetes-dashboard 8443:443
```

Open:

- https://localhost:8443

### Option B: Use kubectl proxy

```bash
kubectl proxy
```

Then open the Dashboard proxy URL in your browser:

- http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

## 7. Grafana, Prometheus, And Alertmanager

This repository includes alert rules and Alertmanager configuration under `k8s/observability/`, but the actual monitoring stack must already be installed in your cluster.

First, find the monitoring services:

```bash
kubectl get svc -A | findstr grafana
kubectl get svc -A | findstr prometheus
kubectl get svc -A | findstr alertmanager
```

If you installed `kube-prometheus-stack`, these are common service names.

### Grafana

```bash
kubectl port-forward -n observability svc/prometheus-grafana 3001:80
```

Open:

- http://localhost:3001

Common Grafana login:

- Username: `admin`
- Password: the admin password from your Helm release or Kubernetes secret

### Prometheus

```bash
kubectl port-forward -n observability svc/prometheus-kube-prometheus-prometheus 9090:9090
```

Open:

- http://localhost:9090

Useful Prometheus pages:

- Targets: http://localhost:9090/targets
- Alerts: http://localhost:9090/alerts

### Alertmanager

```bash
kubectl port-forward -n observability svc/prometheus-kube-prometheus-alertmanager 9093:9093
```

Open:

- http://localhost:9093

## 8. Observability Resources In This Repo

The repo includes these files for alerting and scraping the backend metrics endpoint:

- `k8s/observability/backend-servicemonitor.yaml`
- `k8s/observability/backend-alert-rules.yaml`
- `k8s/observability/alertmanager-values.yaml`
- `k8s/observability/alertmanager-secret.yaml`

Backend metrics endpoint exposed by the app:

- `/metrics`

## 9. Quick Troubleshooting

If something does not start, check:

```bash
kubectl get pods -n mern-app
kubectl describe pod -n mern-app <pod-name>
kubectl logs -n mern-app <pod-name>
```

For monitoring issues:

```bash
kubectl get pods -n observability
kubectl get svc -n observability
kubectl logs -n observability <pod-name>
```

If the backend fails locally, verify that `MONGODB_URI` and `JWT_SECRET` are set in `recipe-server-dev/.env`.

If the frontend fails locally, verify the Supabase variables in `recipe-client-dev`.
