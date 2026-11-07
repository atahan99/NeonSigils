import { expect, test } from "@playwright/test"

test("a trivia run reaches the results and saves to the leaderboard once", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: /Trivia Mode/ }).click()
  await page.getByRole("button", { name: /^Mixed \/ Chaos/ }).click()

  // Two wrong answers lose the first sigil on Easy.
  const input = page.getByPlaceholder("type the sigil name…")
  for (const guess of ["zzzz not a logo", "qqqq still not"]) {
    await input.fill(guess)
    await input.press("Enter")
  }
  const verdict = page.getByRole("alertdialog", { name: "Signal corrupted" })
  await expect(verdict).toContainText("The sigil was")
  await verdict.getByRole("button", { name: "Load Next Sigil" }).click()

  await page.getByRole("button", { name: "Quit" }).click()
  await page.getByRole("button", { name: "End Run" }).click()
  await page.getByRole("button", { name: "View Results" }).click()

  await expect(page).toHaveURL(/#\/results$/)
  await expect(page.getByRole("heading", { name: "CONNECTION TERMINATED" })).toBeVisible()
  await page.getByRole("button", { name: "Save to Hall of Signals" }).click()
  await expect(page.getByText("SIGNAL ARCHIVED")).toBeVisible()

  // A refresh must not offer to save the same run again.
  await page.reload()
  await expect(page.getByRole("button", { name: "Save to Hall of Signals" })).toHaveCount(0)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("neonsigils.leaderboard.v1") ?? "[]").length)
  expect(saved).toBe(1)
})

test("hangman accepts on-screen letters and tracks lives on the gallows", async ({ page }) => {
  await page.goto("/#/play/hangman")
  await page.getByRole("button", { name: /^Security & Networking/ }).click()
  await page.getByRole("button", { name: /^Letter Q,/ }).click()
  await page.getByRole("button", { name: /^Letter X,/ }).click()
  await expect(page.getByText(/^Trace \d\/6$/)).toBeVisible()
})

test("pages ship link-preview metadata", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.png$/)
})
