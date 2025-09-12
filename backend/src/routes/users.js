import { Router } from 'express';
import { createUser, listUsers, deleteUser, resetPassword, changeOwnPassword } from '../controllers/userController.js';
import { authMiddleware, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, authorizeRoles('admin', 'manager'), createUser);
router.get('/', authMiddleware, authorizeRoles('admin', 'manager'), listUsers);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUser);

// admin reset password for others
router.put('/:id/password', authMiddleware, authorizeRoles('admin','manager'), resetPassword);

// self change password
router.put('/me/password', authMiddleware, changeOwnPassword);

export default router;
