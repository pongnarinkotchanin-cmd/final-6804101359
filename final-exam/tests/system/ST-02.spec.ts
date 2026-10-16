import { test, expect, type Page } from '@playwright/test';

async function login(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
}

test('ST-02: checkout validation and recovery', {
  annotation: {
    type: 'description',
    description: 'ตรวจสอบ Checkout Validation และการแก้ไขข้อมูลจนสั่งซื้อสำเร็จ',
  },
}, async ({ page }) => {
  await test.step('Login เพิ่มสินค้า และเปิด Checkout', async () => {
    await login(page);
    const backpack = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
    await backpack.getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('.shopping_cart_link').click();
    await page.getByRole('button', { name: 'Checkout' }).click();
  });
  await test.step('ตรวจสอบ First Name is required', async () => {
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
  });
  await test.step('ตรวจสอบ Last Name is required', async () => {
    await page.locator('#first-name').fill('John');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-test="error"]')).toContainText('Last Name is required');
  });
  await test.step('ตรวจสอบ Postal Code is required', async () => {
    await page.locator('#last-name').fill('Doe');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);
  });
  await test.step('แก้ไขข้อมูลและสั่งซื้อสำเร็จ', async () => {
    await page.locator('#postal-code').fill('50000');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  });
});