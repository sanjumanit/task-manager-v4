import db from '../models/db.js';
import bcrypt from 'bcryptjs';

// ✅ Password policy validator
function validatePassword(password, name = "", email = "") {
  // At least 8 chars, one uppercase, one lowercase, one number, one special char
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // ❌ List of very common weak passwords
  const weakPasswords = [
    "password",
    "password123",
    "123456",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty",
    "abc123",
    "admin",
    "letmein",
    "welcome",
    "iloveyou",
    "monkey",
    "dragon",
    "test123",
    "passw0rd",
  ];

  // Normalize
  const pwdLower = password.toLowerCase();
  const nameLower = (name || "").toLowerCase();
  const emailLower = (email || "").toLowerCase();

  if (weakPasswords.includes(pwdLower)) {
    return {
      valid: false,
      message: "Password is too common. Please choose a stronger one.",
    };
  }

  if (pwdLower.includes(nameLower) && nameLower.length > 0) {
    return {
      valid: false,
      message: "Password cannot contain your username.",
    };
  }

  if (emailLower.length > 0) {
    const emailPart = emailLower.split("@")[0]; // just check before @
    if (pwdLower.includes(emailPart)) {
      return {
        valid: false,
        message: "Password cannot contain your email.",
      };
    }
  }

  if (!regex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
    };
  }

  return { valid: true };
}

// Create user (admin)
export async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "name, email, password, role required" });
  }

  // ✅ Strong + common + username/email checks
  const check = validatePassword(password, name, email);
  if (!check.valid) {
    return res.status(400).json({ message: check.message });
  }

  try {
    // ✅ Check if email already exists
    const existing = await db.get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(400).json({ message: "Email already exists. Please use another." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role]
    );
    res.json({ message: "User created" });
  } catch (e) {
    console.error("User create error:", e);
    res.status(500).json({ message: "User create failed", error: e.message });
  }
}

// List users
export async function listUsers(req, res) {
  const users = await db.all("SELECT id, name, email, role FROM users");
  res.json(users);
}

// Delete user (admin only)
export async function deleteUser(req, res) {
  const { id } = req.params;
  await db.run("DELETE FROM users WHERE id=?", [id]);
  res.json({ message: "User deleted" });
}

// ✅ Self change password
export async function changeOwnPassword(req, res) {
  const userId = req.user.id; // from authMiddleware
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old and new password required" });
  }

  const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ Strong + username/email check
  const check = validatePassword(newPassword, user.name, user.email);
  if (!check.valid) {
    return res.status(400).json({ message: check.message });
  }

  try {
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid)
      return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Password change error:", e);
    res.status(500).json({ message: "Error changing password" });
  }
}

// ✅ Admin reset password
export async function resetPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password required" });
  }

  const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ Strong + username/email check
  const check = validatePassword(newPassword, user.name, user.email);
  if (!check.valid) {
    return res.status(400).json({ message: check.message });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);

    res.json({ message: "Password reset successfully by admin" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
}

