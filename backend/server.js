import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { connectDatabase, databaseMode } from './src/database.js';
import { requireAuth } from './src/middleware/auth.js';
import { errorHandler, notFoundHandler } from './src/middleware/errors.js';
import authRoutes from './src/routes/authRoutes.js';
import departmentRoutes from './src/routes/departmentRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import salaryRoutes from './src/routes/salaryRoutes.js';
import { seedDefaultDepartments } from './src/services/payrollService.js';
import { HttpError } from './src/utils/httpError.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new HttpError(403, `Origin ${origin} is not allowed by EPMS CORS policy.`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartPark Employee Payroll Management System API',
    database: databaseMode(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/departments', requireAuth, departmentRoutes);
app.use('/api/employees', requireAuth, employeeRoutes);
app.use('/api/salaries', requireAuth, salaryRoutes);
app.use('/api/reports', requireAuth, reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  await seedDefaultDepartments();

  app.listen(port, () => {
    console.log(`EPMS API running on http://localhost:${port}`);
    console.log(`Storage mode: ${databaseMode()}`);
  });
};

startServer().catch((error) => {
  console.error('EPMS API failed to start:', error);
  process.exit(1);
});
