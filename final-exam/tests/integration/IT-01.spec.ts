import { test, expect } from '@playwright/test';

test('IT-01: top-down REAL Login -> browser-level Inventory STUB', {
  annotation: {
    type: 'description',
    description: 'ทดสอบ Login จริงร่วมกับ Inventory Stub ที่จำลองด้วย page.setContent()',
  },
}, async ({ page }) => {
  await test.step('Login ผ่านหน้าเว็บไซต์จริง', async () => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);
  });
  await test.step('สร้าง Inventory Stub', async () => {
    await page.setContent(`
      <main>
        <h1>Mock Inventory Ready</h1>
        <ul data-testid="inventory-list">
          <li data-testid="product">Mock Backpack</li>
          <li data-testid="product">Mock Bike Light</li>
        </ul>
      </main>
    `);
  });
  await test.step('ตรวจสอบผลจาก Stub', async () => {
    await expect(page.getByRole('heading', { name: 'Mock Inventory Ready' })).toBeVisible();
    const products = page.getByTestId('product');
    await expect(products).toHaveCount(2);
    await expect(products.nth(0)).toHaveText('Mock Backpack');
    await expect(products.nth(1)).toHaveText('Mock Bike Light');
  });
});