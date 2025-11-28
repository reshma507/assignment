In this DevOps task, you need to build and deploy a full-stack CRUD application using the MEAN stack (MongoDB, Express, Angular 15, and Node.js). The backend will be developed with Node.js and Express to provide REST APIs, connecting to a MongoDB database. The frontend will be an Angular application utilizing HTTPClient for communication.  

The application will manage a collection of tutorials, where each tutorial includes an ID, title, description, and published status. Users will be able to create, retrieve, update, and delete tutorials. Additionally, a search box will allow users to find tutorials by title.

## Project setup

### Node.js Server

cd backend

npm install

You can update the MongoDB credentials by modifying the `db.config.js` file located in `app/config/`.

Run `node server.js`

### Angular Client

cd frontend

npm install

Run `ng serve --port 8081`

You can modify the `src/app/services/tutorial.service.ts` file to adjust how the frontend interacts with the backend.

Navigate to `http://localhost:8081/`




MEAN Stack CRUD Application – DevOps Assignment

This project is a full-stack MEAN (MongoDB, Express, Angular, Node.js) CRUD application that has been fully containerized, deployed on an AWS EC2 instance, and automated using a CI/CD pipeline in Jenkins.
The assignment includes Dockerization of frontend & backend, Docker Compose orchestration, MongoDB setup, Nginx reverse proxy, and continuous deployment.

📁 Project Structure
.
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── Jenkinsfile
└── README.md

🐳 Dockerization
▶️ Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]

▶️ Frontend Dockerfile
# Stage 1 – Build Angular App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2 – Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/angular-15-crud /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

🧩 Docker Compose Setup

This docker-compose.yml orchestrates MongoDB, Backend, and Frontend.

version: "3.9"

services:
  mongo:
    image: mongo:6.0
    container_name: mongo-test
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    image: backend-test
    container_name: backend-test-container
    build:
      context: ./backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      - MONGO_URL=mongodb://mongo:27017/dd_db
    depends_on:
      - mongo
    networks:
      - mean-network

  frontend:
    image: frontend-test
    container_name: frontend-test-container
    build:
      context: ./frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - mean-network

networks:
  mean-network:
    driver: bridge

volumes:
  mongo-data:

🛢 MongoDB Setup

MongoDB is deployed using the official Docker image inside Docker Compose.

✔ No manual installation needed
✔ Automatically persists data using named volume mongo-data

🌐 Nginx Reverse Proxy Setup

Nginx listens on port 80 and forwards routes:

/api/* → backend (port 8080)

/ → frontend Angular application

nginx/default.conf
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:8080/;
    }

    location / {
        proxy_pass http://frontend:80/;
        index index.html;
    }
}

🔄 CI/CD Pipeline (Jenkins)
Pipeline Features:

✔ Builds backend & frontend Docker images
✔ Tags them with Git commit SHA
✔ Logs into Docker Hub
✔ Pushes updated images
✔ SSH into EC2 instance
✔ Pulls new images & restarts Docker Compose
✔ Cleans unused images to save space

Jenkinsfile
pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = "reshma561"
        IMAGE_TAG = "${env.GIT_COMMIT}"
    }

    stages {

        stage('Build Backend Image') {
            steps {
                sh """
                docker build -t ${DOCKERHUB_REPO}/assignment_backend:${IMAGE_TAG} backend/
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                docker build -t ${DOCKERHUB_REPO}/assignment_frontend:${IMAGE_TAG} frontend/
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                    """
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh """
                docker push ${DOCKERHUB_REPO}/assignment_backend:${IMAGE_TAG}
                docker push ${DOCKERHUB_REPO}/assignment_frontend:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy on EC2') {
            steps {
                sshagent(['ec2-ssh']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@54.175.60.36 << 'ENDSSH'
                        cd /home/ubuntu/assignment

                        docker pull ${DOCKERHUB_REPO}/assignment_backend:${IMAGE_TAG}
                        docker pull ${DOCKERHUB_REPO}/assignment_frontend:${IMAGE_TAG}

                        docker-compose down
                        docker-compose up -d --build

                        docker system prune -f
                    ENDSSH
                    """
                }
            }
        }
    }
}

☁️ AWS EC2 Deployment

The app runs on:

Ubuntu 22.04

Docker + Docker Compose

Nginx reverse proxy

Jenkins (external server)

Access the application using:

http://EC2-PUBLIC-IP


