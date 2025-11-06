# Security Policy

## Reporting Security Vulnerabilities

The IBM Cloud Object Storage MCP Server team takes security issues seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities privately using one of the following methods:

#### Method 1: GitHub Security Advisories (Recommended)

Report security vulnerabilities privately through GitHub Security Advisories:

**[Report a vulnerability](https://github.com/IBM/ibm-cos-mcp-server/security/advisories/new)**

This is the preferred method as it allows us to collaborate on the fix privately before public disclosure.

#### Method 2: Direct Email

If you prefer not to use GitHub Security Advisories, you can email the maintainers directly at:

- **Email**: kirtijha@in.ibm.com
- **Subject Line**: [SECURITY] IBM COS MCP Server - [Brief Description]

### What to Include in Your Report

Please include as much of the following information as possible:

1. **Type of vulnerability** (e.g., credential exposure, unauthorized access, data leakage, injection, etc.)
2. **Full paths of affected source file(s)** or location of the affected code
3. **The location of the affected code** (tag/branch/commit or direct URL)
4. **Step-by-step instructions to reproduce the issue**
5. **Proof-of-concept or exploit code** (if possible)
6. **Impact assessment** - what an attacker could potentially achieve
7. **Suggested remediation** (if you have ideas)

### What to Expect

After you submit a vulnerability report, you can expect:

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within **48 hours**
2. **Assessment**: We will confirm the vulnerability and determine its severity within **5 business days**
3. **Fix Development**: We will work on a fix and may reach out to you for additional information
4. **Coordinated Disclosure**: We will coordinate with you on the public disclosure timing
5. **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Security Update Process

1. **Private Fix**: Security vulnerabilities are fixed privately in a security patch
2. **Testing**: The fix is thoroughly tested to ensure it resolves the issue
3. **CVE Assignment**: If applicable, we will request a CVE identifier
4. **Release**: A new version is released with the security fix
5. **Security Advisory**: A security advisory is published with details about:
   - The vulnerability (CVE ID if applicable)
   - Affected versions
   - Fixed versions
   - Severity rating (using CVSS scores)
   - Mitigation steps for users who cannot immediately upgrade
   - Credit to the reporter (if they wish to be credited)
6. **Notification**: Users are notified through:
   - GitHub Security Advisories
   - Release notes (CHANGELOG.md)
   - NPM package update

### Supported Versions

We currently support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

We recommend always using the latest version of the IBM COS MCP Server.

## Security Best Practices for Users

When using the IBM Cloud Object Storage MCP Server, please follow these security best practices:

### IBM Cloud Credential Management

**Critical**: This server requires IBM Cloud credentials to access Cloud Object Storage.

#### API Key Security
- **Never hardcode API keys** in your code or configuration files
- Use **environment variables** for all credentials
- Store credentials in secure secret management systems (e.g., IBM Cloud Secrets Manager, HashiCorp Vault, AWS Secrets Manager)
- **Rotate API keys regularly** (recommended: every 90 days)
- Use API keys with **minimum required permissions**
- Create service-specific API keys (don't reuse keys across services)

#### Best Practices
```bash
# Good - Environment variables
export IBM_COS_API_KEY="your-api-key"
export IBM_COS_INSTANCE_ID="crn:..."

# Bad - Hardcoded in config
{
  "env": {
    "IBM_COS_API_KEY": "abcd1234..."  // ❌ Never do this
  }
}
```

#### Creating Secure API Keys
1. Go to IBM Cloud → Manage → Access (IAM) → API keys
2. Click "Create an IBM Cloud API key"
3. Give it a descriptive name (e.g., "COS MCP Server - Production")
4. Grant minimum required permissions:
   - **Reader**: For read-only access (list, get operations)
   - **Writer**: For read/write access (put, delete operations)
   - **Manager**: For full access including bucket management
5. Set expiration if possible
6. Store key securely in environment variable or secret manager
7. Never commit to version control

### Service Instance ID (CRN) Security

The Instance ID (CRN) is sensitive and should be protected:
- Store in environment variables
- Don't log or expose in error messages
- Rotate when compromised
- Use different instances for dev/staging/production

### MCP API Key Security (HTTP Mode)

If running the server in HTTP mode:

- Use **strong, randomly generated API keys** (minimum 32 characters)
- Store API keys securely (never commit to version control)
- Rotate API keys periodically
- Use different API keys for different environments
- Implement API key rotation strategy

```bash
# Generate strong API key
export MCP_API_KEY=$(openssl rand -base64 32)
```

### Network Security

When running in HTTP mode:

- Use **HTTPS/TLS encryption** in production
- Deploy behind a reverse proxy (e.g., nginx, Apache) with SSL termination
- Implement **rate limiting** to prevent abuse
- Use firewall rules to restrict access to authorized IP addresses
- Consider using VPN or IBM Cloud private endpoints
- Never expose HTTP mode directly to the internet without authentication

### Bucket and Object Security

#### Bucket Security
- Use **private ACLs** by default (never public-read unless absolutely necessary)
- Enable **public access block** for sensitive data buckets
- Use **Key Protect** for encryption at rest
- Enable **bucket versioning** to prevent accidental deletions
- Configure **lifecycle policies** for automatic data cleanup
- Use **IAM policies** instead of bucket ACLs when possible

#### Object Security
- Set appropriate object ACLs
- Use encryption (server-side encryption with Key Protect)
- Implement object tagging for data classification
- Use signed URLs for temporary access (future feature)
- Monitor object access patterns

### Key Protect Integration

For enhanced security:
- Enable Key Protect encryption for buckets with sensitive data
- Rotate encryption keys regularly
- Use different keys for different data classifications
- Monitor key usage and access logs

### Dependency Management

- Keep the IBM COS MCP Server updated to the latest version
- Regularly update Node.js to a supported LTS version
- Monitor security advisories for dependencies
- Run `npm audit` regularly to check for vulnerabilities

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring and Logging

- Enable IBM Cloud Activity Tracker for COS operations
- Monitor for unusual access patterns
- Set up alerts for:
  - Failed authentication attempts
  - Public bucket creations
  - Bulk deletions
  - Large data transfers
- Sanitize logs to prevent credential leakage
- Review Activity Tracker logs regularly

### IAM Best Practices

- Use service IDs for applications (not personal API keys)
- Implement principle of least privilege
- Use IAM access groups for team access
- Enable MFA for accounts with COS access
- Review and audit IAM policies regularly
- Use resource groups to organize and control access

### Data Classification

Implement data classification for proper security controls:
- **Public**: Non-sensitive, can be publicly accessible
- **Internal**: Company internal, restricted access
- **Confidential**: Sensitive data, encrypted, limited access
- **Restricted**: Highly sensitive, encrypted with Key Protect, audit logging

Use object tagging to mark classification:
```json
{
  "classification": "confidential",
  "owner": "team-name",
  "compliance": "gdpr"
}
```

## Security Features

This project implements the following security features:

- **Environment-based authentication**: No hardcoded credentials in source code
- **Input validation**: All user inputs are validated and sanitized
- **Error handling**: Errors do not expose sensitive information (credentials, CRNs)
- **Secure dependencies**: Regular dependency updates and security audits
- **TypeScript**: Type safety helps prevent certain classes of vulnerabilities
- **API key authentication**: Optional authentication for HTTP mode
- **Rate limiting ready**: Can be implemented via reverse proxy
- **IBM Cloud IAM integration**: Native support for IBM Cloud security model

## Known Security Considerations

### IBM Cloud Access

This server requires IBM Cloud credentials. Be aware that:

- The server can access any COS bucket in the specified instance
- All operations are performed with the permissions of the API key
- IBM Cloud Activity Tracker logs all API operations
- API keys should be scoped to minimum required permissions

### Data Handling

This server interacts with IBM Cloud Object Storage. Be aware that:

- Objects are fetched and returned in real-time (not cached)
- Large objects may consume significant memory
- Use streaming for large file operations
- The server does not persist any COS data locally
- All data transfers use HTTPS (TLS)

### Multipart Uploads

When using multipart upload features:
- Incomplete uploads consume storage
- Use `abort_multipart_upload` to clean up failed uploads
- Monitor incomplete multipart uploads regularly
- Set lifecycle rules to auto-expire incomplete uploads

### HTTP Mode Exposure

If running in HTTP mode:
- Never expose directly to internet without authentication
- Use HTTPS in production (not HTTP)
- Implement proper authentication (MCP_API_KEY)
- Use rate limiting to prevent abuse
- Monitor for unusual traffic patterns

## Disclosure Policy

We follow a **coordinated disclosure** policy:

- **Private reporting period**: 90 days from initial report (may be extended by mutual agreement)
- **Public disclosure**: After a fix is released and users have had time to upgrade (typically 7-14 days)
- **Early disclosure**: May occur if the vulnerability is being actively exploited
- **Credit**: We will credit security researchers in security advisories (unless they prefer anonymity)

## Out of Scope

The following are generally considered out of scope for security reports:

- Denial of Service (DoS) attacks requiring excessive resources
- Social engineering attacks
- Security issues in third-party dependencies (report those upstream)
- Security issues in IBM Cloud itself (report to IBM PSIRT)
- Issues requiring physical access to a user's device
- Vulnerabilities in outdated/unsupported versions (< 1.0.0)
- IBM COS service limitations (not server bugs)

However, if you believe you've found a significant security issue even in these categories, please report it anyway and let us assess it.

## Security Incident Response

In the event of a security incident:

1. **Immediate Response**: Assess the severity and scope
2. **Containment**: Take immediate steps to limit exposure
3. **Credential Rotation**: If credentials compromised, revoke and rotate immediately
4. **Investigation**: Determine root cause and affected versions
5. **Remediation**: Develop and test fix
6. **Communication**: Notify affected users through security advisory
7. **Post-Incident**: Review and improve security practices

## IBM Cloud Security Resources

- [IBM Cloud Security](https://www.ibm.com/cloud/security)
- [IBM Cloud Object Storage Security](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-security)
- [IBM Cloud IAM](https://cloud.ibm.com/docs/account?topic=account-iamoverview)
- [IBM Cloud Activity Tracker](https://cloud.ibm.com/docs/activity-tracker)
- [IBM Key Protect](https://cloud.ibm.com/docs/key-protect)

## Bug Bounty Program

We do not currently offer a bug bounty program. However, we deeply appreciate security research and will:

- Publicly acknowledge your contribution (if desired)
- Credit you in security advisories and release notes
- Provide a detailed response to your report
- Work with you on coordinated disclosure

## Questions?

If you have questions about this security policy, please:
- Open a GitHub Discussion (for general security questions)
- Contact the maintainers directly (for sensitive inquiries)
- Consult IBM Cloud security documentation

---

**Last Updated**: November 6, 2025

Thank you for helping keep IBM Cloud Object Storage MCP Server and its users safe! 🔒
