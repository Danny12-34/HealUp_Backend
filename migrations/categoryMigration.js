const pool = require('../config/db');

const createTables = async () => {
    try {
        // 1️⃣ Create Categories table
        const createCategoriesQuery = `
        CREATE TABLE IF NOT EXISTS categories (
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(255) NOT NULL,
            category_image TEXT;
        )`;
        await pool.query(createCategoriesQuery);
        console.log("✅ Categories table created successfully!");

        // 2️⃣ Create Product table
        const createProductQuery = `
        CREATE TABLE IF NOT EXISTS product (
            product_id SERIAL PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            image VARCHAR(255),
            category VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`;
        await pool.query(createProductQuery);
        console.log("✅ Product table created successfully!");

        // 3️⃣ Create Orders table
        const createOrdersQuery = `
        CREATE TABLE IF NOT EXISTS orders (
            order_id SERIAL PRIMARY KEY,
            quantity INT NOT NULL,
            total_price DECIMAL(10,2),
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255),
            customer_phone VARCHAR(20),
            status VARCHAR(50) DEFAULT 'Pending',
            order_date TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`;
        await pool.query(createOrdersQuery);
        console.log("✅ Orders table created successfully!");

        // 4️⃣ Create Nutrition Tips table
        const createNutritionTipsQuery = `
        CREATE TABLE IF NOT EXISTS nutrition_tips (
            tip_id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )`;
        await pool.query(createNutritionTipsQuery);
        console.log("✅ Nutrition Tips table created successfully!");

    } catch (error) {
        console.error("❌ Error creating tables:", error);
    } finally {
        pool.end();
    }
};

createTables();
