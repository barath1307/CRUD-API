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
    res.json(tasks);
});

// Get task by ID
app.get("/tasks/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    res.json(task);
});

// Create a new task
app.post("/tasks", (req, res) => {

    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
        title: title,
        done: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// Update a task
app.put("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const { title, done } = req.body;

    if (title !== undefined) {
        if (title.trim() === "") {
            return res.status(400).json({
                error: "Title cannot be empty"
            });
        }
        task.title = title;
    }

    if (done !== undefined) {
        task.done = done;
    }

    res.json(task);
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    tasks.splice(index, 1);

    res.status(204).send();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});