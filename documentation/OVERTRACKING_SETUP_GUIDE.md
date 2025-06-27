# Overtracking Analytics Setup Guide

## 🎯 Quick Setup

Your website now has Overtracking analytics implemented across all public pages using their official recommended approach.

### ✅ **What's Implemented:**

**Script Loading:**
```tsx
// Uses Overtracking's recommended pattern
<Script
  src={`https://cdn.overtracking.com/t/${siteId}/`}
  strategy="afterInteractive"
  defer
/>
```

**Page Tracking:**
- ✅ **Homepage** - Landing page metrics
- ✅ **About Page** - Profile engagement
- ✅ **Contact Page** - Form interactions
- ✅ **Blog Index** - Content discovery
- ✅ **Individual Posts** - Detailed analytics
- ✅ **Tag Pages** - Content categorization

**Event Tracking:**
- ✅ **Contact form** submissions (success/failure)
- ✅ **Blog post** engagement metrics
- ✅ **Navigation** patterns
- ✅ **Error** tracking

## 🔧 Setup Steps

### 1. **Get Your Overtracking Site ID**
1. Sign up at [Overtracking](https://overtracking.com)
2. Create a new site/project
3. Copy your site ID

### 2. **Set Environment Variable**
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_OVERTRACKING_SITE_ID="your-actual-site-id-here"
```

### 3. **Deploy to Production**
The analytics only run in production mode (`NODE_ENV=production`).

### 4. **Verify Implementation**
After deployment, check:
- Browser Network tab for requests to `cdn.overtracking.com`
- Console logs showing "Overtracking: Script loaded successfully"
- Overtracking dashboard for incoming data

## 📊 Analytics Data Collected

### **Automatic Page Views:**
```javascript
// Example data sent for each page
{
  path: "/about",
  url: "https://wesleyk.me/about",
  title: "Get-AboutMe - Wesley Kirkland",
  referrer: "https://google.com",
  timestamp: "2024-01-15T10:30:00.000Z",
  pageType: "profile",
  pageName: "About",
  section: "about-me",
  hasProfileImage: true
}
```

### **Custom Events:**
```javascript
// Contact form submission
trackingEvents.contactFormSubmit(true);

// Blog post view
trackingEvents.blogPostView(
  "My Security Research",
  "security-research-post",
  ["security", "research"]
);

// Navigation
trackingEvents.linkClick("https://github.com/wesleykirkland", "GitHub");
```

## 🔒 Privacy & Performance

### **Privacy Features:**
- ✅ **Anonymous tracking** - No personal data
- ✅ **Production only** - Disabled in development
- ✅ **Graceful degradation** - Site works without analytics
- ✅ **No cookies** - Respects user privacy

### **Performance:**
- ✅ **Async loading** - Non-blocking page load
- ✅ **CDN delivery** - Fast script loading
- ✅ **Minimal impact** - ~3KB additional code
- ✅ **Error handling** - Analytics failures don't break site

## 🎯 Key Metrics to Monitor

### **Content Performance:**
1. **Page Views** - Which pages are most popular
2. **Blog Post Engagement** - Which posts resonate
3. **Tag Interactions** - Content discovery patterns
4. **Time on Page** - Content effectiveness

### **User Behavior:**
1. **Navigation Patterns** - User journey analysis
2. **Contact Form Conversions** - Lead generation
3. **Bounce Rate** - Content relevance
4. **Return Visits** - User retention

### **Technical Metrics:**
1. **Page Load Times** - Performance monitoring
2. **Error Rates** - Site reliability
3. **Device Types** - User demographics
4. **Traffic Sources** - Marketing effectiveness

## 🛠️ Customization Options

### **Add Custom Events:**
```tsx
import { trackingEvents } from '@/hooks/usePageTracking';

// Track custom interactions
trackingEvents.track('Custom Event', {
  category: 'engagement',
  action: 'button_click',
  label: 'hero_cta'
});
```

### **Page-Specific Properties:**
```tsx
<PageTracker 
  pageName="Custom Page"
  pageType="special"
  customProperties={{
    feature: 'new-feature',
    experiment: 'variant-a'
  }}
/>
```

### **Conditional Tracking:**
```tsx
// Only track in specific conditions
<PageTracker 
  enabled={user.hasConsented && process.env.NODE_ENV === 'production'}
  pageName="Sensitive Page"
/>
```

## 🔧 Troubleshooting

### **Analytics Not Working:**

1. **Check Environment Variable:**
```bash
echo $NEXT_PUBLIC_OVERTRACKING_SITE_ID
```

2. **Verify Production Mode:**
```bash
echo $NODE_ENV
# Should be "production"
```

3. **Check Browser Console:**
```javascript
// Should see these logs
"Overtracking: Script loaded successfully for site: your-site-id"
"Overtracking: Page view tracked"
```

4. **Check Network Tab:**
```
// Should see requests to:
https://cdn.overtracking.com/t/your-site-id/
```

### **Common Issues:**

**Script Not Loading:**
- Verify site ID is correct
- Check for ad blockers
- Ensure production environment

**Events Not Tracking:**
- Check if script loaded successfully
- Verify Overtracking object exists: `window.overtracking`
- Check console for errors

**Development Testing:**
```bash
# Temporarily enable in development
NODE_ENV=production npm run dev
```

## 📈 Next Steps

### **Immediate:**
1. ✅ Set `NEXT_PUBLIC_OVERTRACKING_SITE_ID` environment variable
2. ✅ Deploy to production
3. ✅ Verify data collection in Overtracking dashboard

### **Optimization:**
1. **Monitor key metrics** for 1-2 weeks
2. **Identify top-performing content**
3. **Optimize low-performing pages**
4. **A/B test improvements**

### **Advanced:**
1. **Set up conversion goals** in Overtracking
2. **Create custom dashboards** for key metrics
3. **Implement advanced event tracking** for specific features
4. **Set up alerts** for important metrics

## 📋 Implementation Checklist

- ✅ **Overtracking component** created and integrated
- ✅ **Page tracking** implemented on all public pages
- ✅ **Event tracking** for user interactions
- ✅ **Contact form** success/failure tracking
- ✅ **Environment variable** configuration
- ✅ **Production-only** execution
- ✅ **Error handling** and graceful degradation
- ✅ **TypeScript definitions** for type safety
- ✅ **Unit tests** for component functionality
- ✅ **Documentation** for maintenance

Your Overtracking analytics implementation is complete and ready for production! 🚀
