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

// ✅ Get all orders with product name
const getOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, p.product_name
            FROM orders o
            LEFT JOIN product p ON o.product_id = p.product_id
            ORDER BY o.order_id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Get single order
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

// ✅ Create Order + Send Email
const createOrder = async (req, res) => {
    const { product_id, quantity, total_price, customer_name, customer_email, customer_phone } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO orders (product_id, quantity, total_price, customer_name, customer_email, customer_phone, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING *`,
            [product_id, quantity, total_price, customer_name, customer_email, customer_phone]
        );

        const order = result.rows[0];

        // ✅ Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer_email,
            subject: "Order Confirmation - HealUp",
            html: `
                <h2>Hello ${customer_name},</h2>
                <p>Thank you for ordering from HealUp 🥖</p>
                <p>Your order <strong>#${order.order_id}</strong> has been placed!</p>
                <p><strong>Status:</strong> Pending</p>
                <br/>
                <p>We will notify you once it's ready! ✅</p>
                <p>HealUp Team ❤️</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json(order);
    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Update Order + Send Email
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

        const order = result.rows[0];

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customer_email,
            subject: "Order Updated - HealUp",
            html: `
                <h2>Hello ${customer_name},</h2>
                <p>Your order <strong>#${order.order_id}</strong> has been updated.</p>
                <p><strong>Status:</strong> ${status}</p>
                <br/>
                <p>Thanks for staying with HealUp! ❤️</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json(order);
    } catch (err) {
        console.error("Update Order Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Update ONLY status + Send Email
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Complete", "Accepted", "Rejected","Canceled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    try {
        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Order not found" });

        const order = result.rows[0];

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.customer_email,
            subject: "Order Status Update - HealUp",
            html: `
                <h2>Hello ${order.customer_name},</h2>
                <p>Your order <strong>#${order.order_id}</strong> has a new status:</p>
                <p><strong>${status}</strong></p>
                ${
                    status === "Complete"
                    ? "<p>Your items are ready! ✅</p>"
                    : status === "Canceled"
                    ? "<p>We are sorry, your order was canceled. ❌</p>"
                    : ""
                }
                <br/>
                <p>HealUp Team ❤️</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json(order);
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ Delete an order
const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM orders WHERE order_id = $1 RETURNING *", [id]);

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
    updateOrderStatus,
    deleteOrder
};
