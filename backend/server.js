const express = require("express");
const multer = require("multer");
const path = require("path");
const mysql = require("mysql");
const cors = require('cors'); // Import CORS

const app = express(); // Initialize Express app

// Enable CORS
app.use(cors()); // Place CORS middleware before routes

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Database connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Add your MySQL password here if you have one
  database: "task_manager", // Replace with the actual name of your database
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

// GET /tasks route to fetch all tasks
app.get("/tasks", (req, res) => {
  const sql = "SELECT * FROM tasks";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// POST /tasks route to handle image upload
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


// DELETE /tasks/:id route to delete a task by id
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  console.log("Received DELETE request for ID:", id); // Log the incoming request ID

  const sql = "DELETE FROM tasks WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      console.log("Task not found with ID:", id);
      return res.status(404).json({ error: "Task not found" });
    }

    console.log("Task deleted successfully with ID:", id);
    res.json({ message: "Task deleted successfully" });
  });
});


// PUT /tasks/:id route to handle image upload during update
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

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
