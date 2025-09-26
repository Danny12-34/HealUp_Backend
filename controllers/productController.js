const pool = require('../config/db');

// Get all products
const getProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product ORDER BY product_id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single product by ID
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM product WHERE product_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create product
const createProduct = async (req, res) => {
    const { product_name, description, price, category } = req.body;
    const image = req.file ? req.file.filename : null; // Save uploaded file name

    try {
        const result = await pool.query(
            `INSERT INTO product (product_name, description, price, image, category)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [product_name, description, price, image, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update product
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { product_name, description, price, category } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const query = `
            UPDATE product 
            SET product_name = $1, description = $2, price = $3, category = $4
            ${image ? ', image = $5' : ''}, updated_at = NOW()
            WHERE product_id = $6
            RETURNING *
        `;

        const values = image
            ? [product_name, description, price, category, image, id]
            : [product_name, description, price, category, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
