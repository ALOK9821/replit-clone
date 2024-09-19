# Replit-Like Cloud Platform

This project is a scalable, cloud-native platform inspired by Replit, designed to manage and orchestrate containerized workloads using **AWS Auto Scaling**, **ECS**, and **Kubernetes**. The system utilizes a **microservices architecture** with **Node.js** and **TypeScript** for real-time task execution and orchestration, ensuring efficient resource utilization and high performance across compute instances.

## Tech Stack

- **Backend**: Node.js with TypeScript for microservice development.
- **Containerization**: Docker containers for encapsulating each service.
- **Orchestration**: Kubernetes for managing and scaling containerized workloads.
- **Cloud Platform**: AWS (Auto Scaling Groups, ECS) for infrastructure and autoscaling.
- **Real-time Communication**: WebSocket-based system for task execution and orchestration.

## System Architecture

The platform is designed using a simple microservices architecture with the following key components:

- **Simple HTTP API**: A lightweight API service that allows users to submit tasks to the platform.
- **Orchestrator**: Responsible for distributing tasks to available runner nodes using HTTP or WebSocket-based communication.
- **Runner WebSocket Server**: Executes the tasks and reports back to the orchestrator upon completion.
- **Compute Nodes**: High-performance instances (32 CPUs, 100GB RAM) that dynamically scale based on traffic and resource demands.

## Setup and Deployment

### Prerequisites

- **Node.js**: Ensure you have Node.js (v14+) installed.
- **Docker**: For containerization.
- **AWS Account**: For cloud infrastructure setup.
- **Kubernetes Cluster**: Set up either locally (e.g., using Minikube) or on AWS using EKS (Elastic Kubernetes Service).

### Steps to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/replit-clone-platform.git
   cd replit-clone-platform
2. **Install dependencies**:
   ```bash
   npm install
3. **Set up environment variables**: Create a ```.env``` file in the root directory with the necessary environment variables for AWS and Kubernetes configurations.
4. **Build Docker images**:
   ```bash
    docker-compose build
   ```
5. **Run the platform**:
   ```bash
    docker-compose up
   ```
6.  **Deploy on kubernates**:
    ```bash
      kubectl apply -f kubernetes-manifests/
    ```
