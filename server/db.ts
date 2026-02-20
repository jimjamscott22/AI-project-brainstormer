import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST || 'localhost',
  port: parseInt(process.env.MARIADB_PORT || '3306', 10),
  user: process.env.MARIADB_USER || 'root',
  password: process.env.MARIADB_PASSWORD || '',
  database: process.env.MARIADB_DATABASE || 'project_brainstormer',
  connectionLimit: 5,
});

export default pool;
