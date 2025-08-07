const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World! This is a basic Express server.');
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});