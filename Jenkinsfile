pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins/label: "2401100-tejaskharat"
spec:
  serviceAccountName: jenkins
  containers:
    - name: node
      image: node:18
      command:
        - cat
      tty: true
    - name: docker
      image: docker:24-git
      command:
        - cat
      tty: true
      volumeMounts:
        - name: dockersock
          mountPath: /var/run/docker.sock
    - name: sonar-scanner
      image: sonarsource/sonar-scanner-cli:latest
      command:
        - cat
      tty: true
  volumes:
    - name: dockersock
      hostPath:
        path: /var/run/docker.sock
'''
        }
    }

    environment {
        IMAGE_NAME = "breathing-room-combined:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                container('node') {
                    git url: 'https://github.com/TejasKharat99/breathing_room.git', branch: 'main'
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
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sqp_c6e9d7afc318b40952b5cd50eaa1b3b0c7cafb11', variable: 'SONAR_TOKEN')]) {
                        sh """
                            echo '🔍 Running SonarQube scan...'

                            sonar-scanner \
                              -Dsonar.projectKey=2401100_TejasKharat \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                              -Dsonar.token=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    sh """
                        echo '🐳 Building Docker Image...'
                        docker build -t $IMAGE_NAME .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            echo '📤 Pushing Docker Image...'
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker tag $IMAGE_NAME $DOCKER_USER/$IMAGE_NAME
                            docker push $DOCKER_USER/$IMAGE_NAME
                        """
                    }
                }
            }
        }

    }

    post {
        always {
            echo "Pipeline Finished."
        }
    }
}
