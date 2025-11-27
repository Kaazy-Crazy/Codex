const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// In-memory task storage for demo purposes
let tasks = [];
let nextId = 1;

const findTask = (id) => tasks.find((task) => task.id === id);

app.get('/api/status', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    taskCount: tasks.length,
  });
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { text, category = 'general' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'テキストを入力してください。' });
  }

  const task = {
    id: nextId++,
    text: text.trim(),
    category,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = findTask(id);

  if (!task) {
    return res.status(404).json({ error: 'タスクが見つかりません。' });
  }

  const { text, completed, category } = req.body;
  if (typeof text === 'string') task.text = text.trim();
  if (typeof completed === 'boolean') task.completed = completed;
  if (typeof category === 'string') task.category = category;

  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const initialLength = tasks.length;
  tasks = tasks.filter((task) => task.id !== id);

  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'タスクが見つかりません。' });
  }

  res.status(204).send();
});

app.delete('/api/tasks', (req, res) => {
  const { completedOnly } = req.query;

  if (completedOnly === 'true') {
    tasks = tasks.filter((task) => !task.completed);
  } else {
    tasks = [];
  }

  res.status(204).send();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
