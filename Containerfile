# Use the official Node.js 18 Alpine image as base
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set default environment variables for build
ENV NEXT_PUBLIC_PROFESSIONAL_TITLE="Principal Solutions Architect"
ENV NEXT_PUBLIC_FULL_TITLE="Principal Solutions Architect | PowerShell Enthusiast | Security Researcher"
ENV NEXT_PUBLIC_NAME="Wesley Kirkland"
ENV NEXT_PUBLIC_TAGLINE="Meme Master of Disaster"
ENV NEXT_PUBLIC_EMAIL="wesley@wesleyk.me"
ENV NEXT_PUBLIC_GITHUB_URL="https://github.com/wesleykirkland"
ENV NEXT_PUBLIC_LINKEDIN_URL="https://www.linkedin.com/in/wesleykirkland/"
ENV NEXT_PUBLIC_SITE_DESCRIPTION="Personal website and blog of Wesley Kirkland - Principal Solutions Architect specializing in PowerShell, O365, Azure, and Security Research"

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/out ./out

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Since we're using static export, we'll serve the static files with a simple HTTP server
# Install serve globally in the runner stage
USER root
RUN npm install -g serve
USER nextjs

# Serve the static files from the out directory
CMD ["serve", "-s", "out", "-l", "3000"]
