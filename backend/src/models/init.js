import db from "./db.js";

export async function initDB() {
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','manager','member'))
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL CHECK(priority IN ('low','medium','high')),
      status TEXT NOT NULL CHECK(status IN ('open','in-progress','completed')),
      dueDate TEXT,
      assigneeId INTEGER,
      createdBy INTEGER,
      category TEXT,
      FOREIGN KEY (assigneeId) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS task_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskId INTEGER NOT NULL,
      action TEXT NOT NULL,
      userId INTEGER,
      timestamp TEXT NOT NULL,
      meta TEXT,
      FOREIGN KEY (taskId) REFERENCES tasks(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // seed default admin and sample users/tasks if not present
  const admin = await db.get("SELECT * FROM users WHERE role='admin'");
  if (!admin) {
    const { default: bcrypt } = await import("bcryptjs");
    const hashed = await bcrypt.hash("admin123", 10);
    await db.run("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
      ["Admin User", "admin@example.com", hashed, "admin"]);
    // add sample managers and members
    const hashed2 = await bcrypt.hash("manager123", 10);
    const hashed3 = await bcrypt.hash("member123", 10);
    await db.run("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)", ["Manager One", "manager1@example.com", hashed2, "manager"]);
    await db.run("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)", ["Member One", "member1@example.com", hashed3, "member"]);
    await db.run("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)", ["Member Two", "member2@example.com", hashed3, "member"]);
    // create sample tasks
    const res1 = await db.run("INSERT INTO tasks (title, description, priority, status, dueDate, assigneeId, createdBy, category) VALUES (?,?,?,?,?,?,?,?)",
      ["Fix login bug", "Fix redirect after login", "high", "open", null, 3, 2, "bug"]);
    await db.run("INSERT INTO task_history (taskId, action, userId, timestamp, meta) VALUES (?,?,?,?,?)", [res1.lastID, "created", 2, new Date().toISOString(), JSON.stringify({})]);
    const res2 = await db.run("INSERT INTO tasks (title, description, priority, status, dueDate, assigneeId, createdBy, category) VALUES (?,?,?,?,?,?,?,?)",
      ["Add reports", "Add category reports to dashboard", "medium", "in-progress", null, 4, 2, "feature"]);
    await db.run("INSERT INTO task_history (taskId, action, userId, timestamp, meta) VALUES (?,?,?,?,?)", [res2.lastID, "created", 2, new Date().toISOString(), JSON.stringify({})]);
    console.log("Seeded admin, manager, members, and example tasks");
  }
}
