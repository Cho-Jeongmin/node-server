import fs from "fs/promises";
import formidable from "formidable";
import crypto from "crypto";
import path from "path";

const DB_PATH = "C:/study/node-db/db.json";
const STORAGE_PATH = "C:/study/node-storage";

const routes = {
  "/": {
    GET: async (req, res) => {
      try {
        const html = await fs.readFile("./home.html");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch (err) {
        console.error(err);
        res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
        res.end(String(err));
        return;
      }
    },
  },
  "/files": {
    GET: async (req, res) => {
      try {
        // read file list from DB
        const fileList = await fs.readFile(DB_PATH);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(fileList);
      } catch (err) {
        console.error(err);
        res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
        res.end(String(err));
        return;
      }
    },
    POST: async (req, res) => {
      try {
        // Parse uploaded files
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        // Read existing file list
        const existingFilesData = await fs.readFile(DB_PATH, "utf-8");
        const existingFileList = JSON.parse(existingFilesData || []);

        // Process each uploaded file
        const newFileList = [];

        for (const file of files.multipleFiles) {
          // Hash the original file name to avoid collisions
          const hash = crypto
            .createHash("md5")
            .update(String(file.originalFilename))
            .digest("hex");
          const ext = path.extname(file.originalFilename).toLowerCase();
          let newFilePath = path.join(STORAGE_PATH, hash + ext);

          // Move file to storage
          await fs.rename(file.filepath, newFilePath); // need to handle collisions

          newFileList.push({
            hashname: hash + ext,
            filename: String(file.originalFilename), // need to handle collisions
          });
        }

        // Save updated file list in DB
        const updatedList = [...existingFileList, ...newFileList];
        await fs.writeFile(DB_PATH, JSON.stringify(updatedList, null, 2));

        // Respond with uploaded files info
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ fields, files, newFileList }, null, 2));
      } catch (err) {
        console.error(err);
        res.writeHead(err.httpCode || 500, { "Content-Type": "text/plain" });
        res.end(String(err));
      }
    },
  },
  notFound: (req, res) => {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  },
};

export default routes;
