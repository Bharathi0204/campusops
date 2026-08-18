import { Router } from 'express';
import {
  createCourseController,
  deleteCourseController,
  getCourseByIdController,
  getCoursesController,
  updateCourseController,
} from '../controllers/courseController';

const router = Router();

router.get('/', getCoursesController);
router.get('/:id', getCourseByIdController);
router.post('/', createCourseController);
router.put('/:id', updateCourseController);
router.delete('/:id', deleteCourseController);

export default router;