import { test, expect, type Page } from '@playwright/test';

const beforeEachSetup = async (page: Page) => {
  await page.goto('http://localhost:8080/');

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  await page.click('.modal .new-floorplan svg');
}

test('clearing floor to ceiling replaces default, but good changes are preserved', async ({ page }) => {
  await beforeEachSetup(page);

  await page.click('[data-object-type="stories"] [title="expand"]');

  const floorToCeiling = '[data-column="floor_to_ceiling_height"] input';

  await page.fill(floorToCeiling, '');
  await page.press(floorToCeiling, 'Enter');

  expect(await page.inputValue(floorToCeiling)).toBe('8');

  await page.fill(floorToCeiling, '');
  await page.fill(floorToCeiling, '9');
  await page.press(floorToCeiling, 'Enter');

  expect(await page.inputValue(floorToCeiling)).toBe('9');
});

// it is not none, it is 8
test('clearing space floor to ceiling is allowed', async ({ page }) => {
  await beforeEachSetup(page);

  await page.click('[data-object-type="stories"] [title="expand"]');

  const floorToCeiling = '[data-column="floor_to_ceiling_height"] input';

  const defaultValue = await page.inputValue(floorToCeiling);

  await page.fill(floorToCeiling, '12');
  await page.press(floorToCeiling, 'Enter');

  expect(await page.inputValue(floorToCeiling)).toBe('12');

  await page.fill(floorToCeiling, '');
  await page.press(floorToCeiling, 'Enter');

  expect(await page.inputValue(floorToCeiling)).toBe(defaultValue);
});

test('selecting "Create New" generates a new default option', async ({ page }) => {
  await beforeEachSetup(page);

  await page.click('[data-object-type="stories"] [title="expand"]');

  await page.selectOption('.render-by .input-select .pretty-select', {
    value: 'building_units',
  });

  // missing assert buildingUnitSelector
});
