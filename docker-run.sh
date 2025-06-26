#!/bin/bash

# Build the container image
echo "Building the container image..."
docker build -f Containerfile -t wesleyk-website .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful! Starting the container..."
    
    # Stop any existing container with the same name
    docker stop wesleyk-website-container 2>/dev/null
    docker rm wesleyk-website-container 2>/dev/null
    
    # Run the container
    echo "Starting container on http://localhost:3000"
    docker run -d \
        --name wesleyk-website-container \
        -p 3000:3000 \
        wesleyk-website
    
    echo "Container started successfully!"
    echo "Visit http://localhost:3000 to view your website"
    echo ""
    echo "To stop the container, run: docker stop wesleyk-website-container"
    echo "To view logs, run: docker logs wesleyk-website-container"
else
    echo "Build failed!"
    exit 1
fi
