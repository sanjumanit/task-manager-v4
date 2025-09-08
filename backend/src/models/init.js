import db from './db.js';
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
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
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
      categoryId INTEGER,
      FOREIGN KEY (assigneeId) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id),
      FOREIGN KEY (categoryId) REFERENCES categories(id)
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
  const admin = await db.get("SELECT * FROM users WHERE role='admin'");
  if (!admin) {
    const { default: bcrypt } = await import('bcryptjs');
    const ha = await bcrypt.hash('admin123',10);
    const hm = await bcrypt.hash('manager123',10);
    const hmem = await bcrypt.hash('member123',10);
    const a = await db.run("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",['Admin User','admin@example.com',ha,'admin']);
    const m = await db.run("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",['Manager One','manager1@example.com',hm,'manager']);
    const mem1 = await db.run("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",['Member One','member1@example.com',hmem,'member']);
    const mem2 = await db.run("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",['Member Two','member2@example.com',hmem,'member']);
    const c1 = await db.run("INSERT INTO categories (name) VALUES (?)",['Bug']);
    const c2 = await db.run("INSERT INTO categories (name) VALUES (?)",['Feature']);
    const c3 = await db.run("INSERT INTO categories (name) VALUES (?)",['Improvement']);
    const t1 = await db.run("INSERT INTO tasks (title,description,priority,status,dueDate,assigneeId,createdBy,categoryId) VALUES (?,?,?,?,?,?,?,?)",
      ['Fix login redirect','Fix redirect after login','high','open',null, mem1.lastID, m.lastID, c1.lastID]);
    await db.run("INSERT INTO task_history (taskId,action,userId,timestamp,meta) VALUES (?,?,?,?,?)",[t1.lastID,'created',m.lastID,new Date().toISOString(),JSON.stringify({})]);
    const t2 = await db.run("INSERT INTO tasks (title,description,priority,status,dueDate,assigneeId,createdBy,categoryId) VALUES (?,?,?,?,?,?,?,?)",
      ['Add category report','Show counts by category','medium','in-progress',null, mem2.lastID, m.lastID, c2.lastID]);
    await db.run("INSERT INTO task_history (taskId,action,userId,timestamp,meta) VALUES (?,?,?,?,?)",[t2.lastID,'created',m.lastID,new Date().toISOString(),JSON.stringify({})]);
    console.log('Seeded users, categories, and sample tasks');
  }
}
