// server.js
const next = require("next");
const routes = require("./routes");
const { createServer } = require("http");


const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = routes.getRequestHandler(app);

// Without express
app.prepare().then(() => {
  createServer(handler).listen(3000);
  console.log("http://localhost:3000");
});
