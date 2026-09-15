-- Stage 4: SQLite exploration

-- 1. View all tasks
SELECT * FROM tasks;

-- 2. Find completed tasks
SELECT * FROM tasks WHERE done = 1;

-- 3. Count all tasks
SELECT COUNT(*) AS total_tasks FROM tasks;

-- 4. Mark all tasks as completed
UPDATE tasks
SET done = 1;

-- 5. Delete completed tasks
DELETE FROM tasks
WHERE done = 1;