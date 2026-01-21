const express = require('express');
const storesRoutes = require('./routes/storeRoutes');
const scrapeRoutes = require('./routes/scrapeRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount routes
app.use('/stores', storesRoutes);
app.use('/menus', menuRoutes);
app.use('/series', menuRoutes);
app.use('/drinks', menuRoutes);
app.use('/toppings', menuRoutes);
app.use('/changes', menuRoutes);
app.use('/', scrapeRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to BobaTime API! Use /stores to get started.');
});

app.listen(PORT, () => {
  console.log(`BobaTime API running at http://localhost:${PORT}`);
});
