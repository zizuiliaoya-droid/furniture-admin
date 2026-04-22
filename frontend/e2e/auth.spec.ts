import { test, expect } from "@playwright/test";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123456";

test.describe("认证模块", () => {
  test("登录页面正常显示", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=家具软装管理平台")).toBeVisible();
    await expect(page.locator("input[id='username']")).toBeVisible();
    await expect(page.locator("input[id='password']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("使用正确凭据登录成功", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[id='username']", ADMIN_USER);
    await page.fill("input[id='password']", ADMIN_PASS);
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/products/);
    // 使用更精确的选择器：侧边栏中的菜单项
    await expect(page.getByRole("heading", { name: "产品管理" })).toBeVisible();
  });

  test("使用错误密码登录失败", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[id='username']", ADMIN_USER);
    await page.fill("input[id='password']", "wrongpassword");
    await page.click("button[type='submit']");
    // 等待请求完成，应停留在登录页
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
    // token 不应存在
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
  });

  test("未登录访问受保护页面重定向到登录页", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    });
    await page.goto("/products");
    await expect(page).toHaveURL(/\/login/);
  });

  test("登录后可以登出", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[id='username']", ADMIN_USER);
    await page.fill("input[id='password']", ADMIN_PASS);
    await page.click("button[type='submit']");
    await expect(page).toHaveURL(/\/products/);

    await page.locator(".ant-avatar").click();
    await page.locator("text=退出登录").click();
    await expect(page).toHaveURL(/\/login/);
  });
});
