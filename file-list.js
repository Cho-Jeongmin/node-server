fetch("/files")
  .then((res) => res.json())
  .then((files) => {
    console.log("files", files);
    const ul = document.getElementById("file-list");

    files.forEach((file) => {
      const li = document.createElement("li");
      li.textContent = file.filename;
      ul.appendChild(li);
    });
  })
  .catch((err) => console.error(err));
