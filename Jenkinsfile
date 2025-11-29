pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins/label: "2401157-jobfit-anisha-1-mgg"
spec:
  containers:
    - name: node
      image: node:18
      command: ["cat"]
      tty: true

    - name: docker
      image: docker:24.0
      command: ["cat"]
      tty: true

    - name: sonar
      image: sonarsource/sonar-scanner-cli:latest
      command: ["cat"]
      tty: true

    - name: kubectl
      image: bitnami/kubectl:latest
      command: ["cat"]
      tty: true
            '''
        }
    }

    environment {
        DOCKER_IMAGE = "breathing-room-combined:latest"
        SONAR_HOST_URL = "http://sonarqube.default.svc.cluster.local:9000"
    }

    stages {

        stage('Initialize') {
            steps {
                container('node') {
                    sh '''
                    echo "🔥 Setting npm configurations..."
                    npm config set registry https://registry.npmjs.org/
                    npm config set fetch-retries 5
                    npm config set fetch-retry-factor 10
                    npm config set fetch-retry-maxtimeout 120000
                    npm config set fetch-retry-mintimeout 20000

                    export NPM_CONFIG_FETCH_TIMEOUT=120000
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                container('node') {
                    sh '''
                    echo "📦 Installing dependencies..."
                    npm install --force
                    '''
                }
            }
        }

        stage('Run SonarQube Scan') {
            steps {
                container('sonar') {
                    sh '''
                    echo "🔍 Running SonarQube scan..."
                    sonar-scanner \
                       -Dsonar.projectKey=sonar-token-2401100 \
                       -Dsonar.sources=. \
                       -Dsonar.host.url=$SONAR_HOST_URL \
                       -Dsonar.token=sqp_c6e9d7afc318b40952b5cd50eaa1b3b0c7cafb11
                    '''
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                container('docker') {
                    sh '''
                    echo "🐳 Building Docker image..."
                    docker build -t $DOCKER_IMAGE .

                    echo "🔐 Logging into Docker Hub..."
                    echo "$DOCKER_HUB_TOKEN" | docker login -u "$DOCKER_HUB_USER" --password-stdin

                    echo "📤 Pushing image..."
                    docker push $DOCKER_IMAGE
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                    echo "🚀 Deploying to Kubernetes..."
                    kubectl set image deployment/breathing-room breathing-room=$DOCKER_IMAGE -n default
                    kubectl rollout status deployment/breathing-room -n default
                    '''
                }
            }
        }
    }
}
