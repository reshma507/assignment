# ==== BASE IMAGE ====
FROM node:18-alpine

# ==== APP DIRECTORY ====
WORKDIR /app

# ==== INSTALL DEPENDENCIES ====
COPY package*.json ./
RUN npm install

# ==== COPY SOURCE CODE ====
COPY . .

# ==== EXPOSE PORT ====
EXPOSE 8080

# ==== START THE SERVER ====
CMD ["npm", "start"]

