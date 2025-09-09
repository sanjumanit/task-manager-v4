import db from '../models/db.js';
import bcrypt from 'bcryptjs';

// Create user
export async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, role required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role]
    );
    res.json({ message: 'User created' });
  } catch (e) {
    res.status(400).json({ message: 'User create failed', error: e.message });
  }
}

// List users
export async function listUsers(req, res) {
  const users = await db.all('SELECT id, name, email, role FROM users');
  res.json(users);
}

// Delete user
export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(400).json({ message: 'User delete failed', error: e.message });
  }
}

// Reset / Set password
export async function resetPassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    res.json({ message: 'Password updated' });
  } catch (e) {
    res.status(400).json({ message: 'Password reset failed', error: e.message });
  }
}

