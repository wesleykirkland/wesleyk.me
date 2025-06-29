# Overtracking Analytics Implementation

## Overview

This document outlines the comprehensive Overtracking analytics implementation across all public pages of the wesleyk.me website, following the official Overtracking documentation.

## 🎯 Implementation Features

### ✅ **Complete Page Coverage:**

- **Homepage** - Landing page with recent posts tracking
- **About Page** - Profile page with user engagement tracking
- **Contact Page** - Form page with interaction tracking
- **Blog Index** - Blog listing with content metrics
- **Individual Blog Posts** - Detailed post analytics
- **Tag Pages** - Tag-based content discovery tracking
- **Contact Form** - Form submission success/failure tracking

### ✅ **Advanced Tracking Capabilities:**

- **Automatic page view tracking** on all public pages
- **Custom event tracking** for user interactions
- **Form submission tracking** with success/error states
- **Content engagement metrics** (word count, tags, etc.)
- **Navigation tracking** between pages
- **Error tracking** for debugging

## 📁 File Structure

```
src/
├── components/
│   ├── Overtracking.tsx          # Main analytics component
│   ├── PageTracker.tsx           # Page-specific tracking wrapper
│   └── ContactForm.tsx           # Enhanced with form tracking
├── hooks/
│   └── usePageTracking.ts        # Custom tracking hooks and events
└── app/
    ├── layout.tsx                # Global analytics integration
    ├── page.tsx                  # Homepage tracking
    ├── about/page.tsx            # About page tracking
    ├── contact/page.tsx          # Contact page tracking
    ├── blog/page.tsx             # Blog index tracking
    ├── [...permalink]/page.tsx   # Individual post tracking
    └── tag/[slug]/page.tsx       # Tag page tracking
```

## 🔧 Core Components

### 1. **Overtracking Component** (`src/components/Overtracking.tsx`)

**Purpose:** Main analytics script loading using Overtracking's recommended approach

**Features:**

- Loads Overtracking script with site ID in URL path
- Uses official Overtracking implementation pattern
- Handles script loading errors gracefully
- Only runs in production environment
- Provides TypeScript definitions for Overtracking API

**Implementation:**

```tsx
<Script
  src={`https://cdn.overtracking.com/t/${siteId}/`}
  strategy="afterInteractive"
  defer
/>
```

**Usage:**

```tsx
<Overtracking
  siteId={process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID}
  enabled={process.env.NODE_ENV === 'production'}
/>
```

### 2. **PageTracker Component** (`src/components/PageTracker.tsx`)

**Purpose:** Page-specific tracking wrapper for enhanced analytics

**Features:**

- Automatic page view tracking
- Custom properties for each page type
- Page categorization (landing, profile, form, blog-post, etc.)
- Content-specific metadata tracking

**Usage:**

```tsx
<PageTracker
  pageName="About"
  pageType="profile"
  customProperties={{
    section: 'about-me',
    hasProfileImage: true
  }}
/>
```

### 3. **usePageTracking Hook** (`src/hooks/usePageTracking.ts`)

**Purpose:** Custom React hook for advanced tracking functionality

**Features:**

- Automatic page view detection
- URL parameter tracking (optional)
- Custom event tracking
- Predefined tracking events for common actions
- TypeScript-safe tracking functions

**Available Events:**

- `linkClick()` - External link tracking
- `blogPostView()` - Blog post engagement
- `contactFormSubmit()` - Form submission tracking
- `searchPerformed()` - Search functionality
- `tagClicked()` - Tag navigation
- `socialLinkClick()` - Social media interactions
- `fileDownload()` - File download tracking
- `errorOccurred()` - Error tracking

## 📊 Tracking Implementation by Page

### **Homepage** (`/`)

```tsx
<PageTracker
  pageName="Home"
  pageType="landing"
  customProperties={{
    recentPostsCount: recentPosts.length,
    hasRecentPosts: recentPosts.length > 0
  }}
/>
```

**Tracked Metrics:**

- Page views and session starts
- Recent posts display count
- User engagement with hero section
- Navigation to other sections

### **About Page** (`/about`)

```tsx
<PageTracker
  pageName="About"
  pageType="profile"
  customProperties={{
    section: 'about-me',
    hasProfileImage: true
  }}
/>
```

**Tracked Metrics:**

- Profile page engagement
- Time spent reading about content
- Skills section interactions
- Professional background views

### **Contact Page** (`/contact`)

```tsx
<PageTracker
  pageName="Contact"
  pageType="form"
  customProperties={{
    formType: 'contact',
    hasContactForm: true
  }}
/>
```

**Tracked Metrics:**

- Contact page visits
- Form interaction rates
- Form submission success/failure
- Captcha completion rates

### **Blog Index** (`/blog`)

```tsx
<PageTracker
  pageName="Blog"
  pageType="blog-index"
  customProperties={{
    totalPosts: allPostsData.length,
    hasPosts: allPostsData.length > 0
  }}
/>
```

**Tracked Metrics:**

- Blog discovery and browsing
- Post listing engagement
- Tag interaction rates
- Content discovery patterns

### **Individual Blog Posts** (`/[...permalink]`)

```tsx
<PageTracker
  pageName={post.title}
  pageType="blog-post"
  customProperties={{
    postSlug: post.slug,
    postDate: post.date,
    postTags: post.tags,
    wordCount: post.content.split(' ').length,
    hasExcerpt: !!post.excerpt,
    hasFeaturedImage: !!post.featuredImage
  }}
