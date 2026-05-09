// server.js
const next = require("next");
const routes = require("./routes");
const { createServer } = require("http");


const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = routes.getRequestHandler(app);

const port = process.env.PORT || 3000;

// Without express
app.prepare().then(() => {
  createServer(handler).listen(port);
  console.log(`http://localhost:${port}`);
});
