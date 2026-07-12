# ============================================================
# Nginx Reverse Proxy — Dockerfile
# ============================================================
# Custom Nginx image with our reverse proxy configuration.
# ============================================================

FROM nginx:alpine

# Remove the default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
