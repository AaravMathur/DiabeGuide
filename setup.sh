#!/bin/bash

# Update the package manager
sudo apt-get update -y

# Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose

# Start the Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add the current user to the docker group to run docker commands without sudo
sudo usermod -a -G docker $(whoami)

# You will need to log out and log back in for the group changes to take effect.
# After logging back in, you can proceed with the following commands.

# --- MANUAL STEPS REQUIRED ---
# 1. Authenticate with your Docker registry (e.g., Docker Hub)
#    docker login -u YOUR_DOCKERHUB_USERNAME
#
# 2. Pull the Docker image from the registry
#    docker pull YOUR_DOCKERHUB_USERNAME/diabeguide:latest
#
# 3. Clone your repository to the EC2 instance
#    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
#
# 4. Navigate to the project directory
#    cd YOUR_REPOSITORY/DiabeGuide
#
# 5. Create a .env file from the example
#    cp diabeGuide/.env.example diabeGuide/.env
#
# 6. Edit the .env file with your actual credentials
#    nano diabeGuide/.env
#
# 7. Run docker-compose
#    docker-compose up -d
# ---

echo "Setup complete. Please log out and log back in."
echo "Then, follow the manual steps commented in this script to deploy the application."

