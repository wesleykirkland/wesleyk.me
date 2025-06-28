# CodeQL Setup and Configuration

## Issue: CodeQL Conflict Error

**Error Message:**

```
Code Scanning could not process the submitted SARIF file:
CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled
```

## Root Cause

GitHub doesn't allow both **default CodeQL setup** and **custom CodeQL workflows** to run simultaneously. You need to choose one approach.

## Solution Options

### Option 1: Use GitHub Default Setup (Recommended)

**Advantages:**

- ✅ Zero configuration required
- ✅ Automatic updates
- ✅ Optimized for most repositories
- ✅ No workflow conflicts

**Steps:**

1. **Keep default setup enabled** in repository settings
2. **Remove custom CodeQL** from workflows (already done)
3. **Let GitHub handle CodeQL** automatically

**Current Status:** ✅ **Implemented** - Custom CodeQL removed from workflow

### Option 2: Use Custom CodeQL Workflow

**Advantages:**

- ✅ Full control over queries and configuration
- ✅ Custom query suites
- ✅ Advanced filtering options

**Steps:**

1. **Disable default setup** in GitHub repository settings:

   - Go to **Settings** → **Code security and analysis**
   - Find **CodeQL analysis**
   - Click **Disable** for default setup

2. **Enable custom workflow** by uncommenting CodeQL section in `.github/workflows/security-scan.yml`

3. **Use the provided configuration** in `.github/codeql/codeql-config.yml`

## Current Configuration

### Default Setup (Active)

- ✅ **Enabled** in repository settings
- ✅ **Automatic scanning** of JavaScript/TypeScript
- ✅ **No conflicts** with other tools
- ✅ **Results** appear in Security tab

### Custom Workflow (Disabled)

- ❌ **Commented out** to prevent conflicts
- 📁 **Configuration available** in `.github/codeql/codeql-config.yml`
- 🔄 **Can be enabled** if default setup is disabled

## How to Switch to Custom CodeQL

If you want more control over CodeQL analysis:

### Step 1: Disable Default Setup

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Code security and analysis**
3. Find **CodeQL analysis** section
4. Click **Disable** next to "Default setup"

### Step 2: Enable Custom Workflow

Replace the commented CodeQL section in `.github/workflows/security-scan.yml`:

```yaml
# CodeQL Analysis with custom configuration
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript, typescript
    config-file: ./.github/codeql/codeql-config.yml

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    category: "/language:javascript-typescript"
```

### Step 3: Customize Configuration

Edit `.github/codeql/codeql-config.yml` to:

- Add/remove query suites
- Modify paths to scan
- Exclude specific files/directories
- Add custom queries

## Query Suites Available

| Suite                   | Description             | Use Case               |
| ----------------------- | ----------------------- | ---------------------- |
| `security-and-quality`  | Security + code quality | **Recommended**        |
| `security-extended`     | Extended security rules | High-security projects |
| `security-experimental` | Experimental rules      | Cutting-edge detection |
| `code-quality`          | Code quality only       | Non-security focused   |

## Custom Configuration Options

### Paths Configuration

```yaml
paths:
  - src/
  - components/
  - lib/

paths-ignore:
  - node_modules/
  - "**/*.test.ts"
  - "**/*.d.ts"
```

### Query Selection

```yaml
queries:
  - uses: security-and-quality
  - uses: security-extended
  - name: custom-queries
    uses: ./custom-queries/
```

### Language-Specific Settings

```yaml
# For JavaScript/TypeScript projects
packs:
  - codeql/javascript-queries
  - codeql/javascript-security-queries
```

## Monitoring CodeQL Results

### GitHub Security Tab

- **Default Setup**: Results appear automatically
- **Custom Workflow**: Results uploaded via SARIF

### Workflow Integration

- **Status checks**: Can be required for PRs
- **Notifications**: Configurable alerts
- **Reporting**: Integration with security dashboards

## Best Practices

### For Most Projects (Default Setup)

- ✅ Use GitHub's default CodeQL setup
- ✅ Enable dependabot for dependency updates
- ✅ Configure security advisories
- ✅ Set up branch protection rules

### For Advanced Projects (Custom Workflow)

- ✅ Use custom query suites
- ✅ Implement path filtering
- ✅ Add project-specific rules
- ✅ Regular configuration reviews

## Troubleshooting

### Common Issues

1. **SARIF Upload Failures**

   - Check file paths in workflow
   - Verify SARIF format validity
   - Ensure proper permissions

2. **Missing Results**

   - Verify language detection
   - Check path configurations
   - Review excluded files

3. **Performance Issues**
   - Limit scan scope
   - Exclude test files
   - Use incremental analysis

### Debug Commands

```bash
# Local CodeQL testing
codeql database create --language=javascript mydb
codeql database analyze mydb --format=sarif-latest --output=results.sarif
```

## Current Recommendation

**Stick with GitHub Default Setup** unless you need:

- Custom query suites
- Specific path filtering
- Advanced configuration options
- Integration with custom security tools

The default setup provides excellent security coverage with zero maintenance overhead.
