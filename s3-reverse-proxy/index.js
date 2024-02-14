const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT;

const BASE_PATH = process.env.AWS_S3_URL;

const proxy = httpProxy.createProxy();

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];
  console.log(hostname);
  // Custom Domain - DB Query

  const resolvesTo = `${BASE_PATH}/${subdomain}`;

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") proxyReq.path += "index.html";
});

app.listen(PORT, () =>
  console.log(`Reverse Proxy Running..${process.env.PORT}`)
);
