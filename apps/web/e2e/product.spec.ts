import { test, expect } from "@playwright/test";
test("商品详情区分事实、计算与 AI 解读", async ({ page }) => {
  await page.goto("/products/everyday-fur-remover");
  await expect(
    page.getByRole("heading", { name: "日常除毛滚筒" }),
  ).toBeVisible();
  await expect(page.getByText("实际数据")).toBeVisible();
  await expect(page.getByText("计算指标")).toBeVisible();
  await expect(page.getByText("AI 解读")).toBeVisible();
});
