pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: breathing-room-pipeline
    jenkins/label: "2401100-tejaskharat"
spec:
  serviceAccountName: jenkins
  containers:
  - name: node
    image: node:18-alpine
    command: ['cat']
    tty: true
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 1000m
        memory: 2Gi
    volumeMounts:
    - name: npm-cache
      mountPath: /root/.npm
  - name: docker
    image: docker:24.0.5-dind
    securityContext:
      privileged: true
    command: ['cat']
    tty: true
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 1000m
        memory: 2Gi
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command: ['cat']
    tty: true
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 1000m
        memory: 2Gi
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
  - name: npm-cache
    emptyDir: {}
'''
        }
    }

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'breathing-room'
        DOCKER_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        IMAGE_NAME = "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
        SONARQUBE_URL = 'http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000'
    }

    stages {

        stage('Checkout') {
            steps {
                container('node') {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'main']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/TejasKharat99/breathing_room.git',
                            credentialsId: 'GITHUB_CREDENTIALS'  // Make sure to add this credential in Jenkins
                        ]],
                        extensions: [[
                            $class: 'CleanBeforeCheckout'
                        ]]
                    ])
                    sh 'git config --global --add safe.directory $WORKSPACE'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                container('node') {
                    sh '''
                        echo "📦 Installing Node dependencies..."
                        npm config set registry https://registry.npmjs.org/
                        npm install
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'develop' }
            }
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sqp_c6e9d7afc318b40952b5cd50eaa1b3b0c7cafb11', variable: 'SONAR_TOKEN')]) {
                        script {
                            def scannerHome = tool 'sonar-scanner'
                            withSonarQubeEnv('sonar') {
                                sh """
                                ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=2401100_TejasKharat \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONARQUBE_URL} \
                                    -Dsonar.projectVersion=${env.BUILD_NUMBER} \
                                    -Dsonar.sourceEncoding=UTF-8 \
                                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                    -Dsonar.token=${SONAR_TOKEN}
                                """
                            }
                            // Wait for SonarQube analysis to complete and check quality gate
                            timeout(time: 10, unit: 'MINUTES') {
                                def qg = waitForQualityGate()
                                if (qg.status != 'OK') {
                                    error "Pipeline aborted due to quality gate failure: ${qg.status}"
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    script {
                        sh 'docker version'
                        sh 'docker info'
                        
                        // Build the Docker image with build arguments if needed
                        def buildArgs = ""
                        if (env.NODE_ENV) {
                            buildArgs += " --build-arg NODE_ENV=${env.NODE_ENV}"
                        }
                        
                        sh """
                        echo '🐳 Building Docker Image: ${IMAGE_NAME}'
                        docker build ${buildArgs} \
                            -t ${IMAGE_NAME} \
                            -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest \
                            .
                        """
                    }
                }
            }
        }

        stage('Push Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'release/.*'
                    expression { return env.TAG_NAME != null }
                }
            }
            steps {
                container('docker') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'DOCKER_HUB',
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {
                        sh """
                        echo '📤 Logging into Docker Hub...'
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        echo '📤 Tagging and pushing Docker images...'
                        docker tag ${IMAGE_NAME} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        
                        # If this is the main branch, also push as latest
                        if [ "${env.BRANCH_NAME}" = "main" ]; then
                            docker tag ${IMAGE_NAME} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
                        fi
                        
                        echo '✅ Docker images pushed successfully!'
                        """
                    }
                }
            }
        }

    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            // Optionally send success notification
        }
        failure {
            echo '❌ Pipeline failed!'
            // Optionally send failure notification
        }
        cleanup {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
            script {
                // Clean up Docker images to save disk space
                container('docker') {
                    sh '''
                    docker system prune -f || true
                    docker rmi -f $(docker images -q) 2>/dev/null || true
                    '''
                }
            }
        }
    }
}
