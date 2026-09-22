import { test, expect } from "@playwright/test";

test("Google integrations expose direct OAuth connection routes", async ({
  page,
}) => {
  await page.goto("/integrations");
  await expect(page.getByRole("heading", { name: "集成" })).toBeVisible();
  await expect(page.getByText(/不需要安装 WordPress 插件/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "连接 Google Analytics 4" }),
  ).toHaveAttribute("href", /provider=ga4&siteId=/);
  await expect(
    page.getByRole("link", { name: "连接 Search Console" }),
  ).toHaveAttribute("href", /provider=search-console&siteId=/);
  await expect(page.getByText("本地界面预览")).toBeVisible();
});
