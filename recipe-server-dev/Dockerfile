# Backend image for Node.js API
FROM node:18-alpine

# Use a dedicated app directory inside the container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the backend source code
COPY . .

# The backend listens on port 5000
EXPOSE 5000

# Environment variables are provided at runtime (for example via .env in compose)
CMD ["npm", "start"]
