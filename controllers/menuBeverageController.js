const pool = require('../config/db');
const path = require('path');

// ✅ Get all beverages
exports.getBeverages = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_beverage ORDER BY id DESC');
    result.rows.forEach(beverage => {
      if (beverage.photo) {
        beverage.photo_url = `${req.protocol}://${req.get('host')}/uploads/${beverage.photo}`;
      }
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get beverage by ID
exports.getBeverageById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_beverage WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Beverage not found" });
    const beverage = result.rows[0];
    if (beverage.photo) {
      beverage.photo_url = `${req.protocol}://${req.get('host')}/uploads/${beverage.photo}`;
    }
    res.json(beverage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create beverage
exports.createBeverage = async (req, res) => {
  try {
    const { product_name, description, price,category } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO menu_beverage (product_name, description, price,category photo) 
       VALUES ($1, $2, $3, $4,$5) RETURNING *`,
      [product_name, description, price,category, photo]
    );

    const beverage = result.rows[0];
    if (beverage.photo) {
      beverage.photo_url = `${req.protocol}://${req.get('host')}/uploads/${beverage.photo}`;
    }

    res.status(201).json(beverage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update beverage
exports.updateBeverage = async (req, res) => {
  try {
    const { product_name, description, price } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await pool.query(
      `UPDATE menu_beverage SET product_name=$1, description=$2, price=$3,category=$4 photo=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [product_name, description, price,category, photo, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Beverage not found" });

    const beverage = result.rows[0];
    if (beverage.photo) {
      beverage.photo_url = `${req.protocol}://${req.get('host')}/uploads/${beverage.photo}`;
    }

    res.json(beverage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete beverage
exports.deleteBeverage = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM menu_beverage WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Beverage not found" });
    res.json({ message: "Beverage deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
