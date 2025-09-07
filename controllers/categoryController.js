const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// -------------------- Multer config -------------------- //
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // folder to save images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// -------------------- CRUD Operations -------------------- //

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

// Create category with optional image
const createCategory = async (req, res) => {
    const { category_name, descrition } = req.body;
    const category_image = req.file ? req.file.filename : null;

    console.log('Creating category:', req.body, req.file);

    try {
        const result = await pool.query(
            'INSERT INTO categories (category_name, category_image, descrition) VALUES ($1, $2, $3) RETURNING *',
            [category_name, category_image, descrition]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update category with optional image replacement
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { category_name, descrition } = req.body;
    const category_image = req.file ? req.file.filename : null;

    console.log('Updating category:', req.body, req.file);

    try {
        // Get old image
        const old = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
        if (old.rows.length === 0) return res.status(404).json({ message: "Category not found" });

        // Delete old image if new image uploaded
        if (category_image && old.rows[0].category_image) {
            const oldPath = path.join(__dirname, '../uploads', old.rows[0].category_image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const result = await pool.query(
            'UPDATE categories SET category_name = $1, category_image = COALESCE($2, category_image), descrition = $3 WHERE category_id = $4 RETURNING *',
            [category_name, category_image, descrition, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Get image to delete
        const old = await pool.query('SELECT category_image FROM categories WHERE category_id = $1', [id]);
        if (old.rows.length === 0) return res.status(404).json({ message: "Category not found" });

        if (old.rows[0].category_image) {
            const oldPath = path.join(__dirname, '../uploads', old.rows[0].category_image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        await pool.query('DELETE FROM categories WHERE category_id = $1', [id]);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export controller and multer upload middleware
module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    upload,
};
