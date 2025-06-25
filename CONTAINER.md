# Container Deployment Guide

This guide explains how to containerize and run Wesley Kirkland's personal website using Docker or Podman.

## 🐳 Container Overview

The website is containerized using a multi-stage build process that:
1. Installs dependencies
2. Builds the Next.js static export
3. Serves the static files using a lightweight HTTP server
4. Exposes the application on port 3000

## 📋 Prerequisites

Choose one of the following container runtimes:
- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Podman**: [Install Podman](https://podman.io/getting-started/installation)

## 🚀 Quick Start

### Option 1: Using Docker

```bash
# Make the script executable (if not already)
chmod +x docker-run.sh

# Build and run the container
./docker-run.sh
```

### Option 2: Using Podman

```bash
# Make the script executable (if not already)
chmod +x podman-run.sh

# Build and run the container
./podman-run.sh
```

## 🔧 Manual Commands

### Docker Commands

```bash
# Build the image
docker build -f Containerfile -t wesleyk-website .

# Run the container
docker run -d \
  --name wesleyk-website-container \
  -p 3000:3000 \
  wesleyk-website

# View logs
docker logs wesleyk-website-container

# Stop the container
docker stop wesleyk-website-container

# Remove the container
docker rm wesleyk-website-container

# Remove the image
docker rmi wesleyk-website
```

### Podman Commands

```bash
# Build the image
podman build -f Containerfile -t wesleyk-website .

# Run the container
podman run -d \
  --name wesleyk-website-container \
  -p 3000:3000 \
  wesleyk-website

# View logs
podman logs wesleyk-website-container

# Stop the container
podman stop wesleyk-website-container

# Remove the container
podman rm wesleyk-website-container

# Remove the image
podman rmi wesleyk-website
```

## 🌐 Accessing the Website

Once the container is running, visit:
- **Local**: [http://localhost:3000](http://localhost:3000)
- **Network**: `http://<your-ip>:3000` (accessible from other devices on your network)

## 📊 Container Details

- **Base Image**: `node:18-alpine`
- **Port**: 3000
- **Server**: `serve` (lightweight static file server)
- **Build Type**: Multi-stage build for optimized image size
- **User**: Non-root user (`nextjs`) for security

## 🔍 Troubleshooting

### Container won't start
```bash
# Check if the container is running
docker ps -a
# or
podman ps -a

# Check container logs
docker logs wesleyk-website-container
# or
podman logs wesleyk-website-container
```

### Port already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Use a different port
docker run -d --name wesleyk-website-container -p 8080:3000 wesleyk-website
# or
podman run -d --name wesleyk-website-container -p 8080:3000 wesleyk-website
```

### Build fails
```bash
# Clean up and rebuild
docker system prune -f
docker build --no-cache -f Containerfile -t wesleyk-website .
# or
podman system prune -f
podman build --no-cache -f Containerfile -t wesleyk-website .
```

## 🔒 Security Features

- Non-root user execution
- Minimal Alpine Linux base image
- Only necessary files copied to final image
- Static file serving (no server-side execution)

## 📈 Performance

- **Image Size**: ~150MB (optimized with multi-stage build)
- **Memory Usage**: ~50MB runtime
- **Startup Time**: ~2-3 seconds
- **Static Files**: Pre-built and cached for fast serving

## 🚀 Production Deployment

For production deployment, consider:

1. **Reverse Proxy**: Use nginx or traefik in front of the container
2. **SSL/TLS**: Terminate SSL at the reverse proxy level
3. **Health Checks**: Add health check endpoints
4. **Resource Limits**: Set memory and CPU limits
5. **Logging**: Configure proper log aggregation

Example with resource limits:
```bash
docker run -d \
  --name wesleyk-website-container \
  --memory="256m" \
  --cpus="0.5" \
  -p 3000:3000 \
  wesleyk-website
```

## 📝 Environment Variables

### Server Configuration
- `PORT`: Server port (default: 3000)
- `HOSTNAME`: Bind hostname (default: 0.0.0.0)

### Personal Information (Build-time)
These environment variables are used during the build process and must be set when building the container:

- `NEXT_PUBLIC_PROFESSIONAL_TITLE`: Your job title (default: "Principal Solutions Architect")
- `NEXT_PUBLIC_FULL_TITLE`: Full professional title with specializations
- `NEXT_PUBLIC_NAME`: Your name (default: "Wesley Kirkland")
- `NEXT_PUBLIC_TAGLINE`: Your tagline (default: "Meme Master of Disaster")
- `NEXT_PUBLIC_EMAIL`: Your email address
- `NEXT_PUBLIC_GITHUB_URL`: GitHub profile URL
- `NEXT_PUBLIC_LINKEDIN_URL`: LinkedIn profile URL
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Site description for SEO

### Custom Build with Your Information

To build the container with your own information:

```bash
# Build with custom title
docker build -f Containerfile \
  --build-arg NEXT_PUBLIC_PROFESSIONAL_TITLE="Principal Solutions Architect" \
  --build-arg NEXT_PUBLIC_FULL_TITLE="Principal Solutions Architect | Cloud Expert | DevOps Engineer" \
  -t my-website .

# Run the container
docker run -d --name my-website-container -p 3000:3000 my-website
```

### Using Environment File

Create a `.env.docker` file:
```bash
# Personal Information (Build-time)
NEXT_PUBLIC_PROFESSIONAL_TITLE=Principal Solutions Architect
NEXT_PUBLIC_FULL_TITLE=Principal Solutions Architect | Cloud Expert | DevOps Engineer
NEXT_PUBLIC_NAME=Your Name
NEXT_PUBLIC_TAGLINE=Your Tagline
NEXT_PUBLIC_EMAIL=your.email@example.com
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/yourusername
NEXT_PUBLIC_SITE_DESCRIPTION=Your site description

# Contact Form Configuration (Build-time for captcha site key)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

For runtime environment variables (SMTP and captcha secret), create a `.env.runtime` file:
```bash
# SMTP Configuration (Runtime)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_TO=your-email@gmail.com
SMTP_TLS=true

# Captcha Configuration (Runtime)
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key
```

Then build with build-time variables and run with runtime variables:
```bash
# Build with build-time environment variables
docker build -f Containerfile --env-file .env.docker -t my-website .

# Run with runtime environment variables
docker run -d \
  --name my-website-container \
  --env-file .env.runtime \
  -p 3000:3000 \
  my-website
```

### Contact Form Setup

The contact form requires additional configuration:

1. **HCaptcha Setup**:
   - Sign up at [hCaptcha](https://www.hcaptcha.com/)
   - Get your site key and secret key
   - Add them to your environment files

2. **SMTP Configuration**:
   - Use your email provider's SMTP settings
   - For Gmail, you'll need an App Password (not your regular password)
   - Enable 2FA and generate an App Password in your Google Account settings

3. **Environment Variables**:
   - `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`: Public key for captcha (build-time)
   - `HCAPTCHA_SECRET_KEY`: Secret key for captcha verification (runtime)
   - `SMTP_*`: SMTP server configuration (runtime)
