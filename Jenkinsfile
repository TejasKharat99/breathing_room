pipeline {
    agent {
        kubernetes {
            defaultContainer 'node'
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: breathing-room
spec:
  serviceAccountName: jenkins
  containers:
    - name: node
      image: node:18
      command: ['cat']
      tty: true
    - name: docker
      image: docker:24
      command: ['cat']
      tty: true
      volumeMounts:
        - name: docker-sock
          mountPath: /var/run/docker.sock
  volumes:
    - name: docker-sock
      hostPath:
        path: /var/run/docker.sock
"""
        }
    }

    environment {
        DOCKER_IMAGE = "breathing-room-combined:latest"
        DOCKER_REGISTRY = "<CHANGE THIS — your registry>"
        SONAR_PROJECT_KEY = "2401100_TejasKharat"
        SONAR_HOST_URL = "<CHANGE THIS — your sonar URL>"
        SONAR_TOKEN = credentials('sonar-token')   // Add in Jenkins → Credentials
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "📥 Code checked out successfully!"
            }
        }

        stage('Install Dependencies') {
            steps {
                container('node') {
                    sh """
                        echo "🔧 Installing dependencies..."
                        npm install --legacy-peer-deps
                    """
                }
            }
        }

        stage('Build App') {
            steps {
                container('node') {
                    sh """
                        echo "🏗️ Building project..."
                        npm run build
                    """
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('node') {
                    withSonarQubeEnv('MySonarServer') {
                        sh """
                        npx sonar-scanner \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                container('docker') {
                    sh """
                        echo "🐳 Building docker image..."
                        docker build -t $DOCKER_REGISTRY/$DOCKER_IMAGE .
                    """
                }
            }
        }

        stage('Docker Push') {
            steps {
                container('docker') {
                    sh """
                        echo "📤 Pushing docker image..."
                        echo "<CHANGE THIS — your docker password>" | docker login -u "<CHANGE USER>" --password-stdin
                        docker push $DOCKER_REGISTRY/$DOCKER_IMAGE
                    """
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up workspace..."
            cleanWs()
        }
    }
}
