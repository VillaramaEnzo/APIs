const express = require('express');
const storesRoutes = require('./routes/storeRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount routes
app.use('/stores', storesRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to BobaTime API! Use /stores to get started.');
});

app.listen(PORT, () => {
  console.log(`BobaTime API running at http://localhost:${PORT}`);
});
