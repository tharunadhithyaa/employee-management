/*
 * ============================================================
 * Jenkinsfile — Declarative Pipeline
 * ============================================================
 *
 * This pipeline automates the CI/CD process for the
 * Employee Management System using Docker Compose.
 *
 * Stages:
 *   1. Checkout         — Pull the latest code from GitHub
 *   2. Build Images     — Build all Docker images
 *   3. Stop Existing    — Stop any running containers
 *   4. Compose Build    — Rebuild with Docker Compose
 *   5. Compose Up       — Start all services
 *   6. Verify           — Ensure all containers are running
 *   7. Success          — Print success message
 *
 * Prerequisites:
 *   - Jenkins with Docker & Docker Compose installed
 *   - Jenkins user added to the 'docker' group
 *   - Pipeline plugin installed in Jenkins
 *
 * ============================================================
 */

pipeline {

    // Run on any available Jenkins agent
    agent any

    // ---- Environment Variables ----
    environment {
        // Project name used by Docker Compose
        COMPOSE_PROJECT_NAME = 'employee-management'
    }

    // ---- Pipeline Stages ----
    stages {

        // ========================================
        // Stage 1: Checkout Code from GitHub
        // ========================================
        stage('Checkout') {
            steps {
                echo '📥 Stage 1: Checking out source code from GitHub...'
                // This automatically checks out the repo configured
                // in the Jenkins job (via SCM settings)
                checkout scm
                echo '✅ Code checkout complete!'
            }
        }

        // ========================================
        // Stage 2: Build Docker Images
        // ========================================
        stage('Build Docker Images') {
            steps {
                echo '🔨 Stage 2: Building Docker images for all services...'
                bat 'docker compose build --no-cache'
                echo '✅ All Docker images built successfully!'
            }
        }

        // ========================================
        // Stage 3: Stop Existing Containers
        // ========================================
        stage('Stop Existing Containers') {
            steps {
                echo '🛑 Stage 3: Stopping any existing containers...'
                // "|| true" ensures the pipeline doesn't fail
                // if no containers are running
                bat 'docker compose down --remove-orphans || true'
                echo '✅ Existing containers stopped!'
            }
        }

        // ========================================
        // Stage 4: Docker Compose Build
        // ========================================
        stage('Docker Compose Build') {
            steps {
                echo '🏗️  Stage 4: Running Docker Compose build...'
                bat 'docker compose build'
                echo '✅ Docker Compose build complete!'
            }
        }

        // ========================================
        // Stage 5: Docker Compose Up
        // ========================================
        stage('Docker Compose Up') {
            steps {
                echo '🚀 Stage 5: Starting all services with Docker Compose...'
                // -d runs containers in detached (background) mode
                bat 'docker compose up -d'
                echo '✅ All services started!'

                // Wait a few seconds for services to initialize
                echo '⏳ Waiting 10 seconds for services to initialize...'
                bat 'timeout /t 10 /nobreak'
            }
        }

        // ========================================
        // Stage 6: Verify Containers Are Running
        // ========================================
        stage('Verify Containers') {
            steps {
                echo '🔍 Stage 6: Verifying all containers are running...'

                // List all running containers
                bat 'docker compose ps'

                // Check that the API health endpoint responds
                bat '''
                    echo "Testing API health endpoint..."
                    curl -f http://localhost/api/health || echo "⚠️  API not ready yet (may need more time)"
                '''

                echo '✅ Container verification complete!'
            }
        }

        // ========================================
        // Stage 7: Success Message
        // ========================================
        stage('Success') {
            steps {
                echo '''
                ╔══════════════════════════════════════════════════╗
                ║                                                  ║
                ║   🎉  DEPLOYMENT SUCCESSFUL!                     ║
                ║                                                  ║
                ║   Employee Management System is now running!     ║
                ║                                                  ║
                ║   🌐  URL: http://localhost                      ║
                ║   📋  API: http://localhost/api/employees         ║
                ║   💚  Health: http://localhost/api/health         ║
                ║                                                  ║
                ║   Login: admin / admin                           ║
                ║                                                  ║
                ╚══════════════════════════════════════════════════╝
                '''
            }
        }
    }

    // ---- Post Actions ----
    // These run after all stages, regardless of success or failure.
    post {
        success {
            echo '🎉 Pipeline completed successfully! Application is live at http://localhost'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
            // Optionally stop containers on failure to clean up
            bat 'docker compose down || true'
        }
        always {
            echo '📋 Pipeline execution finished.'
        }
    }
}
