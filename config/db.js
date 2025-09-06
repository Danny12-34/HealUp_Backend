const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',          // <-- your PostgreSQL username
    host: 'localhost',
    database: 'healupdb',
    password: 'Danny1234@',    // <-- your PostgreSQL password
    port: 5432,
});

module.exports = pool;
