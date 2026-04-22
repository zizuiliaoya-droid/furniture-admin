import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.fill("input[id='username']", "admin");
  await page.fill("input[id='password']", "admin123456");
  await page.click("button[type='submit']");
  await expect(page).toHaveURL(/\/products/);
}

test.describe("产品管理模块", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("产品列表页正常显示", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "产品管理" })).toBeVisible();
    await expect(page.getByRole("button", { name: /新建产品/ })).toBeVisible();
  });

  test("创建新产品", async ({ page }) => {
    await page.getByRole("button", { name: /新建产品/ }).click();
    await expect(page).toHaveURL(/\/products\/new/);

    const productName = `测试沙发${Date.now()}`;
    await page.fill("input[id='name']", productName);
    await page.fill("input[id='code']", `E2E-${Date.now()}`);
    await page.fill("textarea[id='description']", "自动化测试创建的产品");

    await page.click("button[type='submit']");
    await page.waitForURL(/\/products/, { timeout: 15000 });
    await expect(page.getByText(productName).first()).toBeVisible();
  });

  test("查看产品详情", async ({ page }) => {
    const firstProduct = page.locator("table tbody tr").first().locator("a").first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await expect(page.locator("text=基本信息")).toBeVisible();
      await expect(page.locator("text=产品图片")).toBeVisible();
      await expect(page.locator("text=产品配置")).toBeVisible();
    }
  });

  test("分类管理页正常显示", async ({ page }) => {
    await page.getByRole("complementary").getByText("分类管理").click();
    await expect(page).toHaveURL(/\/categories/);
    await expect(page.locator("text=产品类别")).toBeVisible();
    await expect(page.locator("text=品牌")).toBeVisible();
  });

  test("创建分类", async ({ page }) => {
    await page.getByRole("complementary").getByText("分类管理").click();
    await expect(page).toHaveURL(/\/categories/);

    const catName = `E2E分类${Date.now()}`;
    await page.getByRole("button", { name: /新建顶级分类/ }).click();
    await page.fill(".ant-modal input[id='name']", catName);
    await page.click(".ant-modal .ant-btn-primary");
    await expect(page.getByText(catName).first()).toBeVisible();
  });
});
