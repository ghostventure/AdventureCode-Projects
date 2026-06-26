import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/privacy", "/terms", "/data-request", "/maintenance"];

for (const route of routes) {
  test(`${route} has no critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const critical = results.violations.filter((violation) => violation.impact === "critical");

    expect(critical).toEqual([]);
  });
}
