# ============================================================
# Backend Dockerfile
# ============================================================
# This Dockerfile builds the Node.js/Express backend image.
# It uses the official Node.js 18 Alpine image for a small
# footprint (~120MB vs ~900MB for the full image).
# ============================================================

# Use Node.js 18 on Alpine Linux (lightweight)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first.
# This lets Docker cache the npm install layer separately
# from the source code, so rebuilds are faster when only
# code changes (not dependencies).
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# The backend listens on port 5000
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
