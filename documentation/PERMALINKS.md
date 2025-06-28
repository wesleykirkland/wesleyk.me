# Permalink System Documentation

This document explains the flexible permalink system implemented for maintaining WordPress-style URLs and custom permalinks.

## 🎯 Overview

The permalink system supports:

- **WordPress-style URLs**: `YYYY/MM/DD/post-slug/`
- **Custom permalinks**: Any custom URL structure defined in frontmatter
- **Backward compatibility**: Maintains existing URLs from WordPress migration
- **SEO preservation**: Keeps existing search engine rankings

## 📝 Usage in Blog Posts

### Method 1: Custom Permalink (Recommended for WordPress Migration)

```yaml
---
title: 'My Blog Post'
date: '2020-01-10'
permalink: '2020/01/10/my-first-vulnerability-mimecast-sender-address-verification'
---
```

**Result**: `/blog/2020/01/10/my-first-vulnerability-mimecast-sender-address-verification/`

### Method 2: WordPress URL (Alternative)

```yaml
---
title: 'My Blog Post'
date: '2020-01-10'
wordpressUrl: 'custom/path/to/post'
---
```

**Result**: `/blog/custom/path/to/post/`

### Method 3: Auto-generated (Default)

```yaml
---
title: 'My Blog Post'
date: '2020-01-10'
# No permalink specified
---
```

**Result**: `/blog/2020/01/10/my-blog-post/` (auto-generated from date + slug)

## 🔧 Technical Implementation

### Core Functions

```typescript
// Generate WordPress-style permalink from date and slug
generateWordPressPermalink(date: string, slug: string): string

// Get the final permalink for a post (checks custom, WordPress, then auto-generates)
getPostPermalink(post: BlogPostMetadata): string

// Get the full URL for a post
getPostUrl(post: BlogPostMetadata): string

// Find a post by its permalink (for routing)
getPostByPermalink(permalink: string): BlogPostMetadata | null
```

### Routing

The system uses a catch-all route: `/blog/[...permalink]/page.tsx`

This handles:

- `/blog/2020/01/10/my-post/` ✅
- `/blog/custom/path/` ✅
- `/blog/simple-slug/` ✅
- `/blog/category/subcategory/post/` ✅

### Static Generation

All permalinks are pre-generated at build time for optimal performance:

```typescript
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    permalink: getPostPermalink(post).split('/')
  }));
}
```

## 📋 Migration from WordPress

### Step 1: Identify Existing URLs

For each WordPress post, note the existing URL structure:

- `https://wesleyk.me/2020/01/10/my-first-vulnerability/`
- `https://wesleyk.me/category/security/post-name/`
- `https://wesleyk.me/custom-page/`

### Step 2: Add Permalinks to Frontmatter

```yaml
---
title: 'My first vulnerability – Mimecast Sender Address verification'
date: '2020-01-10'
permalink: '2020/01/10/my-first-vulnerability-mimecast-sender-address-verification'
---
```

### Step 3: Test URLs

The system will automatically:

1. Generate static routes for all permalinks
2. Handle requests to the old URLs
3. Serve the correct content
4. Maintain SEO rankings

## 🌐 URL Examples

### WordPress Migration Examples

| WordPress URL                | Frontmatter                             | Next.js URL                       |
| ---------------------------- | --------------------------------------- | --------------------------------- |
| `/2020/01/10/vulnerability/` | `permalink: "2020/01/10/vulnerability"` | `/blog/2020/01/10/vulnerability/` |
| `/category/security/post/`   | `permalink: "category/security/post"`   | `/blog/category/security/post/`   |
| `/custom-page/`              | `permalink: "custom-page"`              | `/blog/custom-page/`              |

### Auto-generated Examples

| Date         | Slug                | Generated Permalink            |
| ------------ | ------------------- | ------------------------------ |
| `2024-01-15` | `my-new-post`       | `2024/01/15/my-new-post`       |
| `2023-12-25` | `christmas-special` | `2023/12/25/christmas-special` |

## 🔍 SEO Considerations

### Canonical URLs

Each post automatically gets proper canonical URLs:

```html
<link rel="canonical" href="https://wesleyk.me/blog/2020/01/10/my-post/" />
```

### Open Graph

Proper Open Graph tags are generated:

```html
<meta property="og:url" content="https://wesleyk.me/blog/2020/01/10/my-post/" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2020-01-10" />
```

### Structured Data

Article structured data is included for better search engine understanding.

## 🚀 Performance

### Static Generation

- All permalinks are pre-generated at build time
- No runtime permalink resolution
- Optimal Core Web Vitals scores

### Caching

- Static files are cached indefinitely
- CDN-friendly URLs
- No database queries needed

## 🔧 Advanced Configuration

### Custom URL Patterns

You can create any URL pattern:

```yaml
# Category-based
permalink: "security/vulnerabilities/mimecast-issue"

# Date-based with custom format
permalink: "articles/2020/january/vulnerability-discovery"

# Hierarchical
permalink: "research/email-security/case-studies/mimecast"

# Simple
permalink: "mimecast-vulnerability"
```

### Redirects (Future Enhancement)

For additional SEO protection, you could add redirects:

```yaml
---
title: 'My Post'
permalink: '2020/01/10/my-post'
redirects:
  - 'old-url-1'
  - 'old-url-2'
---
```

## 📊 Current Implementation Status

✅ **Implemented:**

- Custom permalink support in frontmatter
- WordPress-style auto-generation
- Catch-all routing
- Static generation
- SEO metadata
- Backward compatibility

🔄 **Future Enhancements:**

- Redirect handling for changed URLs
- Category-based permalinks
- Automatic slug generation improvements
- URL validation and conflict detection

## 🧪 Testing

### Test Your Permalinks

1. **Add permalink to frontmatter**:

   ```yaml
   permalink: '2020/01/10/test-post'
   ```

2. **Build and test**:

   ```bash
   npm run build
   npm run start
   ```

3. **Visit URL**:
   ```
   http://localhost:3000/blog/2020/01/10/test-post/
   ```

### Verify SEO

Check that:

- ✅ URL matches expected permalink
- ✅ Canonical URL is correct
- ✅ Open Graph tags are present
- ✅ Page loads without 404 errors

## 📝 Best Practices

1. **Keep URLs consistent**: Use the same pattern for similar content
2. **Avoid special characters**: Stick to letters, numbers, hyphens, and slashes
3. **Use meaningful paths**: URLs should indicate content hierarchy
4. **Test before deployment**: Verify all permalinks work correctly
5. **Document changes**: Keep track of URL changes for redirect planning

The permalink system is now ready to handle your WordPress migration while maintaining SEO value and providing flexibility for future content organization!
