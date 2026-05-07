import express from 'express';

import { asyncHandler } from '../middleware/errors.js';
import {
  createSalary,
  deleteSalary,
  getSalary,
  listSalaries,
  updateSalary,
} from '../services/payrollService.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ salaries: await listSalaries(req.query) });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ salary: await getSalary(req.params.id) });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const salary = await createSalary(req.body);
    res.status(201).json({ salary });
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ salary: await updateSalary(req.params.id, req.body) });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ salary: await deleteSalary(req.params.id) });
  }),
);

export default router;
