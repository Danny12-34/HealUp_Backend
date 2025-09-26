const pool = require("../config/db");

// Get all cases
exports.getAllCases = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cases ORDER BY case_id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get case by ID
exports.getCaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM cases WHERE case_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a case
exports.createCase = async (req, res) => {
  const { case_name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO cases (case_name) VALUES ($1) RETURNING *",
      [case_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a case
exports.updateCase = async (req, res) => {
  const { id } = req.params;
  const { case_name } = req.body;

  try {
    const result = await pool.query(
      "UPDATE cases SET case_name = $1 WHERE case_id = $2 RETURNING *",
      [case_name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a case
exports.deleteCase = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM cases WHERE case_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json({ message: "Case deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
