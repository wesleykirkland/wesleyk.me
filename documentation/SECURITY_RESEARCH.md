# Security Research Integration

This guide explains how to add security research metadata to blog posts so they automatically appear on the Security Research page.

## 📋 Overview

The Security Research page (`/security-research`) now dynamically loads content from blog posts instead of using hardcoded data. Posts are automatically included if they:

1. Have `securityResearch` metadata in their frontmatter, OR
2. Have tags that include: `Security`, `Vulnerability`, `CVE`, or `Research`

## 🏷️ Security Research Metadata

Add the following optional metadata to your blog post frontmatter:

```yaml
---
title: 'Your Security Research Post'
date: '2024-01-15'
excerpt: 'Brief description of your research'
tags: ['Security', 'Vulnerability', 'Research']
author: 'Wesley Kirkland'
securityResearch:
  severity: 'High' # Low, Medium, High, Critical
  status: 'Disclosed' # Disclosed, In Progress, Under Review, Fixed
  cve: 'CVE-2024-1234' # Optional CVE identifier
  vendor: 'Company Name' # Vendor/organization affected
  disclosureDate: '2024-01-15' # Date of disclosure
---
```

## 📝 Field Descriptions

### Required Fields (from standard blog metadata)

- `title`: The title of your research/case study
- `date`: Publication date
- `excerpt`: Brief description shown on the security research page
- `tags`: Include security-related tags to ensure the post appears

### Optional Security Research Fields

- `severity`: Severity level of the vulnerability

  - `Low`: Minor security issues
  - `Medium`: Moderate impact vulnerabilities
  - `High`: Significant security vulnerabilities
  - `Critical`: Severe vulnerabilities with major impact

- `status`: Current status of the research/disclosure

  - `Disclosed`: Publicly disclosed
  - `In Progress`: Research ongoing
  - `Under Review`: Under vendor review
  - `Fixed`: Vulnerability has been patched

- `cve`: CVE identifier if assigned
- `vendor`: Name of the affected vendor/organization
- `disclosureDate`: Date when the vulnerability was disclosed

## 🎨 Automatic Styling

The Security Research page automatically applies appropriate styling based on metadata:

### Severity Colors

- **Critical/High**: Red background with red text
- **Medium**: Yellow background with yellow text
- **Low**: Green background with green text

### Status Colors

- **Disclosed/Fixed**: Green text
- **In Progress/Under Review**: Yellow text
- **Other**: Gray text

## 📄 Example Blog Post

```markdown
---
title: 'Critical Authentication Bypass in Example App'
date: '2024-01-15'
excerpt: 'Discovered a critical authentication bypass vulnerability that allows unauthorized access to user accounts.'
tags: ['Security', 'Vulnerability', 'Authentication', 'Web Security']
author: 'Wesley Kirkland'
securityResearch:
  severity: 'Critical'
  status: 'Fixed'
  cve: 'CVE-2024-1234'
  vendor: 'Example Corp'
  disclosureDate: '2024-01-10'
---

# Critical Authentication Bypass in Example App

## Summary

During a security assessment of Example App, I discovered a critical authentication bypass vulnerability...

## Technical Details

The vulnerability exists in the authentication middleware...

## Timeline

- **2024-01-01**: Vulnerability discovered
- **2024-01-02**: Initial report to vendor
- **2024-01-10**: Vendor confirms and patches
- **2024-01-15**: Public disclosure

## Recommendations

1. Implement proper input validation
2. Use secure authentication frameworks
3. Regular security assessments
```

## 🔄 Fallback Behavior

If a post doesn't have explicit `securityResearch` metadata but has security-related tags, the system will:

1. **Severity**: Default to "Low" unless tags include "Critical", "High", or "Medium"
2. **Status**: Default to "Disclosed"
3. **Other fields**: Will be empty

## 🚀 Benefits

1. **Dynamic Content**: No need to manually update the security research page
2. **Consistent Formatting**: Automatic styling based on metadata
3. **SEO Friendly**: Each post has its own URL and metadata
4. **Flexible**: Works with or without explicit security metadata
5. **Maintainable**: Single source of truth for research content

## 📁 File Organization

Security research posts should follow the same organization as regular blog posts:

```
posts/
├── vulnerability-discovery-example-app.md
├── security-assessment-findings.md
└── responsible-disclosure-process.md

public/images/blog/
├── 2024/
│   ├── vulnerability-discovery-example-app/
│   │   ├── screenshot-1.png
│   │   └── proof-of-concept.png
│   └── security-assessment-findings/
│       └── network-diagram.svg
```

## 🔗 Integration

The security research posts automatically integrate with:

- **Blog listing pages**: Appear in regular blog feeds
- **Tag pages**: Filterable by security tags
- **Search**: Searchable with other blog content
- **RSS feeds**: Included in site feeds
- **Permalinks**: Support WordPress-style URLs for migration

This integration ensures your security research is discoverable through multiple channels while maintaining a dedicated showcase on the Security Research page.
