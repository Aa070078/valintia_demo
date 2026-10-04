# Email-only password login regression

POST /api/auth/login accepts exactly email and password, both required. Username
remains a stable profile field, never a password-login lookup or mail destination.
OTP login and password reset are separate existing flows. No schema change is needed.

Shared internal provisioning roles: ENGINEER, PROJECT_MANAGER, COMPANY_OWNER.
CUSTOMER self-registration and ADMINISTRATOR bootstrap remain separate. Existing
customer/admin password-access policy is preserved; this change does not invent
verification evidence or add a new onboarding gate for those roles.

## Local administrator cleanup

New administrator seed rows have an explicit email field. Existing rows are not
silently updated by the seed. A read-only audit found administrator User 7 has
email=null and User 67 already has a verified real email. User 67 must sign in with
that actual email, even though its username looks like a different email address.
User 7 needs an explicit administrator email assignment by stable User ID using an
approved database maintenance process. Choose the email independently of username,
normalize it and check uniqueness. Preserve ID, username, hash, role, assignments
and verification state; do not mark an inbox verified without OTP evidence.
No application data was modified in this task and the seed was not executed.

## Swagger sequence

Restart the backend and open http://localhost:5000/docs. Requests below include /api.
Use private generated passwords and real unused inboxes; never share credentials/OTPs.

1. POST /api/auth/login:

   ~~~json
   { "email": "<actual administrator email>", "password": "<administrator password>" }
   ~~~

   Expect 200 and accessToken. Authorize with it.
2. Repeat steps 3?10 for each of ENGINEER, PROJECT_MANAGER and COMPANY_OWNER.
3. POST /api/users:

   ~~~json
   { "firstName": "Test", "lastName": "Staff", "birthYear": 1998, "role": "ENGINEER" }
   ~~~

   Substitute the current role. Expect 201; retain id, username, temporaryLogin
   and the one-time temporaryPassword privately.
4. POST /api/auth/login:

   ~~~json
   { "email": "<temporaryLogin>", "password": "<temporaryPassword>" }
   ~~~

   Expect 200 with onboardingToken and no accessToken. Authorize with onboardingToken.
   GET /api/auth/me returns the same id, username and role. Business routes reject
   this context with 403, including POST /api/projects/{id}/review/start.
5. POST /api/auth/change-password:

   ~~~json
   { "newPassword": "<new strong permanent password>" }
   ~~~

   Expect mustChangePassword=false and onboardingComplete=false. Keep onboardingToken.
6. POST /api/auth/onboarding/email/request:

   ~~~json
   { "email": "<real unused inbox you control>" }
   ~~~

   Expect 200. Receive the existing OTP message in that real inbox via Gmail SMTP.
   No mail is sent to temporaryLogin. Gmail delivery was previously manually proven
   separately; automated regression tests mock mail and never contact Gmail.
7. POST /api/auth/onboarding/email/verify:

   ~~~json
   { "email": "<same real inbox>", "otp": "<received six-digit code>" }
   ~~~

   Expect emailVerified=true, mustChangePassword=false, onboardingComplete=true.
   Old onboardingToken now fails with 401. Email-first/password-second remains supported.
8. POST /api/auth/login with the verified real email and permanent password.
   Expect 200, accessToken and no onboardingToken. Authorize with accessToken.
   GET /api/auth/me retains username, id and role; onboardingRequired=false.
9. POST /api/auth/login with email set to the profile username and correct permanent
   password: 401. Body containing username instead of email: 400. Missing email,
   missing password, or adding username alongside email/password: 400.
   The old temporaryLogin now returns 401 with either temporary or permanent password.
10. Verify business RBAC with an assigned submitted project: ENGINEER can start review;
    PROJECT_MANAGER and COMPANY_OWNER receive 403 on Engineer review actions. None
    of these roles can POST /api/users; only ADMINISTRATOR can provision staff.
11. POST /api/auth/login/otp/request with the verified real email. Receive LOGIN OTP,
    then POST /api/auth/login/otp/verify with {email,otp}: accessToken returned.
12. Try login/otp/request with {email: profileUsername}: 400 for a non-email profile.
    With {email: temporaryLogin}: generic 200 with no email delivery. No token is
    granted; verifying an absent code fails. Email-shaped old profile usernames
    also never trigger delivery unless independently assigned as an actual verified email.
13. POST /api/auth/forgot-password with verified real email; receive PASSWORD_RESET OTP.
    POST /api/otp/verify with {email,otp,purpose:"PASSWORD_RESET"}, then
    POST /api/auth/reset-password with {passwordResetToken,newPassword}.
    Login using real email and the new password; the old password and replayed reset
    proof fail. Profile/temporary identifiers cannot receive recovery mail.

## Transport audit

Nodemailer remains configured only by SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER,
SMTP_PASS and SMTP_FROM. No active dependency/import/configuration uses the previous
provider. Remaining provider-name references exist only in append-only historical
release logs; generic resend/cooldown wording means requesting another code.
Private server/.env remains Git-ignored. Obsolete provider keys were removed without
printing their values or changing SMTP credentials.
