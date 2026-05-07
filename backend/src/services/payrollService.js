import crypto from 'crypto';

import { isMongoConnected } from '../database.js';
import { memoryStore } from '../memoryStore.js';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import Salary from '../models/Salary.js';
import { HttpError } from '../utils/httpError.js';

export const DEFAULT_DEPARTMENTS = [
  {
    departmentCode: 'CW',
    departmentName: 'Carwash',
    grossSalary: 300000,
    defaultDeduction: 20000,
  },
  {
    departmentCode: 'ST',
    departmentName: 'Stock',
    grossSalary: 200000,
    defaultDeduction: 5000,
  },
  {
    departmentCode: 'MC',
    departmentName: 'Mechanic',
    grossSalary: 450000,
    defaultDeduction: 40000,
  },
  {
    departmentCode: 'ADMS',
    departmentName: 'Administration Staff',
    grossSalary: 600000,
    defaultDeduction: 70000,
  },
];

const monthPattern = /^\d{4}-\d{2}$/;

const cleanText = (value) => String(value ?? '').trim();

const normalizeCode = (value) => cleanText(value).toUpperCase();

const assertRequired = (value, fieldName) => {
  if (!cleanText(value)) {
    throw new HttpError(400, `${fieldName} is required.`);
  }
};

const parseMoney = (value, fieldName, options = {}) => {
  if ((value === undefined || value === null || value === '') && options.optional) {
    return undefined;
  }

  const amount = Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount < 0) {
    throw new HttpError(400, `${fieldName} must be a valid positive amount.`);
  }

  return Math.round(amount);
};

