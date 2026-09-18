# Task API

A RESTful CRUD API built using Node.js, Express, and PostgreSQL, containerized with Docker Compose.

## Description

This project provides a Task CRUD API with PostgreSQL as the database.

The application and PostgreSQL database can be started together using Docker Compose.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Docker
- Docker Compose

## Database

PostgreSQL database:

- Database: `tasks`
- User: `postgres`
- Port: `5432`

The `tasks` table contains:

- `id` - SERIAL PRIMARY KEY
- `title` - TEXT NOT NULL
- `done` - BOOLEAN DEFAULT FALSE

The application creates the table automatically if it does not exist.

If the table is empty, 3 seed tasks are created automatically.

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks