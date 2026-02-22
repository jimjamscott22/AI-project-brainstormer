import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

const pool = mariadb.createPool({
  host: process.env.MARIADB_HOST || 'localhost',
  port: parseInt(process.env.MARIADB_PORT || '3306', 10),
  user: required('MARIADB_USER'),
  password: required('MARIADB_PASSWORD'),
  database: process.env.MARIADB_DATABASE || 'project_brainstormer',
  connectionLimit: 5,
});

export default pool;
