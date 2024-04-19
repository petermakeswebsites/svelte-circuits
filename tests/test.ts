import { expect, test } from '@playwright/test'

test('Context menu opens', async ({ page }) => {
	await page.goto('/')
	// Get viewport size
	const viewportSize = page.viewportSize()
	if (!viewportSize) throw new Error('viewport size not set')
	const middleX = viewportSize.width / 2
	const middleY = viewportSize.height / 2
	await page.waitForSelector("svg")
	await page.mouse.click(middleX, middleY, {button: "right"})
	await expect(page.getByTestId("contextmenu")).toBeVisible()
})
