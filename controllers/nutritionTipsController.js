const pool = require('../config/db');

// Get all nutrition tips
const getAllTips = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM nutrition_tips ORDER BY tip_id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single tip by ID
const getTipById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM nutrition_tips WHERE tip_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Tip not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new tip
const createTip = async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO nutrition_tips (title, content) VALUES ($1, $2) RETURNING *',
            [title, content || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a tip
const updateTip = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            `UPDATE nutrition_tips 
             SET title = $1, content = $2,  updated_at = NOW()
             WHERE tip_id = $3 RETURNING *`,
            [title, content || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Tip not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a tip
const deleteTip = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM nutrition_tips WHERE tip_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Tip not found" });
        res.json({ message: "Tip deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllTips,
    getTipById,
    createTip,
    updateTip,
    deleteTip
};
