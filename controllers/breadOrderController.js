const pool = require('../config/db');

// Get all bread orders
const getBreadOrders = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bread_orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Create a bread order
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
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};



// Update bread order status
const updateBreadOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Complete", "Canceled"].includes(status)) {
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

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};


// Delete a bread order
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
