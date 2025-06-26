# Security Policy

## Automated Security Scanning

This repository uses comprehensive automated security scanning on all non-main branches:

### 🔒 Security Tools Implemented

| Tool | Purpose | Trigger |
|------|---------|---------|
| **Snyk** | Vulnerability scanning for dependencies and IaC | Every push/PR |
| **CodeQL** | Static application security testing (SAST) | GitHub default setup |
| **Semgrep** | Security rule engine for code patterns | Every push/PR |
| **Trivy** | Vulnerability scanner for containers and filesystems | Every push/PR |
| **Gitleaks** | Fast and comprehensive secret detection | Every push/PR |
| **TruffleHog** | Secret detection in code and git history | Every push/PR |
| **Checkov** | Terraform/IaC security scanning | When Terraform files detected |
| **tfsec** | Terraform security scanner | When Terraform files detected |
| **Hadolint** | Dockerfile security linting | When Docker files detected |

### 📊 Code Quality Tools

| Tool | Purpose | Trigger |
|------|---------|---------|
| **SonarCloud** | Code quality and security analysis | Every push/PR |
| **Lighthouse** | Performance and accessibility testing | Every push/PR |
| **axe-core** | Accessibility compliance testing | Every push/PR |
| **Bundle Analyzer** | JavaScript bundle size analysis | Every push/PR |
| **Depcheck** | Unused dependency detection | Every push/PR |

## Required Secrets

To enable all security scanning features, configure these secrets in your GitHub repository:

### Security Scanning Secrets
```
SNYK_TOKEN          # Snyk API token for vulnerability scanning
SEMGREP_APP_TOKEN   # Semgrep token for advanced rules
SONAR_TOKEN         # SonarCloud token for code analysis
```

### How to Set Up Secrets

1. **Snyk Token:**
   - Sign up at [snyk.io](https://snyk.io)
   - Go to Account Settings → API Token
   - Copy token to GitHub Secrets as `SNYK_TOKEN`

2. **Semgrep Token:**
   - Sign up at [semgrep.dev](https://semgrep.dev)
   - Go to Settings → Tokens
   - Copy token to GitHub Secrets as `SEMGREP_APP_TOKEN`

3. **SonarCloud Token:**
   - Sign up at [sonarcloud.io](https://sonarcloud.io)
   - Create new project and organization
   - Generate token in My Account → Security
   - Copy token to GitHub Secrets as `SONAR_TOKEN`

## Security Workflow Behavior

### Branch Protection
- Workflows run on **all branches except `main`**
- Use `continue-on-error: true` to prevent blocking development
- Results uploaded to GitHub Security tab for review

### Severity Thresholds
- **Snyk**: High severity vulnerabilities flagged
- **Semgrep**: All security rules applied
- **Trivy**: All vulnerabilities reported
- **Dependency Review**: Moderate+ severity for PRs

### Terraform Security
- **Checkov**: Infrastructure as Code security scanning
- **tfsec**: Terraform-specific security rules
- Triggered when commit messages contain "terraform" or ".tf" files

### Container Security
- **Hadolint**: Dockerfile best practices
- **Docker Scout**: Container vulnerability scanning
- Triggered when commit messages contain "docker" or "container"

## Security Best Practices

### Dependencies
- Use exact versions in `package.json` (no `^` or `~`)
- Regularly update dependencies with `npm audit fix`
- Review dependency changes in PRs

### Environment Variables
- Never commit secrets to git
- Use GitHub Secrets for sensitive data
- Validate all environment variables

### Code Security
- Follow OWASP Top 10 guidelines
- Sanitize all user inputs
- Use Content Security Policy (CSP)
- Implement proper authentication/authorization

### Infrastructure
- Use least privilege access
- Enable logging and monitoring
- Regular security updates
- Secure container configurations

## Reporting Security Issues

### For Security Vulnerabilities
1. **DO NOT** create public GitHub issues for security vulnerabilities
2. Email security concerns to: [your-security-email]
3. Include detailed description and reproduction steps
4. Allow reasonable time for response before public disclosure

### For False Positives
1. Create GitHub issue with "security" label
2. Include tool name and specific finding
3. Provide justification for false positive
4. Suggest suppression or configuration changes

## Security Monitoring

### GitHub Security Tab
- Review all security alerts regularly
- Address high/critical findings promptly
- Document any accepted risks

### Automated Notifications
- Security alerts sent to repository admins
- Weekly security digest emails
- Slack/Teams integration available

## Compliance

This security setup helps meet:
- **OWASP ASVS** (Application Security Verification Standard)
- **NIST Cybersecurity Framework**
- **CIS Controls**
- **SOC 2 Type II** requirements

## Security Checklist

Before merging to main:
- [ ] All security scans completed
- [ ] High/critical vulnerabilities addressed
- [ ] Dependencies updated to latest secure versions
- [ ] No secrets in code
- [ ] Security review completed
- [ ] Documentation updated

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Next.js Security Guidelines](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
