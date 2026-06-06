import { test, expect } from "@playwright/test";

test("login screen loads and demo credentials are available", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Facilities Travel/);
  await expect(page.getByRole("tab", { name: /Entrar/i })).toBeVisible();
  await expect(page.getByPlaceholder("Seu e-mail")).toBeVisible();
  await expect(page.getByPlaceholder("Senha")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Entrar com segurança/i }),
  ).toBeVisible();
});
