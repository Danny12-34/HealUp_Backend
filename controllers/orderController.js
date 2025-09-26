const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Get all orders with product name
const getOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, p.product_name
            FROM orders o
            LEFT JOIN product p ON o.product_id = p.product_id
            ORDER BY o.order_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get single order by ID
const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT o.*, p.product_name
            FROM orders o
            LEFT JOIN product p ON o.product_id = p.product_id
            WHERE o.order_id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Order not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create order and send email
const createOrder = async (req, res) => {
    const { product_id, quantity, total_price, customer_name, customer_email, customer_phone, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO orders (product_id, quantity, total_price, customer_name, customer_email, customer_phone, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [product_id, quantity, total_price, customer_name, customer_email, customer_phone, status || 'Pending']
        );

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer_email,
            subject: `Order Confirmation - HealUp`,
            html: `
                <h2>Hello ${customer_name},</h2>
                <p>Your order <strong>#${result.rows[0].order_id}</strong> has been placed successfully!</p>
                <p><strong>Product ID:</strong> ${product_id}</p>
                <p><strong>Quantity:</strong> ${quantity}</p>
                <p><strong>Total Price:</strong> $${total_price}</p>
                <p><strong>Status:</strong> ${status || 'Pending'}</p>
                <br/>
                <p>Thank you for shopping with HealUp!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Update order and optionally notify via email
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { quantity, total_price, customer_name, customer_email, customer_phone, status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE orders SET 
                quantity = $1, 
                total_price = $2, 
                customer_name = $3, 
                customer_email = $4, 
                customer_phone = $5, 
                status = $6,
                updated_at = NOW()
             WHERE order_id = $7 RETURNING *`,
            [quantity, total_price, customer_name, customer_email, customer_phone, status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Order not found" });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer_email,
            subject: `Order Update - HealUp`,
            html: `
                <h2>Hello ${customer_name},</h2>
                <p>Your order <strong>#${result.rows[0].order_id}</strong> has been updated.</p>
                <p><strong>Quantity:</strong> ${quantity}</p>
                <p><strong>Total Price:</strong> $${total_price}</p>
                <p><strong>Status:</strong> ${status}</p>
                <br/>
                <p>Thank you for shopping with HealUp!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Delete order
const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};
