import express from 'express';

import { asyncHandler } from '../middleware/errors.js';
import { getDashboardSummary, getMonthlyPayrollReport } from '../services/payrollService.js';

const router = express.Router();

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    res.json({ summary: await getDashboardSummary() });
  }),
);

router.get(
  '/monthly-payroll',
  asyncHandler(async (req, res) => {
    res.json({ report: await getMonthlyPayrollReport(req.query.month) });
  }),
);

export default router;
