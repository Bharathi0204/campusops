import { Request, Response } from 'express';
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from '../services/courseService';
import { validateCourse } from '../validators/courseValidator';

const parseId = (value: string | string[]): number | null => {
  const idValue = Array.isArray(value) ? value[0] : value;

  const id = Number(idValue);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

export const getCoursesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );
    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : '';

    const result = await getCourses({
      page,
      limit,
      search,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Get courses error:', error);

    res.status(500).json({
      message: 'Failed to load courses',
    });
  }
};

export const getCourseByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      res.status(400).json({
        message: 'Invalid course ID',
      });
      return;
    }

    const course = await getCourseById(id);

    if (!course) {
      res.status(404).json({
        message: 'Course not found',
      });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Get course error:', error);

    res.status(500).json({
      message: 'Failed to load course',
    });
  }
};

export const createCourseController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = validateCourse(req.body);

    if (!validation.valid) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const { code, name, credits } = req.body;

    try {
      const course = await createCourse(
        code.trim(),
        name.trim(),
        credits
      );

      res.status(201).json({
        message: 'Course created successfully',
        course,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          message: 'Course code already exists',
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    console.error('Create course error:', error);

    res.status(500).json({
      message: 'Failed to create course',
    });
  }
};

export const updateCourseController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      res.status(400).json({
        message: 'Invalid course ID',
      });
      return;
    }

    const validation = validateCourse(req.body);

    if (!validation.valid) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const { code, name, credits } = req.body;

    try {
      const course = await updateCourse(
        id,
        code.trim(),
        name.trim(),
        credits
      );

      if (!course) {
        res.status(404).json({
          message: 'Course not found',
        });
        return;
      }

      res.status(200).json({
        message: 'Course updated successfully',
        course,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          message: 'Course code already exists',
        });
        return;
      }

      throw error;
    }
  } catch (error) {
    console.error('Update course error:', error);

    res.status(500).json({
      message: 'Failed to update course',
    });
  }
};

export const deleteCourseController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      res.status(400).json({
        message: 'Invalid course ID',
      });
      return;
    }

    const course = await deleteCourse(id);

    if (!course) {
      res.status(404).json({
        message: 'Course not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Course deleted successfully',
      course,
    });
  } catch (error) {
    console.error('Delete course error:', error);

    res.status(500).json({
      message: 'Failed to delete course',
    });
  }
};