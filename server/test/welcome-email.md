# Bilingual welcome email

The source logo is `assets/brand/valentia-logo.png`. Despite its extension, the current file contains JPEG/JFIF bytes (`FF D8 FF`). Its unchanged bytes are included in `server/src/assets/brand/valentia-logo.png` and copied by Nest into `dist/assets/brand/`. Delivery detects the magic bytes and attaches it as `image/jpeg`, named `valentia-logo.jpg`; the source asset is not modified. PNG replacements are supported with their correct MIME type. Keep the bundled copy identical when replacing the source logo. Tests verify both format and byte equality.

Every outgoing welcome uses a unique email-shaped Content-ID and the identical `cid:` reference in its HTML. A stream-transport test checks the actual serialized multipart/related message, correctly typed inline JPEG bytes, folded headers, and matching reference without contacting SMTP. The CID domain is an identifier namespace, not a hosting/deployment URL.

If an inbox displays a broken logo, check a newly generated message in a client that resolves inline attachments. Browser previews of raw email HTML cannot resolve `cid:` without the associated MIME parts. Tempail message bodies require the recipient's active session; the sender's correctly formed MIME alone does not prove that viewer supports inline images. Existing received messages do not change when the template is fixed.

## Configuration

- `WELCOME_EMAIL_ENABLED=false` by default. Explicitly enable only where welcome delivery is wanted. Keep it disabled during development and tests against real services.
- `WELCOME_FRONTEND_LOGIN_URL=http://localhost:3000/login` is the documented development placeholder in `.env.example`. Both buttons and both plain-text links use this one value. Set a real HTTPS frontend login URL before enabling production delivery; missing/unresolved URLs, development hosts, reserved example/test domains, and IP addresses are rejected before SMTP is attempted.
- `WELCOME_LOGO_PATH` optionally overrides the bundled PNG location (for custom deployment packaging). It is a server file path read into an inline CID attachment, never a recipient-facing URL.
- Existing SMTP settings and verification emails are unchanged. No new credentials or mail provider are needed.

## Sending and duplicate prevention

Customer registration verifies the email proof, then commits the unique CUSTOMER insert before notification. Repeating registration is rejected by the existing unique constraints and never schedules another welcome.

Staff onboarding sends only on the incomplete-to-complete transition. The existing per-user database row lock serializes email verification and password changes. Whichever step finishes last sends after its transaction commits; partial setup, rollback, repeated verification, expired scoped sessions, and later ordinary password changes do not send. This uses the existing persisted lifecycle flags instead of an expiring Redis marker or a new schema migration. Completed staff accounts cannot be reprovisioned under the existing policy.

The optional first name supplied at registration is used only for this notification, not persisted. The client supplies the first part of its name field. Staff use the first part of the existing display username; email-shaped usernames are never used as names. Missing names produce a generic bilingual greeting. Names are escaped in HTML. Email address, role, passwords, OTPs, and tokens are absent from the body.

Delivery follows existing best-effort background promise handling, single SMTP attempt, and redacted logging. Failures are caught without undoing committed account changes. Welcome delivery requests strict error reporting from MailService even in development so failed SMTP is not reported as accepted. There is no durable queue or automatic resend; a process exit between commit and notification or failed delivery can lose this nonessential email. We intentionally do not retry an ambiguous SMTP result because it could duplicate delivery. SMTP acceptance does not prove inbox receipt.

## Local review and tests (no real emails)

From `server/`, run `npm run preview:welcome`, then open `test/previews/welcome.html`. The self-contained preview embeds the PNG as a data URI solely for browser review; actual email uses CID. `welcome.txt` shows the plain-text alternative.

Run `npm run test:welcome`, `npm run test:mail-smtp`, and `npm run test:auth-otp`. Welcome tests use fake persistence and mail adapters to check both completion orders, after-commit ordering, failures, repeated/concurrent requests, configuration rejection, logo bytes, escaping, and bilingual template content. They never send SMTP mail or modify the real database.
