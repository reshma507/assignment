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




# MEAN Stack CRUD Application – DevOps Assignment

This repository contains a fully containerized MEAN (MongoDB, Express, Angular, Node.js) CRUD application deployed on AWS EC2 using Docker, Docker Compose, Jenkins CI/CD, and Nginx reverse proxy.

---

## Project Structure

```
backend/
frontend/
docker-compose.yml
nginx/default.conf
Jenkinsfile
README.md
```

---

## Dockerfiles

### Backend Dockerfile

```
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Frontend Dockerfile

```
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/angular-15-crud /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Docker Compose File

```
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
```

---

## Nginx Reverse Proxy (nginx/default.conf)

```
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
```

---

## CI/CD – Jenkins Pipeline

```
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
                    ssh -o StrictHostKeyChecking=no ubuntu@54.234.207.127 << 'ENDSSH'
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
```

---

## How to Run Locally

```
git clone https://github.com/reshma507/assignment.git
cd assignment
docker-compose up --build
```

Frontend → http://localhost  
Backend → http://localhost:8080/api  
MongoDB → localhost:27017  

---

## Deployment

The application is deployed on AWS EC2.

Public IP:  
http://54.234.207.127

---

  ## 🖥️ EC2 Setup & Installations

Below are the full installation steps performed on the AWS EC2 Ubuntu 22.04/24.04 instance for setting up:

Docker

Docker Compose

Jenkins

Required permissions

Use these steps directly in your README.md.

## 🐳 Install Docker on EC2
Update system
sudo apt update

Install Docker Engine
sudo apt install -y docker.io

Enable & start Docker
sudo systemctl enable docker
sudo systemctl start docker

Add ubuntu user to Docker group

(Allows Docker commands without sudo)

sudo usermod -aG docker ubuntu

Apply changes
newgrp docker

## 🐳 Install Docker Compose
Download Docker Compose binary
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

Give executable permissions
sudo chmod +x /usr/local/bin/docker-compose

Verify installation
docker-compose --version

## ⚙️ Install Jenkins on EC2
Install Java (required for Jenkins)
sudo apt update
sudo apt install -y openjdk-17-jre

Add Jenkins repository key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

Add Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

Install Jenkins
sudo apt update
sudo apt install -y jenkins

Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

Check Jenkins status
systemctl status jenkins

##  Allow Jenkins to Use Docker (Required for CI/CD)
Add Jenkins user to Docker group
sudo usermod -aG docker jenkins

Restart Jenkins service
sudo systemctl restart jenkins

Verify Jenkins can run Docker

Switch to Jenkins user:

sudo su - jenkins
docker ps


If it runs without permission error → ✔ Success

##  Open Required Ports in EC2 Security Group
Port	Purpose
22	SSH
80	Nginx / Frontend
8080	Jenkins
27017	MongoDB (optional)
3000 / custom	Backend if needed
##  Clone Repo & Deploy Using Docker Compose
git clone https://github.com/reshma507/assignment.git
cd assignment
docker-compose up -d --build

---

## Summary

This project demonstrates:

- Dockerized MEAN stack  
- Docker Compose orchestration  
- MongoDB persistent storage  
- Jenkins CI/CD pipeline  
- Docker Hub integration  
- Automated deployment to EC2  
- Nginx reverse proxy  

## 📸 Screenshots

### 1. Docker compose excution in ec2
![Application UI](https://github.com/user-attachments/assets/f54f4cc2-bc3e-481f-a5d0-5af6ab8a0200)
![Application UI](https://github.com/user-attachments/assets/75a1f04c-f929-4220-ac9a-5f966ef13fa0)

---
### 1. Docker containers up and running
![Application UI](https://github.com/user-attachments/assets/6d275aee-57bd-45d2-a25d-50777f537c3d)

---
### 1. Docker images created
![Application UI](https://github.com/user-attachments/assets/6d4a5153-9764-4283-8943-e10995d418c9)

---


### 1. Docker Hub-Images successfully pushed
![Application UI](https://github.com/user-attachments/assets/6d4a5153-9764-4283-8943-e10995d418c9)

---

### 2. Jenkins credentials required
![Docker Hub Images](https://github.com/user-attachments/assets/08307b4f-6045-4afe-bd00-ab5ac57a9477)

---

### 3. EC2 security group – Inbound rules settings
![Jenkins Build](https://github.com/user-attachments/assets/d979649b-d971-4cb4-a3bb-00278ee3fa80)

---

### 4. Testing Backend container - Backend running
![EC2 Containers](https://github.com/user-attachments/assets/72ac4576-4f21-40ca-b870-d99f7edea287)

---

### 5. Testing Frontend container - Frontend running
![EC2 Containers](https://github.com/user-attachments/assets/c04be741-426a-409f-9de2-fa8d166026ff)

---
<img width="1714" height="184" alt="Screenshot 2025-11-28 232118" src="https://github.com/user-attachments/assets/6d275aee-57bd-45d2-a25d-50777f537c3d" />

<img width="1070" height="632" alt="Screenshot 2025-11-28 232058" src="https://github.com/user-attachments/assets/f54f4cc2-bc3e-481f-a5d0-5af6ab8a0200" />
<img width="1012" height="592" alt="Screenshot 2025-11-28 232026" src="https://github.com/user-attachments/assets/75a1f04c-f929-4220-ac9a-5f966ef13fa0" />

<img width="934" height="620" alt="Screenshot 2025-11-28 232036" src="https://github.com/user-attachments/assets/ca44f916-92a4-4848-adce-b5ba18911080" />





