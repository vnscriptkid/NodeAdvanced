const CustomPage = require("./helpers/Page");
let page;

beforeEach(async () => {
  page = await CustomPage.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("The header has correct text", async () => {
  await page.waitFor("a.brand-logo");
  const text = await page.getText("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("Clicking login starts oauth flow", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url.includes("accounts.google.com/o/oauth2/v2/auth")).toEqual(true);
  // another way
  expect(url).toMatch(/accounts\.google\.com\/o\/oauth2\/v2\/auth/);
});

test("When signed in, show logout button", async () => {
  await page.login();

  await page.goto("http://localhost:3000");

  await page.waitFor('a[href="/auth/logout"]');
  await page.click('a[href="/auth/logout"]');

  await page.waitFor(".right a");
  const text = await page.getText(".right a");
  expect(text).toEqual("Login With Google");
});
