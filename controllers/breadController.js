const pool = require("../config/db");

// ✅ Create bread
exports.createBread = async (req, res) => {
  try {
    const { bread_description, price, category, case_type } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO bread (bread_description, price, photo, category, case_type) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [bread_description, price, photo, category, case_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all breads
exports.getBreads = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bread ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get bread by ID
exports.getBreadById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bread WHERE id=$1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bread not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update bread
exports.updateBread = async (req, res) => {
  try {
    const { bread_description, price, category, case_type } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await pool.query(
      `UPDATE bread 
       SET bread_description=$1, price=$2, 
           photo=COALESCE($3, photo), 
           category=$4, case_type=$5,
           updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [bread_description, price, photo, category, case_type, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bread not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete bread
exports.deleteBread = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM bread WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Bread not found" });
    }

    res.json({ message: "Bread deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
