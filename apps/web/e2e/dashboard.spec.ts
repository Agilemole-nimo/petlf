import { test, expect } from "@playwright/test";
test("dashboard exposes demo source and core operations", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "经营总览", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("演示数据 · 非实时")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "销售额与毛利润" }),
  ).toBeVisible();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  if (testInfo.project.name === "desktop")
    await page.screenshot({
      path: "../../docs/design/dashboard-implementation.png",
      fullPage: false,
    });
  await page
    .getByRole("button", { name: "问问栖序", exact: true })
    .last()
    .click();
  await expect(page.getByRole("dialog", { name: "问问栖序" })).toBeVisible();
});