/>
```

**Tracked Metrics:**

- Individual post engagement
- Reading time estimation
- Content depth analysis
- Tag-based content discovery
- Social sharing potential

### **Tag Pages** (`/tag/[slug]`)

```tsx
<PageTracker
  pageName={`Tag: ${tag}`}
  pageType="tag-archive"
  customProperties={{
    tag: tag,
    tagSlug: slug,
    postCount: posts.length,
    hasPosts: posts.length > 0
  }}
/>
```

**Tracked Metrics:**

- Tag-based content discovery
- Content categorization effectiveness
- User interest patterns
- Related content engagement

## 🎯 Event Tracking Examples

### **Contact Form Tracking**

```tsx
// Success tracking
trackingEvents.contactFormSubmit(true);

// Error tracking
trackingEvents.contactFormSubmit(false, 'Validation failed');

// Network error tracking
trackingEvents.contactFormSubmit(false, 'Network error');
```

### **Blog Post Engagement**

```tsx
trackingEvents.blogPostView(
  'My First Vulnerability Discovery',
  'my-first-vulnerability',
  ['security', 'research', 'mimecast']
);
```

### **Navigation Tracking**

```tsx
trackingEvents.linkClick('https://github.com/wesleykirkland', 'GitHub Profile');

trackingEvents.tagClicked('security', 'blog-post');
```

## 🔒 Privacy & Security

### **Data Collection:**

- **No personal information** collected without consent
- **Anonymous analytics** focused on content performance
- **GDPR compliant** data handling
- **Client-side only** - no server-side tracking

### **Environment Controls:**

- **Production only** - Analytics disabled in development
- **Environment variable controlled** - Easy to disable
- **Graceful degradation** - Site works without analytics
- **Error handling** - Failed analytics don't break site

## ⚙️ Configuration

### **Environment Variables:**

```bash
# Required - Your Overtracking site ID
NEXT_PUBLIC_OVERTRACKING_SITE_ID="your-site-id-here"

# Optional (defaults to production only)
NODE_ENV="production"
```

### **Script Implementation:**

Overtracking provides a simple script tag with the site ID in the URL:

```html
<script
  defer
  src="https://cdn.overtracking.com/t/NEXT_PUBLIC_OVERTRACKING_SITE_ID/"
></script>
```

Our Next.js implementation uses this pattern:

```tsx
<Script
  src={`https://cdn.overtracking.com/t/${siteId}/`}
  strategy="afterInteractive"
  defer
/>
```

### **Terraform Integration:**

```hcl
# In terraform/variables.tf
variable "overtracking_site_id" {
  description = "Overtracking analytics site ID"
  type        = string
  default     = ""
  sensitive   = true
}

# In Netlify environment variables
environment = {
  NEXT_PUBLIC_OVERTRACKING_SITE_ID = var.overtracking_site_id
}
```

## 📈 Analytics Dashboard

### **Key Metrics to Monitor:**

1. **Page Views** - Overall site traffic
2. **User Sessions** - Engagement depth
3. **Bounce Rate** - Content effectiveness
4. **Page Load Times** - Performance impact
5. **Form Conversions** - Contact form success rate
6. **Content Engagement** - Blog post performance
7. **Navigation Patterns** - User journey analysis

### **Custom Events to Track:**

1. **Contact Form Submissions** - Lead generation
2. **Blog Post Views** - Content performance
3. **Tag Interactions** - Content discovery
4. **External Link Clicks** - Referral tracking
5. **Error Occurrences** - Site reliability

## 🚀 Performance Impact

### **Optimizations:**

- **Lazy loading** - Script loads after page interaction
- **Error boundaries** - Analytics failures don't break site
- **Minimal payload** - Lightweight tracking implementation
- **Conditional loading** - Only loads in production
- **Async initialization** - Non-blocking page load

### **Bundle Size Impact:**

- **Overtracking script**: ~15KB (external CDN)
- **Custom tracking code**: ~3KB (included in bundle)
- **Total impact**: Minimal, loaded asynchronously

## 🔧 Troubleshooting

### **Common Issues:**

1. **Analytics not loading:**

   - Check `NEXT_PUBLIC_OVERTRACKING_SITE_ID` environment variable
   - Verify production environment
   - Check browser console for script loading errors

2. **Events not tracking:**

   - Ensure Overtracking script has loaded
   - Check network tab for API calls
   - Verify site ID is correct

3. **Development testing:**
   - Set `NODE_ENV=production` temporarily
   - Use browser console to check `window.overtracking`
   - Monitor network requests to Overtracking API

### **Debug Commands:**

```javascript
// Check if Overtracking is loaded
console.log(window.overtracking);

// Manual event tracking
window.overtracking?.track('Test Event', { test: true });

// Check environment
console.log(process.env.NODE_ENV);
console.log(process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID);
```

## ✅ Implementation Checklist

- ✅ **Overtracking script** loaded in layout
- ✅ **Page tracking** on all public pages
- ✅ **Event tracking** for user interactions
- ✅ **Form tracking** for contact submissions
- ✅ **Error handling** for failed analytics
- ✅ **Environment controls** for development/production
- ✅ **TypeScript definitions** for type safety
- ✅ **Performance optimization** with async loading
- ✅ **Privacy compliance** with anonymous tracking
- ✅ **Documentation** for maintenance and updates

The Overtracking analytics implementation provides comprehensive insights into user behavior while maintaining privacy and performance standards.
