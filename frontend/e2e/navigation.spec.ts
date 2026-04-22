import { test, expect } from "@playwright/test";

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.fill("input[id='username']", "admin");
  await page.fill("input[id='password']", "admin123456");
  await page.click("button[type='submit']");
  await expect(page).toHaveURL(/\/products/);
}

test.describe("导航与布局", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("侧边栏菜单项全部可见（管理员）", async ({ page }) => {
    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByText("产品管理")).toBeVisible();
    await expect(sidebar.getByText("分类管理")).toBeVisible();
    await expect(sidebar.getByText("产品图册")).toBeVisible();
    await expect(sidebar.getByText("客户案例")).toBeVisible();
    await expect(sidebar.getByText("报价方案")).toBeVisible();
    await expect(sidebar.getByText("分享管理")).toBeVisible();
    await expect(sidebar.getByText("用户管理")).toBeVisible();
  });

  test("导航到产品图册", async ({ page }) => {
    await page.getByRole("complementary").getByText("产品图册").click();
    await expect(page).toHaveURL(/\/catalog/);
    await expect(page.getByRole("heading", { name: "产品图册" })).toBeVisible();
  });

  test("导航到客户案例", async ({ page }) => {
    await page.getByRole("complementary").getByText("客户案例").click();
    await expect(page).toHaveURL(/\/cases/);
    await expect(page.getByRole("heading", { name: "客户案例" })).toBeVisible();
  });

  test("导航到报价方案", async ({ page }) => {
    await page.getByRole("complementary").getByText("报价方案").click();
    await expect(page).toHaveURL(/\/quotes/);
    await expect(page.getByRole("heading", { name: "报价方案" })).toBeVisible();
  });

  test("导航到分享管理", async ({ page }) => {
    await page.getByRole("complementary").getByText("分享管理").click();
    await expect(page).toHaveURL(/\/shares/);
    await expect(page.getByRole("heading", { name: "分享管理" })).toBeVisible();
  });

  test("导航到用户管理", async ({ page }) => {
    await page.getByRole("complementary").getByText("用户管理").click();
    await expect(page).toHaveURL(/\/users/);
    await expect(page.getByRole("heading", { name: "用户管理" })).toBeVisible();
  });

  test("导航到内部文档-设计资源", async ({ page }) => {
    await page.getByRole("complementary").getByText("内部文档").click();
    await page.getByRole("complementary").getByText("设计资源").click();
    await expect(page).toHaveURL(/\/documents\/design/);
    await expect(page.getByRole("heading", { name: "设计资源" })).toBeVisible();
  });
});
