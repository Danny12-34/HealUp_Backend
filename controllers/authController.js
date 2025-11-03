const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------------- CREATE USER (SIGNUP) ----------------------
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, is_verified, role) VALUES ($1, $2, $3, $4, $5)",
      [name, email, hashed, false, role || "client"]
    );

    res.status(201).json({ message: "User created successfully. Please login to receive OTP." });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- READ USERS ----------------------
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, is_verified FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT id, name, email, role, is_verified FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- UPDATE USER ----------------------
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, is_verified } = req.body;

  try {
    let hashed = null;
    if (password) hashed = await bcrypt.hash(password, 10);

    const query = `
      UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      password = COALESCE($3, password),
      role = COALESCE($4, role),
      is_verified = COALESCE($5, is_verified)
      WHERE id = $6
      RETURNING id, name, email, role, is_verified
    `;

    const result = await pool.query(query, [name, email, hashed, role, is_verified, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- DELETE USER ----------------------
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- LOGIN & SEND OTP ----------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    await pool.query("UPDATE users SET otp = $1 WHERE email = $2", [otp, email]);

    // Send OTP via email
    await transporter.sendMail({
      from: `"MyApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for login",
      text: `Your OTP for login is: ${otp}`,
    });

    res.json({ message: "Login successful. Check your email for OTP." });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- VERIFY OTP ----------------------
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];
    if (user.otp == otp) {
      await pool.query("UPDATE users SET is_verified = true, otp = NULL WHERE email = $1", [email]);
      res.json({
        message: "OTP verified. Login complete!",
        user: { id: user.id, email: user.email, role: user.role },
      });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
