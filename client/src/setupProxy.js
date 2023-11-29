// https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually
// You do not need to import this file anywhere. It is automatically registered when you start the development server.
// Keep this file as js, not ts, otherwise it will not work.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/auth",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
      pathRewrite: {
        "^/auth": "/auth", // remove if you don't need to rewrite the path
      },
    })
  );
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/api", // remove if you don't need to rewrite the path
      },
    })
  );
};
