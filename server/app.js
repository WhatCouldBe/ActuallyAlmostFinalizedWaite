require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const routes = require('./routes');

connectDB();

const app = express();

// Increase JSON and URL-encoded payload size limits to 50MB
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'someSecretKey',
    resave: false,
    saveUninitialized: false,
  })
);

/*******************************************
 * OPTIONAL: Content Security Policy
 *******************************************/
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' https:; object-src 'none';"
  );
  next();
});

// Routes
app.use('/', routes);

// Serve React build folder
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = app;
