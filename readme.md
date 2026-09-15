# Task API

A CRUD API built using Node.js, Express, and SQLite.

## Description

This project is the database version of the Task CRUD API.
The in-memory task list has been replaced with a real SQLite database.

## Why SQLite?

SQLite is used because it is lightweight, simple to set up, and stores
the task data permanently in a local database file.

The API uses `better-sqlite3` to connect Node.js with SQLite.

## Database

Database file:

`tasks.db`

The database is created automatically when the application starts.

The `tasks` table contains:

- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `title` - TEXT
- `done` - INTEGER (0 = false, 1 = true)

If the table is empty, the application automatically creates 3 seed tasks.

## Installation

```bash
npm install