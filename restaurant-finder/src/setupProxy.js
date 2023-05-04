const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api/socket", {
      target: "http://localhost:5001",
      changeOrigin: true,
      ws: true,
    })
  );

  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
    })
  );
};
