# STAGE 1: Build the Angular application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (npm ci is faster and more reliable for builds)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production
# Note: Angular 17+ usually outputs to dist/aviator2/browser
RUN npm run build -- --configuration production

# STAGE 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Angular app from the 'build' stage to the Nginx html directory
# IMPORTANT: Check your dist folder structure. 
# Angular 17+ (Application Builder) defaults to: dist/aviator2/browser
# Older builders defaults to: dist/aviator2
COPY --from=build /app/dist/aviator2/browser /usr/share/nginx/html

# Copy custom Nginx configuration (optional but recommended for routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
