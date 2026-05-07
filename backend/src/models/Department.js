import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    departmentCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultDeduction: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

DepartmentSchema.index({ departmentCode: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
