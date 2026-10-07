import { expect, test, type Page } from "@playwright/test"

// Browser tests intercept only HTTP adapters. No real email/account is changed.
const customer = {
  id: 101,
  username: "new@example.com",
  email: "new@example.com",
  emailVerified: true,
  role: "CUSTOMER",
  mustChangePassword: false,
  onboardingRequired: false,
}
const staff = {
  ...customer,
  id: 102,
  username: "Staff Profile",
  email: null,
  emailVerified: false,
  role: "ENGINEER",
  mustChangePassword: true,
  onboardingRequired: true,
}
type Call = {
  path: string
  body: Record<string, unknown>
  authorization: string | undefined
}
async function setup(
  page: Page,
  settings: {
    staff?: boolean
    verified?: boolean
    passwordChanged?: boolean
    invalidCode?: boolean
    expiredProof?: boolean
  } = {}
) {
  const calls: Call[] = []
  let account = settings.staff
    ? {
        ...staff,
        email: settings.verified ? "staff@example.com" : null,
        emailVerified: !!settings.verified,
        mustChangePassword: !settings.passwordChanged,
      }
    : { ...customer }
  let complete = false
  await page.addInitScript(() => localStorage.setItem("valentia_lang", "en"))
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    if (request.method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": new URL(
            request.headers().origin || "http://localhost:3000"
          ).origin,
          "Access-Control-Allow-Headers": "content-type,authorization",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Credentials": "true",
        },
      })
      return
    }
    const path = new URL(request.url()).pathname
    const body = request.postDataJSON() || {}
    const authorization = request.headers().authorization
    calls.push({ path, body, authorization })
    let status = 200
    let json: unknown = {}
    if (path === "/api/auth/me") json = account
    else if (
      path === "/api/otp/send" ||
      path === "/api/auth/onboarding/email/request"
    )
      json = { success: true, cooldownSeconds: 60, expiresInSeconds: 300 }
    else if (path === "/api/otp/verify") {
      if (settings.invalidCode) {
        status = 400
        json = { message: "Invalid verification code." }
      } else
        json =
          body.purpose === "PASSWORD_RESET"
            ? { passwordResetToken: "test-reset-proof" }
            : { verificationToken: "test-registration-proof" }
    } else if (path === "/api/auth/register") {
      if (settings.expiredProof) {
        status = 400
        json = {
          message: "Email verification has expired. Request a new code.",
        }
      } else {
        expect(body).toEqual({
          username: "new@example.com",
          password: "Password123!",
          verificationToken: "test-registration-proof",
        })
        status = 201
        json = customer
      }
    } else if (path === "/api/auth/login") {
      expect(body).not.toHaveProperty("username")
      if (settings.staff && !complete)
        json = {
          onboardingToken: "test-onboarding-session",
          onboardingRequired: true,
          user: account,
        }
      else json = { accessToken: "test-access-session", user: account }
    } else if (path === "/api/auth/onboarding/email/verify") {
      expect(authorization).toBe("Bearer test-onboarding-session")
      account = { ...account, email: body.email as string, emailVerified: true }
      complete = !account.mustChangePassword
      account.onboardingRequired = !complete
      json = { ...account, onboardingComplete: complete }
    } else if (path === "/api/auth/change-password") {
      expect(authorization).toBe("Bearer test-onboarding-session")
      expect(body).toEqual({ newPassword: "Permanent123!" })
      account = {
        ...account,
        mustChangePassword: false,
        onboardingRequired: !account.emailVerified,
      }
      complete = account.emailVerified
      json = { mustChangePassword: false, onboardingComplete: complete }
    } else if (path === "/api/auth/forgot-password")
      json = {
        success: true,
        message:
          "If the account exists, a verification code will be sent to its email.",
      }
    else if (path === "/api/auth/reset-password") {
      expect(body).toEqual({
        passwordResetToken: "test-reset-proof",
        newPassword: "Changed123!",
      })
      json = { success: true }
    } else if (path.includes("projects") || path.includes("users")) json = []
    await route.fulfill({
      status,
      json,
      headers: {
        "Access-Control-Allow-Origin":
          request.headers().origin || "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  })
  return calls
}
async function startSignup(page: Page) {
  await page.goto("/signup")
  await page.locator("#fullname").fill("New Customer")
  await page.locator("#username").fill("NEW@EXAMPLE.COM")
  await page.locator("#password").fill("Password123!")
  await page.locator("#confirm-password").fill("Password123!")
  await page.getByRole("checkbox").check()
  await page.locator("form button[type=submit]").click()
  await expect(page.locator("#registration-code")).toBeVisible()
}
async function startStaff(page: Page) {
  await page.goto("/login")
  await page.locator("#username").fill("temporary@internal.local")
  await page.locator("#password").fill("Provision123!")
  await page.locator("form button[type=submit]").click()
}
async function enterOnboardingCode(page: Page) {
  const inputs = page.locator('input[inputmode="numeric"]')
  for (let i = 0; i < 6; i++) await inputs.nth(i).fill("1")
  await page.locator("form button[type=submit]").last().click()
}
async function finishPassword(page: Page) {
  await page.locator("#onboarding-password").fill("Permanent123!")
  await page.locator("#onboarding-confirmation").fill("Permanent123!")
  await page.locator("form button[type=submit]").last().click()
  await expect(page).toHaveURL("http://localhost:3001/engineer")
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("valentia_staff_access_token"))
    )
    .toBe("test-access-session")
}

