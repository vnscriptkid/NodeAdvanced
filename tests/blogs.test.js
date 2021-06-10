const CustomPage = require("./helpers/Page");
let page;

beforeEach(async () => {
  page = await CustomPage.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When not logged in", async () => {
  const actions = [
    {
      path: "/api/blogs",
      method: "get",
    },
    {
      path: "/api/blogs",
      method: "post",
      data: {
        title: "My title",
        content: "My Content",
      },
    },
  ];

  test("blog-related operations are prohibited", async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({
        error: "You must log in!",
      });
    }
  });

  // test("can not create blog posts", async () => {
  //   const result = await page.post("/api/blogs", {
  //     title: "My title",
  //     content: "My Content",
  //   });

  //   expect(result).toEqual({
  //     error: "You must log in!",
  //   });
  // });

  // test("can not get list of posts", async () => {
  //   const result = await page.get("/api/blogs");

  //   expect(result).toEqual({
  //     error: "You must log in!",
  //   });
  // });
});

describe("When logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.waitFor(".fixed-action-btn");
    await page.click(".fixed-action-btn");
  });

  test("can see blog create form", async () => {
    const label = await page.getText("form label");
    expect(label).toEqual("Blog Title");
  });

  describe("And when using invalid inputs", async () => {
    beforeEach(async () => {
      await page.waitFor('button[type="submit"]');
      await page.click('button[type="submit"]');
    });

    test("the form show error messages", async () => {
      await page.waitFor(".title .red-text");
      const titleError = await page.getText(".title .red-text");
      const contentError = await page.getText(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });

  describe("And when using valid inputs", async () => {
    beforeEach(async () => {
      await page.type('input[name="title"]', "Title example");
      await page.type('input[name="content"]', "Content example");
      await page.click('button[type="submit"]');
    });

    test("can see the review form", async () => {
      const text = await page.getText("form h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("can submit the post by clicking green button", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getText(".card-content .card-title");
      const content = await page.getText(".card-content p");

      expect(title).toEqual("Title example");
      expect(content).toEqual("Content example");
    });
  });
});
