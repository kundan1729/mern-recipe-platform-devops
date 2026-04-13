# Stage 1: Build the React app
FROM node:18 AS build

WORKDIR /app

# Copy dependency manifests first to improve build caching
COPY package*.json ./

# Install all dependencies required to build the frontend
RUN npm install

# Copy application source and build static assets
COPY . .
RUN npm run build

# Stage 2: Serve static assets with NGINX
FROM nginx:alpine

# Use a custom NGINX config for SPA routing and optional API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output into the NGINX web root
COPY --from=build /app/dist /usr/share/nginx/html

# NGINX serves on port 80
EXPOSE 80
