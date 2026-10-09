# Auth integration checks

Run the backend on port 5000, client on 3000, and dashboard on 3001. In the client environment set `NEXT_PUBLIC_API_URL=http://localhost:5000/api`, `NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001`. Set the dashboard API URL to the same backend. Runtime account/project mocks have been removed.

From `client/`, run `npm run test:auth`. Windows uses installed Microsoft Edge; elsewhere install Chromium with `npx playwright install chromium`. Set `PLAYWRIGHT_CHANNEL` to select another installed browser.

These browser tests intercept API requests. They check the frontend contracts, state, storage, and navigation without creating real accounts, sending email, or changing passwords. Server OTP tests separately cover purpose isolation, expiration, attempt limits, and single-use proofs: run `npm run test:auth-otp` in `server/`.

For a live check:

1. Open `http://localhost:3000/signup` and use a new permitted email address whose inbox you control. Submit the form, enter the inbox code, and confirm you reach the customer workspace. Verification proofs and access tokens are passed automatically.
2. For a provisioned staff account, sign in at `/login` using its temporary login email and password. Enter its permanent inbox email, verify the emailed code, and set its permanent password. Confirm the correct workspace opens on port 3001. Already verified accounts skip email verification; refreshing an incomplete setup restores the restricted session in the current tab.
3. For an eligible account with completed onboarding, open `/forgot-password`, enter its email, enter the inbox code, choose a new password, and sign in with that password. The reset proof stays in memory; refreshing this page starts a new request.
4. Wrong or expired codes must show an error and prevent completion. Use resend after the cooldown or cancel onboarding to sign out.

Local project APIs currently require database migration repair: the existing database is missing `projects.coverImage`. Auth browser tests do not resolve or conceal this separate issue. Do not reset the database or alter account eligibility to force these checks to pass.

On `feat/db-backed-workspaces`, open `http://localhost:3001/admin` with an administrator session, select **Staff Directory & Vouchers**, and find the incomplete account. **Revoke & reissue temp credentials** opens a confirmation before calling `POST /api/users/:id/revoke-temporary-credentials`. Cancel does nothing. Confirm invalidates the old credentials and onboarding sessions; copy the newly returned voucher from the page. Active accounts must use verified-email password recovery instead. The directory uses administrator-only `GET /api/users`; it never returns password hashes or existing temporary passwords.

`workspace-data.spec.ts` covers empty/error queues, the staff bearer token, revoke confirmation/cancel/success/failure, and role restrictions. Tests intercept the API and do not change real accounts or send email. Run `npm run test:users-directory` from `server/` for the corresponding HTTP authorization/response checks. The existing database-backed `test:identity-onboarding` suite is currently blocked during migration setup by the historical schema-qualified `public.SpaceType_old` reference.

Old browser project/staff/appointment caches are no longer read. Form choices and test fixtures remain; fake business records, fake authentication, fake successful writes, and sample analytics are removed. Consultation booking/MOM show unavailable until supported by backend endpoints. Legacy client staff pages link to the shared dashboard.
