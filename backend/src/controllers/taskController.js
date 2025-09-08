import db from "../models/db.js";

async function logHistory(taskId, action, userId, meta = {}) {
  await db.run(
    "INSERT INTO task_history (taskId, action, userId, timestamp, meta) VALUES (?,?,?,?,?)",
    [taskId, action, userId, new Date().toISOString(), JSON.stringify(meta)]
  );
}

export async function createTask(req, res) {
  const { title, description, priority, dueDate, assigneeId, category } = req.body;
  const { lastID } = await db.run(
    "INSERT INTO tasks (title, description, priority, status, dueDate, assigneeId, createdBy, category) VALUES (?,?,?,?,?,?,?,?)",
    [title, description || "", priority, "open", dueDate || null, assigneeId || null, req.user.id, category || null]
  );
  await logHistory(lastID, "Task created", req.user.id, { priority, assigneeId, category });
  res.json({ id: lastID, message: "Task created" });
}

export async function listTasks(req, res) {
  const isMember = req.user.role === "member";
  const params = [];
  const where = [];

  if (isMember) {
    where.push("tasks.assigneeId = ?");
    params.push(req.user.id);
  }

  const sql = `
    SELECT tasks.*, u.name as assigneeName, u.email as assigneeEmail
    FROM tasks
    LEFT JOIN users u ON tasks.assigneeId = u.id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY tasks.id DESC
  `;
  const rows = await db.all(sql, params);
  res.json(rows);
}

export async function updateTaskStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  await db.run("UPDATE tasks SET status=? WHERE id=?", [status, id]);
  await logHistory(id, `Status changed to ${status}`, req.user.id);
  res.json({ message: "Status updated" });
}

export async function reassignTask(req, res) {
  const { id } = req.params;
  const { assigneeId } = req.body;
  await db.run("UPDATE tasks SET assigneeId=? WHERE id=?", [assigneeId, id]);
  await logHistory(id, "Reassigned", req.user.id, { assigneeId });
  res.json({ message: "Reassigned" });
}

export async function getTaskHistory(req, res) {
  const { id } = req.params;
  const rows = await db.all("SELECT * FROM task_history WHERE taskId=? ORDER BY timestamp DESC", [id]);
  res.json(rows);
}

export async function summaryReport(req, res) {
  const isMember = req.user.role === "member";
  const params = [];
  const where = [];

  if (isMember) {
    where.push("assigneeId = ?");
    params.push(req.user.id);
  }

  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

  const statusCounts = await db.all(`SELECT status, COUNT(*) as count FROM tasks ${whereSql} GROUP BY status`, params);
  const priorityCounts = await db.all(`SELECT priority, COUNT(*) as count FROM tasks ${whereSql} GROUP BY priority`, params);
  const categoryCounts = await db.all(`SELECT category, COUNT(*) as count FROM tasks ${whereSql} GROUP BY category`, params);

  res.json({ statusCounts, priorityCounts, categoryCounts });
}
