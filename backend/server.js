const multer = require("multer");
const path = require("path");

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// Serve static files from the uploads folder
app.use("/uploads", express.static("uploads"));

// Modify the POST /tasks route to handle image upload
app.post("/tasks", upload.single("image"), (req, res) => {
  const { title, description, priority, due_date } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null; // Save image path if uploaded

  const sql =
    "INSERT INTO tasks (title, description, priority, due_date, image) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [title, description, priority, due_date, image],
    (err, result) => {
      if (err) {
        console.error("Error adding task:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({
        id: result.insertId,
        title,
        description,
        priority,
        due_date,
        image,
      });
    }
  );
});

// Update task route to handle image upload during update
app.put("/tasks/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { title, description, priority, due_date } = req.body;
  const image = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.existingImage; // If new image is uploaded, use it, otherwise keep existing

  const sql =
    "UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, image = ? WHERE id = ?";
  db.query(
    sql,
    [title, description, priority, due_date, image, id],
    (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ id, title, description, priority, due_date, image });
    }
  );
});
