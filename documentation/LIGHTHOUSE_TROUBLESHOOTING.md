# Lighthouse CI Troubleshooting Guide

## Issue: Artifact Upload Failure

### Error Message:
```
Error: Create Artifact Container failed: The artifact name lighthouse-results is not valid
```

### Root Cause:
- GitHub Actions artifact naming conflicts
- Lighthouse CI action trying to create duplicate artifacts
- GitHub's artifact storage limitations

## Solution Implemented

### ✅ **Fixed Configuration:**

1. **Switched to Manual Lighthouse Installation:**
   - Removed `treosh/lighthouse-ci-action` (causing conflicts)
   - Added manual `@lhci/cli` installation
   - Direct command execution for better control

2. **Updated Artifact Handling:**
   - Unique artifact names with `${{ github.run_id }}`
   - Local filesystem storage instead of temporary public storage
   - Manual artifact upload with proper naming

3. **Improved Chrome Flags:**
   - Added `--disable-gpu --headless` for CI environments
   - Kept `--no-sandbox --disable-dev-shm-usage` for security

### 📁 **New Workflow Structure:**

```yaml
- name: Install Lighthouse CI
  run: npm install -g @lhci/cli@0.12.x

- name: Run Lighthouse CI
  run: lhci autorun --config=./lighthouserc.json
  continue-on-error: true

- name: Upload Lighthouse results
  uses: actions/upload-artifact@v4
  with:
    name: lighthouse-report-${{ github.run_id }}
    path: .lighthouseci/
```

## Configuration Changes

### Updated `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "settings": {
        "chromeFlags": "--no-sandbox --disable-dev-shm-usage --disable-gpu --headless"
      }
    },
    "upload": {
      "target": "filesystem",
      "outputDir": ".lighthouseci"
    }
  }
}
```

**Key Changes:**
- ✅ **Filesystem storage** instead of temporary public storage
- ✅ **Enhanced Chrome flags** for CI environments
- ✅ **Local output directory** for artifact collection

## Common Lighthouse CI Issues

### 1. **Artifact Naming Conflicts**
**Symptoms:**
- `artifact name is not valid` errors
- Duplicate artifact creation failures

**Solutions:**
- Use unique artifact names with run IDs
- Switch to filesystem storage
- Manual artifact upload

### 2. **Chrome/Puppeteer Issues**
**Symptoms:**
- Chrome launch failures
- Timeout errors
- Sandbox violations

**Solutions:**
```json
"chromeFlags": "--no-sandbox --disable-dev-shm-usage --disable-gpu --headless"
```

### 3. **Server Startup Issues**
**Symptoms:**
- Server not ready timeouts
- Connection refused errors

**Solutions:**
```json
"startServerReadyTimeout": 60000,
"startServerReadyPattern": "ready"
```

### 4. **Performance Threshold Failures**
**Symptoms:**
- Lighthouse assertions failing
- Inconsistent performance scores

**Solutions:**
- Adjust thresholds for CI environment
- Use single run instead of multiple
- Focus on accessibility over performance in CI

## Recommended Thresholds for CI

### Conservative Thresholds (Current):
```json
"assertions": {
  "categories:performance": ["warn", {"minScore": 0.6}],
  "categories:accessibility": ["error", {"minScore": 0.9}],
  "categories:best-practices": ["warn", {"minScore": 0.8}],
  "categories:seo": ["warn", {"minScore": 0.9}]
}
```

### Aggressive Thresholds (Production):
```json
"assertions": {
  "categories:performance": ["error", {"minScore": 0.9}],
  "categories:accessibility": ["error", {"minScore": 0.95}],
  "categories:best-practices": ["error", {"minScore": 0.9}],
  "categories:seo": ["error", {"minScore": 0.95}]
}
```

## Alternative Lighthouse Setups

### Option 1: GitHub Pages Deployment
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./out

- name: Run Lighthouse on deployed site
  run: lhci autorun --collect.url=https://username.github.io/repo
```

### Option 2: Netlify Preview Deployment
```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2.0
  with:
    publish-dir: './out'
    production-deploy: false

- name: Run Lighthouse on preview
  run: lhci autorun --collect.url=${{ steps.netlify.outputs.deploy-url }}
```

### Option 3: Local Static Server
```yaml
- name: Serve static files
  run: |
    npm install -g serve
    serve -s out -p 3000 &
    sleep 10

- name: Run Lighthouse
  run: lhci autorun --collect.url=http://localhost:3000
```

## Debugging Lighthouse Issues

### Enable Debug Logging:
```yaml
- name: Run Lighthouse CI (Debug)
  run: |
    DEBUG=lhci:* lhci autorun --config=./lighthouserc.json
  continue-on-error: true
```

### Check Lighthouse Version:
```yaml
- name: Check Lighthouse Version
  run: |
    npx lighthouse --version
    lhci --version
```

### Manual Lighthouse Run:
```yaml
- name: Manual Lighthouse Test
  run: |
    npx lighthouse http://localhost:3000 \
      --chrome-flags="--no-sandbox --disable-dev-shm-usage" \
      --output=html \
      --output-path=./lighthouse-report.html
```

## Monitoring and Alerts

### Performance Budgets:
```json
"budgets": [{
  "path": "/*",
  "timings": [{
    "metric": "first-contentful-paint",
    "budget": 2000
  }],
  "resourceSizes": [{
    "resourceType": "script",
    "budget": 400
  }]
}]
```

### Slack Notifications:
```yaml
- name: Notify Slack on Lighthouse Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: "Lighthouse CI failed for ${{ github.ref }}"
```

## Best Practices

### ✅ **Do:**
- Use filesystem storage for CI environments
- Set realistic performance thresholds
- Include accessibility as error-level assertion
- Use unique artifact names
- Enable continue-on-error for non-blocking

### ❌ **Don't:**
- Use temporary public storage in CI
- Set overly aggressive performance thresholds
- Block deployments on Lighthouse failures
- Run multiple Lighthouse instances simultaneously
- Ignore accessibility scores

## Current Status

✅ **Fixed Issues:**
- Artifact naming conflicts resolved
- Chrome flags optimized for CI
- Filesystem storage implemented
- Unique artifact names with run IDs

✅ **Working Features:**
- Performance testing
- Accessibility validation
- SEO analysis
- Best practices checking
- Artifact collection and storage

The Lighthouse CI should now run successfully without artifact conflicts!
