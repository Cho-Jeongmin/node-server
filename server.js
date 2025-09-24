import http from "http";
import fs from "fs/promises";
import routes from "./routes.js";
import url from "url";

const server = http.createServer(async (req, res) => {
  // serve static file
  if (req.url === "/file-list.js") {
    const app = await fs.readFile("./file-list.js");
    res.writeHead(200, { "Content-Type": "text/javascript" });
    res.end(app);
    return;
  }

  const path = url.parse(req.url, true).pathname;
  const method = req.method.toUpperCase();

  let handler = routes[req.url] && routes[path][method];

  if (!handler) {
    handler = routes.notFound;
  }

  await handler(req, res);
});

const PORT = 8080;
server.listen(PORT, "localhost", () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
