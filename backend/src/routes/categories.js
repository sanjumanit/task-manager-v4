import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
const router = Router();
router.get('/', authMiddleware, listCategories);
router.post('/', authMiddleware, adminOnly, createCategory);
router.put('/:id', authMiddleware, adminOnly, updateCategory);
router.delete('/:id', authMiddleware, adminOnly, deleteCategory);
export default router;
