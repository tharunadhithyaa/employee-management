# 🏢 Employee Management System

> A **full-stack Employee Management System** built for demonstrating **Jenkins CI/CD with Docker Compose**. Uses HTML, CSS, Vanilla JavaScript, Node.js, Express, MongoDB, Docker, Nginx, and Jenkins.

![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Jenkins](https://img.shields.io/badge/Jenkins-Pipeline-red?logo=jenkins)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📁 Project Structure

```
employee-management/
│
├── frontend/               # Static frontend (HTML/CSS/JS)
│   ├── Dockerfile
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/                # REST API (Node.js + Express)
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── routes/
│       └── employees.js
│
├── nginx/                  # Reverse proxy
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml      # Orchestrates all services
├── Jenkinsfile             # CI/CD pipeline definition
└── README.md               # This file
```

---

## ✨ Features

### Frontend
- 🔐 **Login Page** — Dummy authentication (admin / admin)
- 📊 **Dashboard** — Live stats (total employees, departments, avg salary)
- 👥 **Employee List** — Searchable & sortable table with edit/delete actions
- ➕ **Add Employee** — Form with validation
- 🎨 **Modern UI** — Dark theme, glassmorphism, micro-animations, fully responsive

### Backend (REST API)
| Method   | Endpoint              | Description           |
|----------|-----------------------|-----------------------|
| `GET`    | `/api/health`         | Health check          |
| `GET`    | `/api/employees`      | Get all employees     |
| `GET`    | `/api/employees/:id`  | Get single employee   |
| `POST`   | `/api/employees`      | Create new employee   |
| `PUT`    | `/api/employees/:id`  | Update employee       |
| `DELETE` | `/api/employees/:id`  | Delete employee       |

### DevOps
- 🐳 **Dockerized** — Each component has its own Dockerfile
- 🔄 **Docker Compose** — One command to start everything
- 🏗️ **Jenkins Pipeline** — 7-stage declarative CI/CD pipeline
- 🌐 **Nginx Reverse Proxy** — Single port (80) entry point

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Run the Application

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/employee-management.git
cd employee-management

# Start all services
docker compose up --build
```

### Access the Application

| Service     | URL                                |
|-------------|------------------------------------|
| 🌐 App      | [http://localhost](http://localhost) |
| 📋 API      | [http://localhost/api/employees](http://localhost/api/employees) |
| 💚 Health   | [http://localhost/api/health](http://localhost/api/health) |

**Login Credentials:** `admin` / `admin`

### Stop the Application

```bash
docker compose down
```

---

## 🏗️ Architecture

```
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │ Port 80
                    ┌──────▼───────┐
                    │    Nginx     │
                    │ (Rev. Proxy) │
                    └──┬───────┬───┘
                       │       │
              /        │       │  /api/*
        ┌──────▼──┐  ┌─▼──────────┐
        │Frontend │  │  Backend   │
        │ (Nginx) │  │ (Express)  │
        └─────────┘  └─────┬──────┘
                           │
                    ┌──────▼───────┐
                    │   MongoDB    │
                    │  (Database)  │
                    └──────────────┘
```

---

## 🔧 Jenkins CI/CD Setup

### 1. Install Jenkins

```bash
# Run Jenkins in Docker
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### 2. Configure Jenkins

1. Open Jenkins at `http://localhost:8080`
2. Install suggested plugins + **Docker Pipeline** plugin
3. Create a new **Pipeline** job
4. Under Pipeline, select **Pipeline script from SCM**
5. Set SCM to **Git** and enter your repository URL
6. Branch: `*/main`
7. Script Path: `Jenkinsfile`
8. Save and click **Build Now**

### 3. Pipeline Stages

```
┌──────────┐   ┌─────────────┐   ┌────────────────┐   ┌──────────────────┐
│ Checkout │──▶│ Build Images │──▶│ Stop Existing  │──▶│ Compose Build    │
└──────────┘   └─────────────┘   └────────────────┘   └──────────────────┘
                                                              │
┌──────────┐   ┌───────────────┐   ┌───────────────┐          │
│ Success  │◀──│    Verify     │◀──│ Compose Up    │◀─────────┘
└──────────┘   └───────────────┘   └───────────────┘
```

---

## 🐳 Docker Commands Reference

```bash
# Build and start all services
docker compose up --build

# Start in detached mode (background)
docker compose up -d --build

# View running containers
docker compose ps

# View logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v

# Rebuild a single service
docker compose build backend
docker compose up -d backend
```

---

## 📋 API Testing with cURL

```bash
# Health check
curl http://localhost/api/health

# Get all employees
curl http://localhost/api/employees

# Create a new employee
curl -X POST http://localhost/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul@company.com",
    "department": "Engineering",
    "designation": "Software Engineer",
    "salary": 75000
  }'

# Update an employee (replace <ID> with actual MongoDB _id)
curl -X PUT http://localhost/api/employees/<ID> \
  -H "Content-Type: application/json" \
  -d '{"salary": 85000}'

# Delete an employee
curl -X DELETE http://localhost/api/employees/<ID>
```

---

## 🛠️ Tech Stack

| Component    | Technology          | Purpose                    |
|-------------|---------------------|----------------------------|
| Frontend    | HTML, CSS, JS       | User interface             |
| Backend     | Node.js, Express    | REST API                   |
| Database    | MongoDB 6           | Data storage               |
| Reverse Proxy | Nginx             | Routes traffic, port 80    |
| Containers  | Docker, Compose     | Containerization           |
| CI/CD       | Jenkins             | Automated deployment       |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use it for your college projects and demos!

---

## 💡 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 80 already in use | Stop any other service on port 80, or change the port in `docker-compose.yml` |
| MongoDB connection fails | Wait 10-15 seconds after `docker compose up` for MongoDB to initialize |
| Backend keeps restarting | Check logs: `docker compose logs backend` |
| Jenkins can't run Docker | Add Jenkins user to docker group: `sudo usermod -aG docker jenkins` |

---

> **Made with ❤️ for learning Docker, Docker Compose, and Jenkins CI/CD**
# employee-management
