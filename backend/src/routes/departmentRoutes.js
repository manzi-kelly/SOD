import express from 'express';

import { asyncHandler } from '../middleware/errors.js';
import { createDepartment, listDepartments } from '../services/payrollService.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ departments: await listDepartments() });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const department = await createDepartment(req.body);
    res.status(201).json({ department });
  }),
);

export default router;
