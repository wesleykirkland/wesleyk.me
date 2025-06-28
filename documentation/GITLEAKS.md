# Gitleaks Configuration

This repository uses [Gitleaks](https://github.com/gitleaks/gitleaks) for comprehensive secret detection in the codebase and git history.

## What Gitleaks Detects

### 🔍 **Secret Types Detected:**

- API keys and tokens
- Database connection strings
- Email/SMTP credentials
- Cloud service credentials (AWS, Azure, GCP)
- Private keys and certificates
- OAuth tokens
- Webhook URLs with secrets
- And 100+ other secret patterns

### 🎯 **Custom Rules for This Project:**

- Next.js environment variables (`NEXT_PUBLIC_*`)
- SMTP credentials (`SMTP_USER`, `SMTP_PASS`, etc.)
- Email service credentials
- Captcha service keys (`HCAPTCHA_SECRET`, etc.)
- Database URLs

## Configuration

### File: `.gitleaks.toml`

The configuration file includes:

- **Custom rules** for project-specific secrets
- **Allowlist** for false positives
- **Entropy settings** to detect high-entropy strings
- **Stopwords** to reduce noise

### Allowlisted Paths:

- `.env.example` - Template files
- `README.md` - Documentation
- `.github/workflows/` - CI/CD files
- `docs/` - Documentation directories

### Allowlisted Patterns:

- Example domains (`example.com`)
- Placeholder values (`your-secret-key-here`)
- Test/mock values (`test-*`, `mock-*`)
- Development URLs (`localhost`, `127.0.0.1`)
- Environment variable references (`${VAR}`, `process.env.VAR`)

## GitHub Actions Integration

Gitleaks runs automatically on:

- ✅ Every push to non-main branches
- ✅ Every pull request
- ✅ Scans entire git history
- ✅ Results uploaded to GitHub Security tab

### Workflow Configuration:

```yaml
- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    config-path: .gitleaks.toml
  continue-on-error: true
```

## Local Usage

### Install Gitleaks:

```bash
# macOS
brew install gitleaks

# Linux
curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/scripts/install.sh | sh

# Windows
choco install gitleaks
```

### Run Locally:

```bash
# Scan current repository
gitleaks detect --config .gitleaks.toml

# Scan with verbose output
gitleaks detect --config .gitleaks.toml --verbose

# Scan specific files
gitleaks detect --config .gitleaks.toml --source="src/"

# Scan git history
gitleaks detect --config .gitleaks.toml --log-opts="--all"
```

## Handling False Positives

### 1. Update Configuration:

Add patterns to `.gitleaks.toml` allowlist:

```toml
[allowlist]
regexes = [
    '''your-false-positive-pattern'''
]
```

### 2. Inline Comments:

Suppress specific lines:

```javascript
const apiKey = "not-a-real-key"; // gitleaks:allow
```

### 3. File-level Suppression:

Add to file header:

```javascript
// gitleaks:disable
const config = {
  secret: "example-value",
};
// gitleaks:enable
```

## Best Practices

### ✅ **Do:**

- Use `.env.example` for templates
- Store real secrets in GitHub Secrets
- Use environment variables for configuration
- Review Gitleaks findings before dismissing
- Update allowlist for legitimate false positives

### ❌ **Don't:**

- Commit real secrets to git
- Ignore all Gitleaks findings
- Use production secrets in development
- Store secrets in code comments
- Disable Gitleaks entirely

## Integration with Other Tools

Gitleaks works alongside:

- **TruffleHog** - Additional secret detection
- **Snyk** - Vulnerability scanning
- **CodeQL** - Static analysis
- **Semgrep** - Security rules

## Troubleshooting

### Common Issues:

1. **High False Positive Rate:**

   - Update `.gitleaks.toml` allowlist
   - Add project-specific stopwords
   - Adjust entropy thresholds

2. **Missing Secrets:**

   - Check if pattern is in default rules
   - Add custom rules for project-specific secrets
   - Verify file paths aren't allowlisted

3. **Performance Issues:**
   - Limit scan scope with `--source`
   - Use `.gitleaksignore` for large files
   - Adjust entropy settings

## Resources

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Configuration Reference](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml)
- [GitHub Action](https://github.com/gitleaks/gitleaks-action)
- [Secret Management Best Practices](https://owasp.org/www-project-top-ten/2021/A07_2021-Identification_and_Authentication_Failures/)
