const express = require("express");

const app = express();

const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

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

// Get one task by ID
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});