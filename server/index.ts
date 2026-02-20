import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import pool from './db.js';

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Save an idea
app.post('/api/ideas', async (req, res) => {
  const { title, description, priority, effort, impact, elaboration, context } = req.body;
  const id = randomUUID();

  try {
    const conn = await pool.getConnection();
    try {
      await conn.query(
        `INSERT INTO project_ideas (id, title, description, priority, effort, impact, elaboration, context)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          description || null,
          priority || null,
          effort || null,
          impact || null,
          elaboration ? JSON.stringify(elaboration) : null,
          context ? JSON.stringify(context) : null,
        ]
      );

      const [row] = await conn.query(
        'SELECT * FROM project_ideas WHERE id = ?',
        [id]
      );

      res.status(201).json({ success: true, data: formatRow(row) });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ success: false, error: 'Failed to save idea.' });
  }
});

// Get all ideas
app.get('/api/ideas', async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM project_ideas ORDER BY created_at DESC'
      );

      res.json({ success: true, data: rows.map(formatRow) });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch ideas.' });
  }
});

// Delete an idea
app.delete('/api/ideas/:id', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('DELETE FROM project_ideas WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete idea.' });
  }
});

function formatRow(row: Record<string, unknown>) {
  return {
    ...row,
    elaboration: typeof row.elaboration === 'string' ? JSON.parse(row.elaboration) : row.elaboration,
    context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context,
  };
}

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
