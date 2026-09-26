// Owner: Devesh (kurozadev05) - backend
// Connects all routes together.
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/authRoutes'));                      // public (except /me, /users)
app.use('/api/warehouses', auth, require('./routes/warehouseRoutes'));
app.use('/api/locations', auth, require('./routes/locationRoutes'));
app.use('/api/products', auth, require('./routes/productRoutes'));
app.use('/api/operations', auth, require('./routes/operationRoutes'));
app.use('/api/moves', auth, require('./routes/moveRoutes'));
app.use('/api/dashboard', auth, require('./routes/dashboardRoutes'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Any error thrown inside a controller ends up here.
app.use((err, req, res, next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong on the server' });
});

module.exports = app;
