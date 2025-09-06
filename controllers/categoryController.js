const pool = require('../config/db');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Category not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create category
const createCategory = async (req, res) => {
    const { category_name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categories (category_name) VALUES ($1) RETURNING *',
            [category_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update category
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category_name } = req.body;
    try {
        const result = await pool.query(
            'UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING *',
            [category_name, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Category not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
