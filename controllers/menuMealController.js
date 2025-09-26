const pool = require('../config/db');

// ✅ Get all meals
exports.getMeals = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_meal ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get meal by ID
exports.getMealById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_meal WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Meal not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create meal
exports.createMeal = async (req, res) => {
  try {
    const { product_name, description, price,category,cases} = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO menu_meal (product_name, description, price,category,cases, photo) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_name, description, price,category,cases, photo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update meal
exports.updateMeal = async (req, res) => {
  try {
    const { product_name, description, price,category,cases } = req.body;
    const photo = req.file ? req.file.filename : req.body.photo;

    const result = await pool.query(
      `UPDATE menu_meal SET product_name=$1, description=$2, price=$3,category=$4,cases=$5, photo=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [product_name, description, price,category,cases, photo, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Meal not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete meal
exports.deleteMeal = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM menu_meal WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Meal not found" });

    res.json({ message: "Meal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