test("signup verifies inbox, carries proof, logs in using email and keeps proof out of storage", async ({
  page,
}) => {
  const calls = await setup(page)
  await startSignup(page)
  expect(calls.some((c) => c.path === "/api/auth/register")).toBe(false)
  await page.locator("#registration-code").fill("111111")
  await page.getByRole("button", { name: "Verify and create account" }).click()
  await expect(page).toHaveURL(/\/projects\/new$/)
  expect(calls.find((c) => c.path === "/api/otp/verify")?.body).toEqual({
    email: "new@example.com",
    otp: "111111",
    purpose: "EMAIL_VERIFICATION",
  })
  expect(calls.find((c) => c.path === "/api/auth/login")?.body).toEqual({
    email: "new@example.com",
    password: "Password123!",
  })
  const storage = await page.evaluate(() =>
    JSON.stringify([
      Object.entries(localStorage),
      Object.entries(sessionStorage),
      document.cookie,
    ])
  )
  expect(storage).not.toContain("test-registration-proof")
  expect(storage).not.toContain("Password123!")
})

test("wrong code prevents registration and shows an inline error", async ({
  page,
}) => {
  const calls = await setup(page, { invalidCode: true })
  await startSignup(page)
  await page.locator("#registration-code").fill("000000")
  await page.getByRole("button", { name: "Verify and create account" }).click()
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Invalid verification code"
  )
  expect(calls.some((c) => c.path === "/api/auth/register")).toBe(false)
})

test("canceling staff onboarding removes its restricted session", async ({
  page,
}) => {
  await setup(page, { staff: true })
  await startStaff(page)
  await expect(
    page.getByRole("dialog", { name: "Enter Your Official Work Email" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Cancel & Sign Out" }).click()
  await expect(
    page.getByRole("dialog", { name: "Enter Your Official Work Email" })
  ).toHaveCount(0)
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("valentia_onboarding_token")
    )
  ).toBeNull()
})

test("expired registration proof stays on verification instead of pretending signup succeeded", async ({
  page,
}) => {
  await setup(page, { expiredProof: true })
  await startSignup(page)
  await page.locator("#registration-code").fill("111111")
  await page.getByRole("button", { name: "Verify and create account" }).click()
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "expired"
  )
  await expect(page).toHaveURL(/\/signup$/)
})

