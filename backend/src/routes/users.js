import { Router } from 'express';
import { createUser, listUsers, deleteUser } from '../controllers/userController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';
const router = Router();
router.post('/', authMiddleware, authorizeRoles('admin','manager'), createUser);
router.get('/', authMiddleware, authorizeRoles('admin','manager'), listUsers);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);
export default router;
