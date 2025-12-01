const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