test("new staff keeps restricted token out of access cookies and completes inbox/password setup", async ({
  page,
}) => {
  const calls = await setup(page, { staff: true })
  await startStaff(page)
  expect(
    await page.evaluate(() => localStorage.getItem("valentia_auth_token"))
  ).toBeNull()
  expect(
    (await page.context().cookies()).some(
      (c) => c.name === "valentia_auth_token"
    )
  ).toBe(false)
  await page.locator('input[type="email"]').fill("staff@example.com")
  await page.getByRole("button", { name: /Send Verification Code/ }).click()
  await enterOnboardingCode(page)
  await finishPassword(page)
  expect(
    calls.find((c) => c.path === "/api/auth/onboarding/email/request")
      ?.authorization
  ).toBe("Bearer test-onboarding-session")
  expect(
    calls.find(
      (c) =>
        c.path === "/api/auth/login" && c.body.email === "staff@example.com"
    )?.body.password
  ).toBe("Permanent123!")
})

test("verified staff skips email enrollment; refreshed onboarding resumes without access privileges", async ({
  page,
}) => {
  const calls = await setup(page, { staff: true, verified: true })
  await startStaff(page)
  await expect(page.locator("#onboarding-password")).toBeVisible()
  await page.reload()
  await expect(page.locator("#onboarding-password")).toBeVisible()
  await finishPassword(page)
  expect(
    calls.some((c) => c.path === "/api/auth/onboarding/email/request")
  ).toBe(false)
})

test("password-first staff verifies email and signs in without replacing the password again", async ({
  page,
}) => {
  const calls = await setup(page, { staff: true, passwordChanged: true })
  await startStaff(page)
  await page.locator('input[type="email"]').fill("staff@example.com")
  await page.getByRole("button", { name: /Send Verification Code/ }).click()
  await enterOnboardingCode(page)
  await expect(page).toHaveURL("http://localhost:3001/engineer")
  expect(calls.some((c) => c.path === "/api/auth/change-password")).toBe(false)
})

test("password reset carries only PASSWORD_RESET proof and clears it after completion", async ({
  page,
}) => {
  const calls = await setup(page)
  await page.goto("/forgot-password")
  await page.locator("#reset-email").fill("NEW@EXAMPLE.COM")
  await page.getByRole("button", { name: "Send code", exact: true }).click()
  await page.locator("#reset-code").fill("111111")
  await page.getByRole("button", { name: "Verify code", exact: true }).click()
  await page.locator("#reset-password").fill("Changed123!")
  await page.locator("#reset-confirmation").fill("Changed123!")
  await page.getByRole("button", { name: "Save password", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Password updated" })
  ).toBeVisible()
  expect(calls.find((c) => c.path === "/api/otp/verify")?.body.purpose).toBe(
    "PASSWORD_RESET"
  )
  expect(
    await page.evaluate(() =>
      JSON.stringify([
        Object.entries(localStorage),
        Object.entries(sessionStorage),
      ])
    )
  ).not.toContain("test-reset-proof")
})

test("staff handoff uses a fragment, removes it and validates access with the backend", async ({
  page,
}) => {
  const calls = await setup(page)
  await page.goto("/login")
  await page.locator("#username").fill("staff@example.com")
  await page.locator("#password").fill("Permanent123!")
  // Override login role to exercise role routing separately from onboarding.
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      json: {
        accessToken: "test-access-session",
        user: { ...customer, role: "ENGINEER" },
      },
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  )
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      json: { ...customer, role: "ENGINEER" },
      headers: {
        "Access-Control-Allow-Origin":
          route.request().headers().origin || "http://localhost:3001",
        "Access-Control-Allow-Credentials": "true",
      },
    })
  )
  const urls: string[] = []
  page.on("request", (request) => {
    if (request.isNavigationRequest()) urls.push(request.url())
  })
  await page.locator("form button[type=submit]").click()
  await expect(page).toHaveURL("http://localhost:3001/engineer")
  expect(urls.every((url) => !url.includes("test-access-session"))).toBe(true)
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("valentia_staff_access_token"))
    )
    .toBe("test-access-session")
  expect(calls.some((c) => c.path === "/api/auth/register")).toBe(false)
})
