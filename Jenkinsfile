pipeline {
  agent {
    kubernetes {
      yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins/label: "2401157-jobfit-anisha-1-mggxr"
spec:
  restartPolicy: Never
  nodeSelector:
    kubernetes.io/os: "linux"
  volumes:
    - name: workspace-volume
      emptyDir: {}
    - name: kubeconfig-secret
      secret:
        secretName: kubeconfig-secret
  containers:
    - name: node
      image: node:18
      tty: true
      command: ["cat"]
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: sonar-scanner
      image: sonarsource/sonar-scanner-cli
      tty: true
      command: ["cat"]
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: kubectl
      image: bitnami/kubectl:latest
      tty: true
      command: ["cat"]
      env:
        - name: KUBECONFIG
          value: /kube/config
      securityContext:
        runAsUser: 0
      volumeMounts:
        - name: kubeconfig-secret
          mountPath: /kube/config
          subPath: kubeconfig
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: dind
      image: docker:dind
      args: ["--storage-driver=overlay2", "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"]
      securityContext:
        privileged: true
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: jnlp
      image: jenkins/inbound-agent:3345.v03dee9b_f88fc-1
      env:
        - name: JENKINS_AGENT_NAME
          value: "2401157-jobfit-anisha-1-mggxr-tcg6j-kntxd"
        - name: JENKINS_AGENT_WORKDIR
          value: "/home/jenkins/agent"
      resources:
        requests:
          cpu: "100m"
          memory: "256Mi"
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent
'''
    }
  }

  environment {
    NAMESPACE         = '2401100_Tejas'
    REGISTRY          = 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'

    APP_NAME          = 'breathing-room-combined'
    IMAGE_TAG         = 'latest'
    APP_IMAGE         = "${REGISTRY}/${NAMESPACE}/${APP_NAME}:${IMAGE_TAG}"

    // FIXED → Correct internal Kubernetes DNS
    SONAR_PROJECT_KEY = 'sonar-token-2401100'
    SONAR_HOST_URL    = 'http://sonarqube.default.svc.cluster.local:9000'
  }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install + Build Frontend') {
      steps {
        container('node') {
          sh '''
          echo "📦 Installing frontend dependencies..."
          npm install
          echo "🏗️ Building frontend..."
          npm run build
          '''
        }
      }
    }

    stage('Install Backend') {
      steps {
        container('node') {
          dir('backend') {
            sh '''
            echo "📦 Installing backend dependencies..."
            npm install
            '''
          }
        }
      }
    }

stage('SonarQube Analysis') {
  steps {
    container('sonar-scanner') {
      withEnv(["SONAR_TOKEN=sqp_c6e9d7afc318b40952b5cd50eaa1b3b0c7cafb11"]) {
        sh '''
        echo "🔍 Trying SonarQube endpoints..."

        for URL in \
          "http://sonarqube:9000" \
          "http://sonarqube.sonarqube:9000" \
          "http://sonarqube.sonarqube.svc.cluster.local:9000" \
          "http://sonarqube.tools:9000" \
          "http://sonarqube.tools.svc.cluster.local:9000" \
          "http://sonarqube.default.svc.cluster.local:9000"
        do
          echo "Trying $URL ..."
          if curl --fail -s $URL/api/server/version > /dev/null ; then
            echo "✔ Working SonarQube endpoint: $URL"
            export SONAR_HOST_URL=$URL
            break
          fi
        done

        if [ -z "$SONAR_HOST_URL" ]; then
          echo "❌ Could not detect SonarQube service. Failing..."
          exit 1
        fi

        sonar-scanner \
          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
          -Dsonar.sources=. \
          -Dsonar.host.url=$SONAR_HOST_URL \
          -Dsonar.token=${SONAR_TOKEN}
        '''
      }
    }
  }
}


    stage('Build Combined Docker Image') {
      steps {
        container('dind') {
          sh '''
          echo "🐳 Waiting for Docker daemon..."
          while ! docker info > /dev/null 2>&1; do sleep 2; done

          echo "🏗 Building combined Docker image..."
          docker build -t ${APP_IMAGE} .
          '''
        }
      }
    }

    stage('Push to Nexus') {
      steps {
        container('dind') {
          withCredentials([usernamePassword(credentialsId: 'nexus-admin', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
            sh '''
            echo "🔐 Logging into Nexus..."
            echo "$NEXUS_PASS" | docker login ${REGISTRY} -u "$NEXUS_USER" --password-stdin

            echo "📤 Pushing image..."
            docker push ${APP_IMAGE}
            '''
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        container('kubectl') {
          withFileCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_PATH')]) {
            sh '''
            export KUBECONFIG=/kube/config

            echo "🚀 Applying deployment..."
            kubectl apply -n ${NAMESPACE} -f k8s-deployment.yaml

            echo "🔄 Updating image..."
            kubectl set image deployment/breathing-room-deployment breathing-room=${APP_IMAGE} -n ${NAMESPACE}

            echo "📡 Waiting for rollout..."
            kubectl rollout status deployment/breathing-room-deployment -n ${NAMESPACE}
            '''
          }
        }
      }
    }
  }

  post {
    success { echo "✅ Pipeline completed successfully!" }
    failure { echo "❌ Pipeline failed. Check the logs." }
    always { cleanWs() }
  }
}
