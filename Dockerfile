# projects/aviator3/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Builds to dist/aviator3/browser
RUN npm run build -- --configuration production

# --- ADD THIS LINE TO DEBUG ---
RUN ls -R /app/dist
# ------------------------------

# Stage 2: Serve
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts
# Check your angular.json if the output path is different!
COPY --from=build /app/dist/aviator3/browser /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
