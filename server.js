const express = require('express');
const cors = require('cors');
const path = require('path'); // For serving static files

const app = express();

// ---------------- Middleware ----------------
app.use(cors({ origin: 'http://localhost:3000' })); // Allow React frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------- Routes ----------------
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const nutritionTipsRoutes = require('./routes/nutritionTipsRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/nutrition-tips', nutritionTipsRoutes);

// ---------------- Default Route ----------------
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
