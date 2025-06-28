# Blog Images Guide

This guide explains how to manage static assets (images, documents, etc.) for blog posts in your Next.js website.

## 📁 Directory Structure

All assets are stored within Git LFS for Git efficiency

```
public/
├── images/
│   ├── blog/
│   │   ├── 2024/
│   │   │   ├── my-first-vulnerability/
│   │   │   │   ├── hero.jpg
│   │   │   │   ├── screenshot-1.png
│   │   │   │   ├── screenshot-2.png
│   │   │   │   └── attack-diagram.svg
│   │   │   ├── powershell-environment-variables/
│   │   │   │   ├── task-scheduler.png
│   │   │   │   ├── environment-vars.png
│   │   │   │   └── powershell-output.png
│   │   │   └── another-blog-post/
│   │   │       └── image.jpg
│   │   └── 2025/
│   │       └── future-posts/
│   ├── general/
│   │   ├── circle_headshot.png
│   │   ├── profile.jpg
│   │   └── about-me.jpg
│   └── icons/
│       ├── powershell-icon.svg
│       └── social-icons/
└── documents/
    ├── case-studies/
    │   ├── markmonitor_ministry-brands_case-study_march-2021.pdf
    │   └── ministry-brands-case-study_mimecast.pdf
    └── presentations/
```

## 📝 Using Images in Blog Posts

### Method 1: Frontmatter (Recommended for Featured Images)

```markdown
---
title: "My First Vulnerability Discovery"
date: "2024-01-15"
excerpt: "How I found a critical vulnerability in Mimecast"
featuredImage: "/images/blog/2024/my-first-vulnerability/hero.jpg"
images:
  - "/images/blog/2024/my-first-vulnerability/screenshot-1.png"
  - "/images/blog/2024/my-first-vulnerability/screenshot-2.png"
tags: ["security", "vulnerability", "mimecast"]
---

# My First Vulnerability Discovery

Content here...
```

### Method 2: Relative Paths in Markdown (Auto-processed)

```markdown
# My Blog Post

Here's a screenshot of the vulnerability:

![Vulnerability Screenshot](screenshot-1.png)

The attack flow diagram:

![Attack Flow](attack-diagram.svg)
```

The system will automatically convert `screenshot-1.png` to `/images/blog/2024/my-first-vulnerability/screenshot-1.png`.

### Method 3: Absolute Paths

```markdown
![Vulnerability Screenshot](/images/blog/2024/my-first-vulnerability/screenshot-1.png)
```

## 🖼️ Image Best Practices

### File Naming

- Use kebab-case: `attack-diagram.svg`, `screenshot-1.png`
- Be descriptive: `mimecast-vulnerability-poc.png` instead of `image1.png`
- Include sequence numbers for multiple similar images: `step-1.png`, `step-2.png`

### File Formats

- **Screenshots**: PNG for crisp text, JPG for photos
- **Diagrams**: SVG for scalability, PNG as fallback
- **Photos**: JPG with appropriate compression
- **Icons**: SVG preferred, PNG for complex icons

### File Sizes

- Optimize images before adding them
- Target < 500KB for most images
- Use WebP format for better compression (modern browsers)
- Consider responsive images for large displays

### Organization

- Create a folder per blog post: `/images/blog/YYYY/post-slug/`
- Group by year to avoid overcrowding
- Use consistent naming conventions

## 🔧 Technical Implementation

The blog system includes several utilities:

### Image Path Processing

```typescript
// Automatically converts relative paths to absolute paths
getBlogImagePath("my-post-slug", "image.png");
// Returns: '/images/blog/2024/my-post-slug/image.png'
```

### Markdown Processing

The system automatically processes markdown content to convert relative image paths to absolute paths based on the blog post slug.

## 📋 Workflow for Adding Images

1. **Create the blog post folder**:

   ```bash
   mkdir -p public/images/blog/2024/your-post-slug
   ```

2. **Add your images**:

   ```bash
   cp ~/Downloads/screenshot.png public/images/blog/2024/your-post-slug/
   ```

3. **Reference in markdown**:

   ```markdown
   ![Description](screenshot.png)
   ```

   or

   ```markdown
   ![Description](/images/blog/2024/your-post-slug/screenshot.png)
   ```

4. **Add featured image to frontmatter** (optional):
   ```yaml
   featuredImage: "/images/blog/2024/your-post-slug/hero.jpg"
   ```

## 🌐 CDN and Performance Considerations

For production, consider:

1. **Image Optimization**: Use Next.js Image component for automatic optimization
2. **CDN**: Move images to a CDN for better performance
3. **Lazy Loading**: Images are lazy-loaded by default with Next.js Image
4. **Responsive Images**: Serve different sizes based on device

## 📱 Responsive Images Example

```jsx
import Image from "next/image";

<Image
  src="/images/blog/2024/my-post/screenshot.png"
  alt="Vulnerability Screenshot"
  width={800}
  height={600}
  className="rounded-lg shadow-lg"
  priority={false} // Set to true for above-the-fold images
/>;
```

## 🔒 Security Considerations

- Never commit sensitive screenshots with real data
- Blur or redact personal information in screenshots
- Use placeholder data in examples
- Consider watermarking for proprietary content

## 📊 Current Assets

Your current static assets have been organized as follows:

- `circle_headshot.png` → `public/images/general/circle_headshot.png`
- `powershell-icon.svg` → `public/images/icons/powershell-icon.svg`
- PDF case studies remain in `public/` for direct linking

The blog system is now ready to handle images efficiently with automatic path processing and organization.
