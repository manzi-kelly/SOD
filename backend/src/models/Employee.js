import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    employeeNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'],
    },
    hiredDate: {
      type: Date,
      required: true,
    },
    departmentCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      ref: 'Department',
    },
  },
  { timestamps: true },
);

EmployeeSchema.index({ employeeNumber: 1 }, { unique: true });
EmployeeSchema.index({ departmentCode: 1 });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
