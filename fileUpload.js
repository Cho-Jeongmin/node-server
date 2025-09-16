import http from "http";
import formidable from "formidable";
import fs from "fs";

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/upload" && req.method.toLowerCase() === "post") {
    const form = formidable({});
    let fields;
    let files;
    try {
      //parse the files uploaded
      [fields, files] = await form.parse(req);

      //move the files uploaded
      files.multipleFiles.forEach((file) => {
        let oldPath = String(file.filepath);
        let newPath =
          "C:/study/uploaded-files/" + String(file.originalFilename);

        fs.rename(oldPath, newPath, function (err) {
          if (err) throw err;
          res.write("File uploaded and moved!");
          res.end();
        });
      });
    } catch (err) {
      console.error(err);
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ fields, files }, null, 2));
    return;
  }

  // show a file upload form
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <form action="/api/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="multipleFiles" multiple="multiple"><br>
      <input type="submit">
    </form>`);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
