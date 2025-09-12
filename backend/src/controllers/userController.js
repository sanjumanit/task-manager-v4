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

// Delete user (admin only)
export async function deleteUser(req, res) {
  const { id } = req.params;
  await db.run('DELETE FROM users WHERE id=?', [id]);
  res.json({ message: 'User deleted' });
}

// ✅ Self change password (user changes own password)
export async function changeOwnPassword(req, res) {
  const userId = req.user.id;  // comes from authMiddleware
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new password required' });
  }

  try {
    // fetch user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // validate old password
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: 'Old password incorrect' });

    // hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    console.error('Password change error:', e);
    res.status(500).json({ message: 'Error changing password' });
  }
}

export async function resetPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: 'New password required' });
  }

  try {
    // find user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // hash password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);

    res.json({ message: 'Password reset successfully by admin' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
}

