# Security Policy

## Supported Versions

Only the latest production deployment is actively maintained.

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Use the GitHub **Security Advisories** feature to report privately:

1. Go to [github.com/felipesauer/agro-sak/security/advisories/new](https://github.com/felipesauer/agro-sak/security/advisories/new)
2. Fill in the details: description, steps to reproduce, and potential impact.
3. Submit the advisory.

You will receive a response within 72 hours. If the issue is confirmed, a fix will be prioritized and you will be credited in the release notes (unless you prefer to remain anonymous).

## Scope

| In scope | Out of scope |
|---|---|
| XSS, injection in tool inputs | Third-party libraries with their own advisories |
| Data leakage from IndexedDB | Issues requiring physical device access |
| Server-side proxy endpoints (`/api/*`) | Social engineering |

## Security Design Notes

- All calculations run client-side — no user data is sent to any server.
- The only external network requests are the `/api/bcb-proxy` and `/api/cbs-proxy` endpoints, which proxy public government APIs and do not process user input beyond query parameters.
- No authentication, sessions, or cookies are used.
