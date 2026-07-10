import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import { getTasks, createTask, updateTask, deleteTask, reorderTasks } from '../controllers/taskController.js';

const router = Router();

router.get('/', protect, verifiedOnly, getTasks);
router.post('/', protect, verifiedOnly, createTask);
router.put('/reorder', protect, verifiedOnly, reorderTasks);
router.put('/:id', protect, verifiedOnly, updateTask);
router.delete('/:id', protect, verifiedOnly, deleteTask);

export default router;
