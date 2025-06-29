# Cat API Documentation

## Overview

The `/api/cat` endpoint serves random cat images from the `/public/cats` directory with multiple response formats and caching for optimal performance.

## 🐱 API Endpoints

### `GET /api/cat`

Returns a random cat image with various response format options.

#### Query Parameters

| Parameter | Type    | Description                                  | Default |
| --------- | ------- | -------------------------------------------- | ------- |
| `format`  | string  | Response format: `json`, `redirect`, `image` | `json`  |
| `info`    | boolean | Include additional file information          | `false` |

#### Response Formats

### 1. **JSON Format** (Default)

```bash
GET /api/cat
GET /api/cat?format=json
```

**Response:**

```json
{
  "success": true,
  "image": "/cats/fluffy-cat.jpg",
  "filename": "fluffy-cat.jpg",
  "url": "https://wesleyk.me/cats/fluffy-cat.jpg",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. **JSON with Info**

```bash
GET /api/cat?info=true
```

**Response:**

```json
{
  "success": true,
  "image": "/cats/fluffy-cat.jpg",
  "filename": "fluffy-cat.jpg",
  "url": "https://wesleyk.me/cats/fluffy-cat.jpg",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "fileSize": 245760,
  "lastModified": "2024-01-10T15:20:00.000Z",
  "totalCats": 12,
  "supportedFormats": [".jpg", ".jpeg", ".png", ".gif", ".webp"]
}
```

### 3. **Direct Redirect**

```bash
GET /api/cat?format=redirect
```

**Response:** HTTP 302 redirect to the image file

### 4. **Image File**

```bash
GET /api/cat?format=image
```

**Response:** Raw image file with appropriate `Content-Type` header

## 🔧 Implementation Details

### Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

### Caching Strategy

- **File list cache**: 5 minutes (reduces filesystem reads)
- **Image responses**: 1 hour cache header
- **JSON responses**: No cache (ensures randomness)

### Error Handling

#### No Images Found (404)

```json
{
  "success": false,
  "error": "No cat images found",
  "message": "Please add cat images to the /public/cats directory"
}
```

#### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to fetch random cat image"
}
```

#### Method Not Allowed (405)

```json
{
  "error": "Method not allowed. Use GET to fetch a random cat."
}
```

## 📁 Directory Structure

```
public/
└── cats/
    ├── README.md
    ├── fluffy-cat.jpg
    ├── sleepy-kitten.png
    ├── playful-cat.gif
    └── grumpy-cat.webp
```

## 🎯 Usage Examples

### JavaScript/TypeScript

```typescript
// Basic usage
const response = await fetch('/api/cat');
const catData = await response.json();
console.log(catData.image); // "/cats/random-cat.jpg"

// With additional info
const infoResponse = await fetch('/api/cat?info=true');
const catInfo = await infoResponse.json();
console.log(`File size: ${catInfo.fileSize} bytes`);

// Direct image URL
const imageUrl = '/api/cat?format=redirect';
```

### React Component

```tsx
import { useState, useEffect } from 'react';

function RandomCatImage() {
  const [catUrl, setCatUrl] = useState<string>('');

  const fetchRandomCat = async () => {
    const response = await fetch('/api/cat');
    const data = await response.json();
    if (data.success) {
      setCatUrl(data.image);
    }
  };

  useEffect(() => {
    fetchRandomCat();
  }, []);

  return (
    <div>
      <img src={catUrl} alt="Random cat" />
      <button onClick={fetchRandomCat}>New Cat</button>
    </div>
  );
}
```

### HTML

```html
<!-- Direct image embed -->
<img src="/api/cat?format=image" alt="Random cat" />

<!-- With JavaScript -->
<script>
  fetch('/api/cat')
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('cat-img').src = data.image;
    });
</script>
```

### cURL Examples

```bash
# Get JSON response
curl https://wesleyk.me/api/cat

# Get detailed info
curl "https://wesleyk.me/api/cat?info=true"

# Download image directly
curl -o random-cat.jpg "https://wesleyk.me/api/cat?format=image"

# Follow redirect to image
curl -L "https://wesleyk.me/api/cat?format=redirect"
```

## 🚀 Performance Features

### Caching

- **In-memory file list caching** reduces filesystem operations
- **HTTP cache headers** for optimal browser/CDN caching
- **Conditional caching** (images cached, JSON not cached)

### Error Resilience

- **Graceful degradation** when no images found
- **Comprehensive error handling** with helpful messages
- **Filesystem error recovery**

### Scalability

- **Efficient random selection** algorithm
- **Minimal memory footprint**
- **Fast response times** with caching

## 🔒 Security Considerations

### Path Safety

- **No directory traversal** - only reads from `/public/cats`
- **File extension validation** - only serves supported image formats
- **Sanitized file paths** - prevents malicious file access

### Content Type Validation

- **MIME type detection** based on file extension
- **Proper HTTP headers** for security and caching
- **Error message sanitization**

## 📊 Monitoring & Analytics

### Response Headers

```
X-Cat-Filename: fluffy-cat.jpg
X-Cat-Count: 12
Cache-Control: public, max-age=3600
Content-Type: image/jpeg
```

### Logging

- **File access errors** logged to console
- **Cache hit/miss** information
- **Performance metrics** available

## 🛠️ Development & Testing

### Adding Cat Images

1. Place images in `/public/cats/` directory
2. Use supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
3. Images are automatically detected (cache refreshes every 5 minutes)

### Testing the API

```bash
# Test basic functionality
curl http://localhost:3000/api/cat

# Test with no images (should return 404)
# Remove all images from /public/cats and test

# Test different formats
curl "http://localhost:3000/api/cat?format=image"
curl "http://localhost:3000/api/cat?format=redirect"
curl "http://localhost:3000/api/cat?info=true"
```

### Local Development

```bash
# Start development server
npm run dev

# Test API endpoint
open http://localhost:3000/api/cat
```

## 🎨 Integration Examples

### Blog Post Enhancement

```tsx
// Add random cats to blog posts
<RandomCat showInfo={true} className="my-6" />
```

### Easter Egg

```tsx
// Auto-refreshing cat for fun
<RandomCat autoRefresh={30} />
```

### API Showcase

```tsx
// Demonstrate API capabilities
<RandomCat showInfo={true} autoRefresh={10} />
```

## 🐾 Fun Features

### Auto-Refresh

The `RandomCat` component supports auto-refresh:

```tsx
<RandomCat autoRefresh={30} /> // New cat every 30 seconds
```

### Detailed Information

Show file metadata and statistics:

```tsx
<RandomCat showInfo={true} />
```

### Direct Integration

Use the API directly in any application:

```javascript
// Perfect for Discord bots, Slack integrations, etc.
const catResponse = await fetch('https://wesleyk.me/api/cat');
const catData = await catResponse.json();
// Send catData.url to chat
```

The Cat API provides a fun, performant way to serve random cat images with multiple integration options and comprehensive error handling! 🐱
