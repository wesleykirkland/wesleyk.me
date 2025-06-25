# Wesley Kirkland's Personal Website

A modern, responsive personal website and blog built with Next.js, featuring security research, PowerShell automation content, and technical articles.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14+, TypeScript, and Tailwind CSS
- **Blog System**: Markdown-based blog with frontmatter support
- **Responsive Design**: Mobile-first design that works on all devices
- **SEO Optimized**: Meta tags, structured data, and performance optimized
- **Static Export**: Optimized for Netlify deployment
- **Dark Mode Support**: Automatic system preference detection with manual toggle
- **Security Research**: Dedicated section for vulnerability research and case studies
- **PowerShell Branding**: Custom branding reflecting expertise in PowerShell automation
- **Environment Variables**: Easy configuration for personal information

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: Markdown with gray-matter for frontmatter
- **Deployment**: Netlify (with Next.js runtime for API routes)
- **Icons**: Custom SVG icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Container Deployment

### Using Docker

1. Build and run with the provided script:
```bash
./docker-run.sh
```

2. Or manually:
```bash
# Build the image
docker build -f Containerfile -t wesleyk-website .

# Run the container
docker run -d --name wesleyk-website-container -p 3000:3000 wesleyk-website
```

### Using Podman

1. Build and run with the provided script:
```bash
./podman-run.sh
```

2. Or manually:
```bash
# Build the image
podman build -f Containerfile -t wesleyk-website .

# Run the container
podman run -d --name wesleyk-website-container -p 3000:3000 wesleyk-website
```

The containerized website will be available at [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

Your professional title and personal information are configured using environment variables. This makes it easy to update your title without touching the code!

**Environment Variables:**
```bash
# Professional Information
NEXT_PUBLIC_PROFESSIONAL_TITLE="Principal Solutions Architect"
NEXT_PUBLIC_FULL_TITLE="Principal Solutions Architect | PowerShell Enthusiast | Security Researcher"
NEXT_PUBLIC_NAME="Wesley Kirkland"
NEXT_PUBLIC_TAGLINE="Meme Master of Disaster"

# Contact Information
NEXT_PUBLIC_GITHUB_URL="https://github.com/wesleykirkland"
NEXT_PUBLIC_LINKEDIN_URL="https://www.linkedin.com/in/wesleykirkland/"
NEXT_PUBLIC_YOUTUBE_PLAYLIST="https://www.youtube.com/playlist?list=PL6e0QoXQoTzW_YGyfOmcqGP_wHbiAFmhW"

# Site Metadata
NEXT_PUBLIC_SITE_DESCRIPTION="Personal website and blog of Wesley Kirkland - Principal Solutions Architect specializing in PowerShell, O365, Azure, and Security Research"

# Contact Form Configuration
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="your-hcaptcha-site-key"
HCAPTCHA_SECRET_KEY="your-hcaptcha-secret-key"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="wesley@wesleyk.me"
SMTP_TO="wesley@wesleyk.me"
SMTP_TLS="true"
```

### Updating Your Title

**Local Development:**
Edit `.env.local` and change the `NEXT_PUBLIC_PROFESSIONAL_TITLE` variable:
```bash
NEXT_PUBLIC_PROFESSIONAL_TITLE="Principal Solutions Architect"
```

**Production Deployment:**
Set the environment variable in your deployment platform (Netlify, Vercel, etc.):
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment Variables
- Docker: Use `-e` flag or environment file

### Contact Form Setup

The website includes a functional contact form with the following features:
- SMTP email sending
- HCaptcha spam protection
- Form validation
- Responsive design with dark mode support

**Required Setup:**

1. **HCaptcha Configuration:**
   - Sign up at [hCaptcha](https://www.hcaptcha.com/)
   - Get your site key and secret key
   - Add them to your `.env.local` file

2. **SMTP Configuration:**
   - Configure your email provider's SMTP settings
   - For Gmail: Enable 2FA and create an App Password
   - Add SMTP settings to your `.env.local` file

**Note:** You'll need to obtain an HCaptcha API key to enable the contact form. The form will display an error message if the captcha site key is not configured.

**Important:** The contact form requires server-side functionality (API routes). This means:
- The site is no longer a static export
- Deployment requires a platform that supports Next.js API routes (like Netlify with Next.js runtime, Vercel, etc.)
- For static hosting, you would need to implement the contact form using a third-party service

### Dark Mode

The website includes a built-in dark mode toggle that:
- **Automatically detects** your system's color scheme preference on first visit
- **Remembers your choice** using localStorage across sessions
- **Provides a toggle button** in the header for manual switching
- **Works reliably** regardless of your system's current preference
- **Supports all pages** with consistent dark/light themes
- **Prevents flash** of unstyled content with inline script

The dark mode toggle appears as a sun/moon icon in the header next to the social media links. Click it to instantly switch between light and dark modes.

## 📝 Adding Blog Posts

Create a new markdown file in the `posts/` directory with frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
excerpt: "A brief description of your post"
tags: ["tag1", "tag2", "tag3"]
author: "Wesley Kirkland"
---

Your post content here...
```

## 🌐 Deployment to Netlify

1. **Connect Repository**: Connect your GitHub repository to Netlify
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
3. **Environment Variables**: Set `NODE_VERSION=18`
4. **Deploy**: Netlify will automatically build and deploy your site

Built with ❤️ by Wesley Kirkland - Meme Master of Disaster and with the help of Agentic AI as I'm not a Software Engineer by Trade
