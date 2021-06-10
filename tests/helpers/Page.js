const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const customPage = new CustomPage();

    return new Proxy(customPage, {
      get: function (target, prop) {
        return target[prop] || browser[prop] || page[prop];
      },
    });
  }

  constructor() {}

  async login() {
    const user = await userFactory();

    const { session, sig } = sessionFactory(user);

    await this.setCookie({ name: "session", value: session });
    await this.setCookie({ name: "session.sig", value: sig });

    await this.goto("http://localhost:3000/blogs");
  }

  async getText(selector) {
    return await this.$eval(selector, (ele) => ele.innerText);
  }

  async execRequests(actions) {
    return Promise.all(
      actions.map(({ path, method, data }) => this[method](path, data))
    );
  }

  async get(path) {
    const result = await this.evaluate((_path) => {
      return fetch(_path, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    }, path);

    return result;
  }

  async post(path, data) {
    const result = await this.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );

    return result;
  }
}

module.exports = CustomPage;
