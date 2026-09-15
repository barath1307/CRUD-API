const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
const Database = require("better-sqlite3");

const db = new Database("tasks.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
    )
`).run();

const taskCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (taskCount.count === 0) {
    const insertTask = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    insertTask.run("Learn Express", 0);
    insertTask.run("Build CRUD API", 0);
    insertTask.run("Push to GitHub", 0);
}

// In-memory task list
let tasks = [
    {
        id: 1,
        title: "Learn Express",
        done: false
    },
    {
        id: 2,
        title: "Build CRUD API",
        done: false
    },
    {
        id: 3,
        title: "Push to GitHub",
        done: false
    }
];

// Root Endpoint
app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: [
            "/tasks"
        ]
    });
});

// Health Endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

// Get all tasks
app.get("/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks").all();

    res.json(
        tasks.map(task => ({
            id: task.id,
            title: task.title,
            done: Boolean(task.done)
        }))
    );
});

// Get task by ID
app.get("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.json({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    });
});

// Create a new task
app.post("/tasks", (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const result = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(title, 0);

const newTask = {
    id: result.lastInsertRowid,
    title: title,
    done: false
};

    res.status(201).json(newTask);
});

// Update a task
app.put("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const { title, done } = req.body;

    if (title !== undefined && title.trim() === "") {
        return res.status(400).json({
            error: "Title cannot be empty"
        });
    }

    const updatedTitle = title !== undefined ? title : task.title;
    const updatedDone = done !== undefined ? (done ? 1 : 0) : task.done;

    db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?
        WHERE id = ?
    `).run(updatedTitle, updatedDone, id);

    res.json({
        id: id,
        title: updatedTitle,
        done: Boolean(updatedDone)
    });
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

    res.status(204).send();
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});