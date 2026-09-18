require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Initialize database
async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT FALSE
    )
  `);

  const result = await pool.query('SELECT COUNT(*) FROM tasks');

  if (parseInt(result.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done)
      VALUES
        ('Learn Express', false),
        ('Build CRUD API', false),
        ('Push to GitHub', false)
    `);
  }
}

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: [
      '/',
      '/health',
      '/tasks',
      '/tasks/:id'
    ]
  });
});

// Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY id'
    );

    res.json(
      result.rows.map(task => ({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get task by ID
app.get('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `Task ${id} not found`
      });
    }

    const task = result.rows[0];

    res.json({
      id: task.id,
      title: task.title,
      done: Boolean(task.done)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, done)
       VALUES ($1, $2)
       RETURNING *`,
      [title, false]
    );

    const task = result.rows[0];

    res.status(201).json({
      id: task.id,
      title: task.title,
      done: Boolean(task.done)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, done } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: `Task ${id} not found`
      });
    }

    const task = existing.rows[0];

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({
        error: 'Title cannot be empty'
      });
    }

    const updatedTitle = title !== undefined ? title : task.title;
    const updatedDone = done !== undefined ? Boolean(done) : task.done;

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, done = $2
       WHERE id = $3
       RETURNING *`,
      [updatedTitle, updatedDone, id]
    );

    const updatedTask = result.rows[0];

    res.json({
      id: updatedTask.id,
      title: updatedTask.title,
      done: Boolean(updatedTask.done)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const existing = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: `Task ${id} not found`
      });
    }

    await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start Server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });