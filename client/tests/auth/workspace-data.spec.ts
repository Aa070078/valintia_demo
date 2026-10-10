import { expect, test, type Page } from "@playwright/test"

// Only API adapters are intercepted; these checks never rotate real credentials.
async function workspace(
  page: Page,
  role: string,
  options: { projectFailure?: boolean; reissueFailure?: boolean } = {}
) {
  const calls: string[] = []
  const projectHeaders: string[] = []
  await page.addInitScript(() => {
    localStorage.setItem("valentia_dashboard_lang", "en")
    localStorage.setItem("valentia_staff_access_token", "staff-session")
    localStorage.setItem("valentia_auth_token", "different-client-session")
  })
  await page.route("**/api/**", async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const headers = {
      "Access-Control-Allow-Origin":
        request.headers().origin || "http://localhost:3001",
      "Access-Control-Allow-Headers": "content-type,authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Credentials": "true",
    }
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers })
      return
    }
    let status = 200
    let body: unknown = []
    if (path === "/api/auth/me")
      body = {
        id: 1,
        username: "Database user",
        role,
        mustChangePassword: false,
        onboardingRequired: false,
      }
    if (path === "/api/projects") {
      projectHeaders.push(request.headers().authorization)
      if (options.projectFailure) {
        status = 500
        body = { message: "Project storage unavailable" }
      }
    }
    if (path === "/api/users")
      body = [
        {
          id: 41,
          username: "PendingStaff",
          email: null,
          role: "ENGINEER",
          emailVerified: false,
          mustChangePassword: true,
        },
        {
          id: 42,
          username: "ActiveStaff",
          email: "active@example.com",
          role: "ENGINEER",
          emailVerified: true,
          mustChangePassword: false,
        },
      ]
    if (path.endsWith("/revoke-temporary-credentials")) {
      calls.push(path)
      if (options.reissueFailure) {
        status = 409
        body = { message: "Account is already active" }
      } else
        body = {
          id: 41,
          username: "PendingStaff",
          role: "ENGINEER",
          temporaryLogin: "issued-test-login@internal.local",
          temporaryPassword: "Test-only-issued-password",
          temporaryCredentialsExpiresAt: new Date(
            Date.now() + 86400000
          ).toISOString(),
        }
    }
    await route.fulfill({ status, headers, json: body })
  })
  await page.goto(
    `http://localhost:3001/${role === "ENGINEER" ? "engineer" : "admin"}`
  )
  return { calls, projectHeaders }
}

test("empty engineer assignment list stays empty and uses the staff session", async ({
  page,
}) => {
  const { projectHeaders } = await workspace(page, "ENGINEER")
  await expect(
    page.getByText("No projects match the selected filter")
  ).toBeVisible()
  await expect(page.getByText("Palm Hills Golf Views Villa")).toHaveCount(0)
  expect(projectHeaders.length).toBeGreaterThan(0)
  expect(
    projectHeaders.every((value) => value === "Bearer staff-session")
  ).toBe(true)
})

test("engineer API failure shows an error without demo work", async ({
  page,
}) => {
  await workspace(page, "ENGINEER", { projectFailure: true })
  await expect(
    page.getByText("Unable to load assigned projects. Please retry.")
  ).toBeVisible()
  await expect(page.getByText("Palm Hills Golf Views Villa")).toHaveCount(0)
})

test("incomplete staff can revoke with confirmation; active staff cannot", async ({
  page,
}) => {
  const { calls } = await workspace(page, "ADMINISTRATOR", {
    projectFailure: true,
  })
  await page.getByRole("button", { name: "Staff Directory & Vouchers" }).click()
  await expect(page.getByText("PendingStaff", { exact: true })).toBeVisible()
  await expect(page.getByText("ActiveStaff", { exact: true })).toBeVisible()
  const revoke = page.getByRole("button", {
    name: "Revoke & reissue temp credentials",
  })
  await expect(revoke).toHaveCount(1)
  await revoke.click()
  expect(calls).toHaveLength(0)
  await page.getByRole("button", { name: "Cancel", exact: true }).click()
  expect(calls).toHaveLength(0)
  await revoke.click()
  await page.getByRole("button", { name: "Confirm reissue" }).click()
  await expect(
    page.getByText("issued-test-login@internal.local", { exact: true })
  ).toBeVisible()
  expect(calls).toEqual(["/api/users/41/revoke-temporary-credentials"])
})

test("revoke rejection displays an error and no new voucher", async ({
  page,
}) => {
  await workspace(page, "ADMINISTRATOR", { reissueFailure: true })
  await page.getByRole("button", { name: "Staff Directory & Vouchers" }).click()
  await page
    .getByRole("button", { name: "Revoke & reissue temp credentials" })
    .click()
  await page.getByRole("button", { name: "Confirm reissue" }).click()
  await expect(
    page.getByText("Account is already active", { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText("issued-test-login@internal.local", { exact: true })
  ).toHaveCount(0)
})

test("owner does not see administrator-only staff controls", async ({
  page,
}) => {
  await workspace(page, "COMPANY_OWNER")
  await expect(
    page.getByRole("button", { name: "Platform Analytics" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Staff Directory & Vouchers" })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Provision Staff Account" })
  ).toHaveCount(0)
})
