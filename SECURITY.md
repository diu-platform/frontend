# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.15.x  | :white_check_mark: |
| < 0.15  | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at: **security@diu-os.dev**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

### Safe Harbor

We consider security research activities conducted consistent with this policy to be:
- Authorized under the Computer Fraud and Abuse Act (CFAA)
- Exempt from DMCA claims related to circumvention of security measures
- Lawful and not actionable

We will not pursue legal action against you if you:
- Act in good faith
- Avoid privacy violations
- Avoid data destruction
- Do not degrade service for other users

## Security Best Practices

This is a **client-side only** application with no backend server. However:

### For Users
- Always download from official sources
- Verify file integrity if provided
- Keep your browser updated
- Be cautious of modified/forked versions

### For Contributors
- Never commit secrets or API keys
- Follow the `.gitignore` patterns
- Use `rel="noopener noreferrer"` on external links
- Sanitize any user inputs
- Keep dependencies updated

## Known Security Considerations

### AudioContext
The application uses AudioContext for sound effects. This could theoretically be used for browser fingerprinting, but:
- Sound is opt-in (disabled by default)
- No data is sent to any server
- All processing is local

### WebGL/Three.js
3D rendering uses WebGL which may expose GPU information. This is:
- Standard browser behavior
- Required for the simulation
- Not collected or transmitted

## Acknowledgments

We thank the following security researchers:
- *(Your name could be here!)*

---

*Last updated: December 2025*
