import express from 'express';

import { asyncHandler } from '../middleware/errors.js';
import { createEmployee, listEmployees } from '../services/payrollService.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ employees: await listEmployees() });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const employee = await createEmployee(req.body);
    res.status(201).json({ employee });
  }),
);

export default router;