const normalizeDate = (value, fieldName) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${fieldName} must be a valid date.`);
  }

  return date.toISOString().slice(0, 10);
};

const normalizeMonth = (value) => {
  const month = cleanText(value);
  if (!monthPattern.test(month)) {
    throw new HttpError(400, 'Month must use YYYY-MM format.');
  }

  return month;
};

const handleDuplicate = (error, message) => {
  if (error?.code === 11000) {
    throw new HttpError(409, message);
  }

  throw error;
};

const toDepartment = (department) => {
  if (!department) {
    return null;
  }

  const plain = department.toObject ? department.toObject() : department;
  return {
    id: String(plain._id || plain.id || plain.departmentCode),
    departmentCode: plain.departmentCode,
    departmentName: plain.departmentName,
    grossSalary: plain.grossSalary,
    defaultDeduction: plain.defaultDeduction,
  };
};

const toEmployee = (employee, department = null) => {
  if (!employee) {
    return null;
  }

  const plain = employee.toObject ? employee.toObject() : employee;
  return {
    id: String(plain._id || plain.id || plain.employeeNumber),
    employeeNumber: plain.employeeNumber,
    firstName: plain.firstName,
    lastName: plain.lastName,
    position: plain.position,
    address: plain.address,
    telephone: plain.telephone,
    gender: plain.gender,
    hiredDate:
      plain.hiredDate instanceof Date
        ? plain.hiredDate.toISOString().slice(0, 10)
        : cleanText(plain.hiredDate).slice(0, 10),
    departmentCode: plain.departmentCode,
    departmentName: department?.departmentName,
  };
};

const toSalary = (salary, employee = null, department = null) => {
  if (!salary) {
    return null;
  }

  const plain = salary.toObject ? salary.toObject() : salary;
  return {
    id: String(plain._id || plain.id),
    employeeNumber: plain.employeeNumber,
    firstName: employee?.firstName,
    lastName: employee?.lastName,
    position: employee?.position,
    departmentCode: plain.departmentCode,
    departmentName: department?.departmentName,
    grossSalary: plain.grossSalary,
    totalDeduction: plain.totalDeduction,
    netSalary: plain.netSalary,
    month: plain.month,
  };
};

const findDepartmentByCode = async (departmentCode) => {
  if (isMongoConnected()) {
    return Department.findOne({ departmentCode }).lean();
  }

  return memoryStore.departments.get(departmentCode) || null;
};

const findEmployeeByNumber = async (employeeNumber) => {
  if (isMongoConnected()) {
    return Employee.findOne({ employeeNumber }).lean();
  }

  return memoryStore.employees.get(employeeNumber) || null;
};

const enrichEmployees = async (employees) => {
  const departmentCodes = [...new Set(employees.map((employee) => employee.departmentCode))];

  const departments = isMongoConnected()
    ? await Department.find({ departmentCode: { $in: departmentCodes } }).lean()
    : departmentCodes.map((code) => memoryStore.departments.get(code)).filter(Boolean);

  const departmentByCode = new Map(
    departments.map((department) => [department.departmentCode, department]),
  );

  return employees.map((employee) => toEmployee(employee, departmentByCode.get(employee.departmentCode)));
};

const enrichSalaries = async (salaries) => {
  const employeeNumbers = [...new Set(salaries.map((salary) => salary.employeeNumber))];
  const departmentCodes = [...new Set(salaries.map((salary) => salary.departmentCode))];

  const employees = isMongoConnected()
    ? await Employee.find({ employeeNumber: { $in: employeeNumbers } }).lean()
    : employeeNumbers.map((number) => memoryStore.employees.get(number)).filter(Boolean);

  const departments = isMongoConnected()
    ? await Department.find({ departmentCode: { $in: departmentCodes } }).lean()
    : departmentCodes.map((code) => memoryStore.departments.get(code)).filter(Boolean);

  const employeeByNumber = new Map(
    employees.map((employee) => [employee.employeeNumber, employee]),
  );
  const departmentByCode = new Map(
    departments.map((department) => [department.departmentCode, department]),
  );

  return salaries.map((salary) =>
    toSalary(
      salary,
      employeeByNumber.get(salary.employeeNumber),
      departmentByCode.get(salary.departmentCode),
    ),
  );
};

const normalizeDepartmentInput = (payload) => {
  assertRequired(payload.departmentCode, 'Department code');
  assertRequired(payload.departmentName, 'Department name');

  const grossSalary = parseMoney(payload.grossSalary, 'Gross salary');
  const defaultDeduction = parseMoney(payload.defaultDeduction ?? 0, 'Total deduction');

  if (defaultDeduction > grossSalary) {
    throw new HttpError(400, 'Total deduction cannot be greater than gross salary.');
  }

  return {
    departmentCode: normalizeCode(payload.departmentCode),
    departmentName: cleanText(payload.departmentName),
    grossSalary,
    defaultDeduction,
  };
};

const normalizeEmployeeInput = async (payload) => {
  const requiredFields = [
    ['employeeNumber', 'Employee number'],
    ['firstName', 'First name'],
    ['lastName', 'Last name'],
    ['position', 'Position'],
    ['address', 'Address'],
    ['telephone', 'Telephone'],
    ['gender', 'Gender'],
    ['hiredDate', 'Hired date'],
    ['departmentCode', 'Department'],
  ];

  requiredFields.forEach(([key, label]) => assertRequired(payload[key], label));

  const departmentCode = normalizeCode(payload.departmentCode);
  const department = await findDepartmentByCode(departmentCode);
  if (!department) {
    throw new HttpError(404, 'Selected department does not exist.');
  }

  return {
    employeeNumber: cleanText(payload.employeeNumber),
    firstName: cleanText(payload.firstName),
    lastName: cleanText(payload.lastName),
    position: cleanText(payload.position),
    address: cleanText(payload.address),
    telephone: cleanText(payload.telephone),
    gender: cleanText(payload.gender),
    hiredDate: normalizeDate(payload.hiredDate, 'Hired date'),
    departmentCode,
  };
};

const normalizeSalaryInput = async (payload, existingSalary = {}) => {
  const employeeNumber = cleanText(payload.employeeNumber ?? existingSalary.employeeNumber);
  const month = normalizeMonth(payload.month ?? existingSalary.month);

  assertRequired(employeeNumber, 'Employee');

  const employee = await findEmployeeByNumber(employeeNumber);
  if (!employee) {
    throw new HttpError(404, 'Selected employee does not exist.');
  }

  const department = await findDepartmentByCode(employee.departmentCode);
  if (!department) {
    throw new HttpError(404, 'Employee department does not exist.');
  }

  const grossSalary =
    parseMoney(payload.grossSalary, 'Gross salary', { optional: true }) ?? department.grossSalary;
  const totalDeduction =
    parseMoney(payload.totalDeduction, 'Total deduction', { optional: true }) ??
    department.defaultDeduction;

  if (totalDeduction > grossSalary) {
    throw new HttpError(400, 'Total deduction cannot be greater than gross salary.');
  }

  return {
    employeeNumber,
    departmentCode: employee.departmentCode,
    grossSalary,
    totalDeduction,
    netSalary: grossSalary - totalDeduction,
    month,
  };
};

export const seedDefaultDepartments = async () => {
  if (isMongoConnected()) {
    await Promise.all(
      DEFAULT_DEPARTMENTS.map((department) =>
        Department.updateOne(
          { departmentCode: department.departmentCode },
          { $setOnInsert: department },
          { upsert: true },
        ),
      ),
    );
    return;
  }

  DEFAULT_DEPARTMENTS.forEach((department) => {
    if (!memoryStore.departments.has(department.departmentCode)) {
      memoryStore.departments.set(department.departmentCode, {
        id: department.departmentCode,
        ...department,
      });
    }
  });
};

export const listDepartments = async () => {
  if (isMongoConnected()) {
    const departments = await Department.find().sort({ departmentCode: 1 }).lean();
    return departments.map(toDepartment);
  }

  return [...memoryStore.departments.values()]
    .sort((first, second) => first.departmentCode.localeCompare(second.departmentCode))
    .map(toDepartment);
};

export const createDepartment = async (payload) => {
  const data = normalizeDepartmentInput(payload);

  if (isMongoConnected()) {
    const existingDepartment = await Department.findOne({
      departmentCode: data.departmentCode,
    }).lean();
    if (existingDepartment) {
      throw new HttpError(409, 'A department with this code already exists.');
    }

    try {
      const department = await Department.create(data);
      return toDepartment(department);
    } catch (error) {
      handleDuplicate(error, 'A department with this code already exists.');
    }
  }

  if (memoryStore.departments.has(data.departmentCode)) {
    throw new HttpError(409, 'A department with this code already exists.');
  }

  const department = { id: data.departmentCode, ...data };
  memoryStore.departments.set(data.departmentCode, department);
  return toDepartment(department);
};

export const listEmployees = async () => {
  if (isMongoConnected()) {
    const employees = await Employee.find().sort({ firstName: 1, lastName: 1 }).lean();
    return enrichEmployees(employees);
  }

  const employees = [...memoryStore.employees.values()].sort((first, second) =>
    `${first.firstName} ${first.lastName}`.localeCompare(`${second.firstName} ${second.lastName}`),
  );
  return enrichEmployees(employees);
};

export const createEmployee = async (payload) => {
  const data = await normalizeEmployeeInput(payload);

  if (isMongoConnected()) {
    const existingEmployee = await Employee.findOne({
      employeeNumber: data.employeeNumber,
    }).lean();
    if (existingEmployee) {
      throw new HttpError(409, 'An employee with this number already exists.');
    }

    try {
      const employee = await Employee.create({ ...data, hiredDate: new Date(data.hiredDate) });
      return (await enrichEmployees([employee]))[0];
    } catch (error) {
      handleDuplicate(error, 'An employee with this number already exists.');
    }
  }

  if (memoryStore.employees.has(data.employeeNumber)) {
    throw new HttpError(409, 'An employee with this number already exists.');
  }

  const employee = { id: data.employeeNumber, ...data };
  memoryStore.employees.set(data.employeeNumber, employee);
  return (await enrichEmployees([employee]))[0];
};

export const listSalaries = async (filters = {}) => {
  const query = {};

  if (filters.month) {
    query.month = normalizeMonth(filters.month);
  }

  if (filters.employeeNumber) {
    query.employeeNumber = cleanText(filters.employeeNumber);
  }

  if (isMongoConnected()) {
    const salaries = await Salary.find(query).sort({ month: -1, createdAt: -1 }).lean();
    return enrichSalaries(salaries);
  }

  const salaries = [...memoryStore.salaries.values()]
    .filter((salary) => !query.month || salary.month === query.month)
    .filter((salary) => !query.employeeNumber || salary.employeeNumber === query.employeeNumber)
    .sort((first, second) => second.month.localeCompare(first.month));

  return enrichSalaries(salaries);
};

export const getSalary = async (id) => {
  const salary = isMongoConnected()
    ? await Salary.findById(id).lean().catch(() => null)
    : memoryStore.salaries.get(id) || null;

  if (!salary) {
    throw new HttpError(404, 'Salary record was not found.');
  }

  return (await enrichSalaries([salary]))[0];
};

export const createSalary = async (payload) => {
  const data = await normalizeSalaryInput(payload);

  if (isMongoConnected()) {
    const existingSalary = await Salary.findOne({
      employeeNumber: data.employeeNumber,
      month: data.month,
    }).lean();
    if (existingSalary) {
      throw new HttpError(409, 'Payroll for this employee and month already exists.');
    }

    try {
      const salary = await Salary.create(data);
      return (await enrichSalaries([salary]))[0];
    } catch (error) {
      handleDuplicate(error, 'Payroll for this employee and month already exists.');
    }
  }

  const duplicate = [...memoryStore.salaries.values()].find(
    (salary) => salary.employeeNumber === data.employeeNumber && salary.month === data.month,
  );
  if (duplicate) {
    throw new HttpError(409, 'Payroll for this employee and month already exists.');
  }

  const salary = {
    id: crypto.randomUUID(),
    ...data,
  };
  memoryStore.salaries.set(salary.id, salary);
  return (await enrichSalaries([salary]))[0];
};

export const updateSalary = async (id, payload) => {
  const existingSalary = isMongoConnected()
    ? await Salary.findById(id).lean().catch(() => null)
    : memoryStore.salaries.get(id) || null;

  if (!existingSalary) {
    throw new HttpError(404, 'Salary record was not found.');
  }

  const data = await normalizeSalaryInput(payload, existingSalary);

  const duplicate = isMongoConnected()
    ? await Salary.findOne({
        _id: { $ne: id },
        employeeNumber: data.employeeNumber,
        month: data.month,
      }).lean()
    : [...memoryStore.salaries.values()].find(
        (salary) =>
          salary.id !== id && salary.employeeNumber === data.employeeNumber && salary.month === data.month,
      );

  if (duplicate) {
    throw new HttpError(409, 'Payroll for this employee and month already exists.');
  }

  if (isMongoConnected()) {
    const updatedSalary = await Salary.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    return (await enrichSalaries([updatedSalary]))[0];
  }

  const updatedSalary = { ...existingSalary, ...data };
  memoryStore.salaries.set(id, updatedSalary);
  return (await enrichSalaries([updatedSalary]))[0];
};

export const deleteSalary = async (id) => {
  if (isMongoConnected()) {
    const deletedSalary = await Salary.findByIdAndDelete(id).lean().catch(() => null);
    if (!deletedSalary) {
      throw new HttpError(404, 'Salary record was not found.');
    }
    return toSalary(deletedSalary);
  }

  if (!memoryStore.salaries.has(id)) {
    throw new HttpError(404, 'Salary record was not found.');
  }

  const deletedSalary = memoryStore.salaries.get(id);
  memoryStore.salaries.delete(id);
  return toSalary(deletedSalary);
};

export const getMonthlyPayrollReport = async (month) => {
  const normalizedMonth = normalizeMonth(month);
  const rows = await listSalaries({ month: normalizedMonth });
  const summary = rows.reduce(
    (totals, row) => ({
      employeesPaid: totals.employeesPaid + 1,
      totalGrossSalary: totals.totalGrossSalary + row.grossSalary,
      totalDeduction: totals.totalDeduction + row.totalDeduction,
      totalNetSalary: totals.totalNetSalary + row.netSalary,
    }),
    {
      employeesPaid: 0,
      totalGrossSalary: 0,
      totalDeduction: 0,
      totalNetSalary: 0,
    },
  );

  return {
    month: normalizedMonth,
    summary,
    rows: rows.map((row) => ({
      firstName: row.firstName,
      lastName: row.lastName,
      position: row.position,
      department: row.departmentName,
      netSalary: row.netSalary,
      grossSalary: row.grossSalary,
      totalDeduction: row.totalDeduction,
      employeeNumber: row.employeeNumber,
      salaryId: row.id,
    })),
  };
};

export const getDashboardSummary = async () => {
  const [departments, employees, salaries] = await Promise.all([
    listDepartments(),
    listEmployees(),
    listSalaries(),
  ]);

  const totalNetPaid = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);

  return {
    departments: departments.length,
    employees: employees.length,
    salaryRecords: salaries.length,
    totalNetPaid,
  };
};
