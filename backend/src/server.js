const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Import routes
const marketplaceRoutes = require('./routes/marketplace');

// Use routes
app.use('/api/marketplace', marketplaceRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Backend service running at http://localhost:${port}`);
});
