import mongoose from 'mongoose';

const SalarySchema = new mongoose.Schema(
  {
    employeeNumber: {
      type: String,
      required: true,
      trim: true,
      ref: 'Employee',
    },
    departmentCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      ref: 'Department',
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDeduction: {
      type: Number,
      required: true,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
  },
  { timestamps: true },
);

SalarySchema.index({ employeeNumber: 1, month: 1 }, { unique: true });
SalarySchema.index({ month: 1 });

export default mongoose.models.Salary || mongoose.model('Salary', SalarySchema);
