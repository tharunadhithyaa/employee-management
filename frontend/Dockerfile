# ============================================================
# Frontend Dockerfile
# ============================================================
# Serves the static frontend files using Nginx Alpine.
# This is a simple "copy files into the default Nginx html
# directory" approach — no build step needed for vanilla HTML/CSS/JS.
# ============================================================

# Use the lightweight Nginx Alpine image
FROM nginx:alpine

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy our frontend files into the Nginx html directory
COPY . /usr/share/nginx/html/

# Expose port 80 (default for Nginx)
EXPOSE 80

# Nginx runs in the foreground by default in this image
CMD ["nginx", "-g", "daemon off;"]
