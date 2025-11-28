# ==== STAGE 1: Build Angular app ====
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build
COPY . .
RUN npm run build --prod

# ==== STAGE 2: Serve with Nginx ====
FROM nginx:alpine

# Copy Angular build output to Nginx html folder
COPY --from=build /app/dist/angular-15-crud /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
