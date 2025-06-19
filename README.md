# Wesley Kirkland's Personal Website

A modern, responsive personal website and blog built with Next.js, featuring security research, PowerShell automation content, and technical articles.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14+, TypeScript, and Tailwind CSS
- **Blog System**: Markdown-based blog with frontmatter support
- **Responsive Design**: Mobile-first design that works on all devices
- **SEO Optimized**: Meta tags, structured data, and performance optimized
- **Static Export**: Optimized for Netlify deployment
- **Security Research**: Dedicated section for vulnerability research and case studies
- **PowerShell Branding**: Custom branding reflecting expertise in PowerShell automation

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: Markdown with gray-matter for frontmatter
- **Deployment**: Netlify
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

Built with ❤️ by Wesley Kirkland - Meme Master of Disaster
