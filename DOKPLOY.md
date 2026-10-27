# Dokploy Deployment Guide — LFP Platform

This guide outlines how to deploy the full **LFP Platform** (FastAPI Analytics + TanStack Start Frontend + Nginx Gateway) onto **[Dokploy](https://dokploy.com)** using Docker Compose.

---

## 1. Architecture Overview

The application is packaged into three containerized services running on a dedicated internal Docker network (`lfp-network`):

| Service | Technology | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **`gateway`** | Nginx Reverse Proxy | `80` | **Unified Entry Point**. Routes `/api/*` and `/docs` to backend, and all frontend routes `/*` to frontend. |
| **`frontend`** | TanStack Start / React (Node 22) | `3000` | High-density battery dashboards, interactive Joyride tour, screening & SPC visualizations. |
| **`backend`** | FastAPI / Python 3.13 (`uv`) | `8000` | Cycler telemetry ingestion, Savitzky-Golay dQ/dV, IATF 16949 SPC Shewhart calculation, BTMS thermal ODE solver. |

---

## 2. Quick Deploy on Dokploy (Step-by-Step)

### Step 1: Create a Project in Dokploy
1. Log in to your Dokploy Dashboard.
2. Navigate to **Projects** and select or create a project (e.g. `Battery-Engineering`).

### Step 2: Create a Compose Application
1. Click **Create Service** and select **Compose**.
2. Give it a name (e.g. `lfp-platform`).
3. Under **Source**:
   - Choose **Git** (if deploying from GitHub/GitLab):
     - Repository URL: `https://github.com/your-username/lfp-platform`
     - Branch: `main`
     - Compose Path: `docker-compose.yml`
   - *Or choose **Raw**: copy-paste the contents of [`docker-compose.yml`](./docker-compose.yml).*

### Step 3: Configure Environment Variables (Optional)
In the Dokploy **Environment** tab, set standard runtime variables (host port mappings are not needed on Dokploy since Traefik handles ingress routing):

```ini
CORS_ORIGINS=*
NODE_ENV=production
FASTAPI_INTERNAL_URL=http://backend:8000
```

> **Note on Ports**: Dokploy runs Traefik on host ports 80/443. The Compose stack uses `expose` instead of binding host ports, so you will never encounter `Bind for 0.0.0.0:80 failed: port is already allocated`. Dokploy routes your domain directly to the internal `gateway` container on port 80.

### Step 4: Configure Domain & SSL
1. Go to the **Domains** tab in your Dokploy Compose service.
2. Click **Add Domain**:
   - **Host**: `lfp.yourdomain.com` (or your domain)
   - **Service**: Select `gateway`
   - **Port**: `80`
   - **HTTPS**: Enable Let's Encrypt SSL (automatic certificate issuance)
3. Click **Save**.

### Step 5: Deploy
Click **Deploy**. Dokploy will pull/build the Docker containers, verify health checks, and bind Traefik to the gateway.

Once deployed, access your platform at:
- Web Application: `https://lfp.yourdomain.com/`
- API Health Check: `https://lfp.yourdomain.com/api/health`
- Interactive Swagger API Docs: `https://lfp.yourdomain.com/docs`

---

## 3. Alternative: Running Locally with Docker Compose

To test the complete stack locally:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and start containers in detached mode
docker compose up -d --build

# 3. Verify health status of all 3 services
docker compose ps
```

Visit:
- **Unified Gateway**: [http://localhost](http://localhost) (or port configured in `GATEWAY_PORT`)
- **Direct Frontend**: [http://localhost:3000](http://localhost:3000)
- **Direct Backend & Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. Persistent Datasets & Storage

The backend mounts `./data` into `/app/data:ro` in [`docker-compose.yml`](./docker-compose.yml).
This allows you to add or update:
- Novonix cycler CSVs (`data/sintef/`)
- Neware cycler CSVs (`data/sintef/`)
- Quasi-equilibrium C/12 and GITT profiles (`data/lfp_lg_chem_csv/`)
directly on the host server without needing to rebuild the Docker image.
