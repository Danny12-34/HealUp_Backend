const pool = require('../config/db');
const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Function to send email to the customer
const sendEmail = async (customerEmail, order, status) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"HealUp Bread Service" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Order #${order.id} Status Update`,
        html: `
            <h3>Your Bread Order Update ✅</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Bread:</strong> ${order.bread_name}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Total Price:</strong> ${order.total_price} RWF</p>
            <p><strong>New Status:</strong> ${status}</p>
            <br/>
            <p>Thank you <strong>${order.customer_name}</strong> for choosing HealUp 🥖😊</p>
            <footer>
                <p>☎ Contact: +250 ${order.customer_phone}</p>
            </footer>
        `
    };

    await transporter.sendMail(mailOptions);
};

// ✅ Get all orders
const getBreadOrders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bread_orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Create bread order
const createBreadOrder = async (req, res) => {
    const { bread_id, bread_name, price, quantity, customer_name, customer_email, customer_phone } = req.body;
    const total_price = price * quantity;

    try {
        const result = await pool.query(
            `INSERT INTO bread_orders 
            (bread_id, bread_name, price, quantity, total_price, customer_name, customer_email, customer_phone, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Pending') RETURNING *`,
            [bread_id, bread_name, price, quantity, total_price, customer_name, customer_email, customer_phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Update status + send email to customer
const updateBreadOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Complete", "Accepted"], "Rejected", "Canceled".includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    try {
        const result = await pool.query(
            `UPDATE bread_orders SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = result.rows[0];

        // ✅ Send email directly to customer
        await sendEmail(order.customer_email, order, status);

        res.json(order);
    } catch (err) {
        console.error("Error sending email:", err.message);
        res.status(500).json({ error: "Status updated but email failed" });
    }
};

// ✅ Delete order
const deleteBreadOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM bread_orders WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getBreadOrders,
    createBreadOrder,
    deleteBreadOrder,
    updateBreadOrderStatus
};
