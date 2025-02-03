require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./app');

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
