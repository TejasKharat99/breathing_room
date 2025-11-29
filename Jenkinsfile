pipeline {
    agent {
        kubernetes {
            label "2401100-tejaskharat-agent"
            defaultContainer 'jnlp'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins/label: "2401100-tejaskharat-agent"
spec:
  serviceAccountName: jenkins
  containers:
    - name: tools
      image: docker:24.0.5
      command:
        - cat
      tty: true
      volumeMounts:
        - name: dockersock
          mountPath: /var/run/docker.sock

    - name: sonar
      image: sonarsource/sonar-scanner-cli:latest
      command:
        - cat
      tty: true
  volumes:
    - name: dockersock
      hostPath:
        path: /var/run/docker.sock
"""
        }
    }

    environment {
        SONAR_HOST_URL = "http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        SONAR_PROJECT_KEY = "2401100_TejasKharat"
        SONAR_TOKEN = credentials('sonar-token')
        DOCKER_IMAGE = "breathing-room-combined:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                container('tools') {
                    echo "📥 Checking out repository..."
                    checkout scm
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar') {
                    echo "🔍 Running SonarQube Scan..."
                    sh """
                    sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.token=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Docker Build') {
            steps {
                container('tools') {
                    echo "🐳 Building Docker image..."
                    sh """
                        docker build -t ${DOCKER_IMAGE} .
                    """
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning workspace..."
            cleanWs()
        }
    }
}
