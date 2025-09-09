import db from '../models/db.js';

async function logHistory(taskId, action, userId, meta = {}) {
  await db.run(
    'INSERT INTO task_history (taskId, action, userId, timestamp, meta) VALUES (?,?,?,?,?)',
    [taskId, action, userId, new Date().toISOString(), JSON.stringify(meta)]
  );
}

/**
 * Create task — supports assignee by email
 */
export async function createTask(req, res) {
  const { title, description, priority, dueDate, assigneeEmail, categoryId } = req.body;
  let assigneeId = null;

  if (assigneeEmail) {
    const user = await db.get(`SELECT id FROM users WHERE email = ?`, [assigneeEmail]);
    if (!user) return res.status(400).json({ message: 'Assignee not found' });
    assigneeId = user.id;
  }

  const { lastID } = await db.run(
    `INSERT INTO tasks (title, description, priority, status, dueDate, assigneeId, createdBy, categoryId)
     VALUES (?, ?, ?, 'open', ?, ?, ?, ?)`,
    [title, description || '', priority, dueDate || null, assigneeId, req.user.id, categoryId || null]
  );

  await logHistory(lastID, 'Task created', req.user.id, { priority, assigneeId, categoryId });

  res.json({ id: lastID, message: 'Task created' });
}

/**
 * List tasks — returns assignee name + email + category
 */
export async function listTasks(req, res) {
  const isMember = req.user.role === 'member';
  const params = [];
  const where = [];

  if (isMember) {
    where.push('t.assigneeId = ?');
    params.push(req.user.id);
  }

  const sql = `
    SELECT t.*, 
           u.name AS assigneeName, 
           u.email AS assigneeEmail, 
           c.name AS categoryName
    FROM tasks t
    LEFT JOIN users u ON t.assigneeId = u.id
    LEFT JOIN categories c ON t.categoryId = c.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY t.id DESC
  `;

  const rows = await db.all(sql, params);
  res.json(rows);
}

/**
 * Update task status
 */
export async function updateTaskStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  await logHistory(id, `Status changed to ${status}`, req.user.id);

  res.json({ message: 'Status updated' });
}

/**
 * Reassign task — now supports email
 */
export async function reassignTask(req, res) {
  const { id } = req.params;
  const { assigneeId, assigneeEmail } = req.body;

  let finalAssigneeId = null;

  if (assigneeEmail) {
    const user = await db.get(`SELECT id FROM users WHERE email = ?`, [assigneeEmail]);
    if (!user) return res.status(400).json({ message: 'Assignee not found' });
    finalAssigneeId = user.id;
  } else if (assigneeId) {
    finalAssigneeId = assigneeId;
  }

  await db.run('UPDATE tasks SET assigneeId = ? WHERE id = ?', [finalAssigneeId, id]);
  await logHistory(id, 'Reassigned', req.user.id, { assigneeId: finalAssigneeId });

  res.json({ message: 'Reassigned' });
}

/**
 * Task history
 */
export async function getTaskHistory(req, res) {
  const { id } = req.params;
  const rows = await db.all(
    `SELECT th.*, u.name as performedByName 
     FROM task_history th 
     LEFT JOIN users u ON th.userId = u.id 
     WHERE taskId = ? 
     ORDER BY timestamp DESC`,
    [id]
  );
  res.json(rows);
}

/**
 * Summary report: status / priority / category counts
 */
export async function summaryReport(req, res) {
  const isMember = req.user.role === 'member';
  const params = [];
  const where = [];

  if (isMember) {
    where.push('assigneeId = ?');
    params.push(req.user.id);
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const statusCounts = await db.all(
    `SELECT status, COUNT(*) as count FROM tasks ${whereSql} GROUP BY status`,
    params
  );

  const priorityCounts = await db.all(
    `SELECT priority, COUNT(*) as count FROM tasks ${whereSql} GROUP BY priority`,
    params
  );

  const categoryCounts = await db.all(
    `SELECT c.name as category, COUNT(*) as count 
     FROM tasks t 
     LEFT JOIN categories c ON t.categoryId = c.id 
     ${whereSql} 
     GROUP BY t.categoryId`,
    params
  );

 const categoryStatusCounts = await db.all(`
  SELECT c.name as category, t.status, COUNT(*) as count
  FROM tasks t
  LEFT JOIN categories c ON t.categoryId = c.id
  ${whereSql}
  GROUP BY t.categoryId, t.status
`, params);

res.json({
  statusCounts,
  priorityCounts,
  categoryCounts,
  categoryStatusCounts
});
}




