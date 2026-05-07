import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  LogOut,
  Printer,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  UserRoundPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';

import api, { getApiError } from './api/client';
import { currentMonth, money, readableMonth, today } from './lib/formatters';

const navItems = [
  { key: 'employees', label: 'Employee', icon: UsersRound },
  { key: 'departments', label: 'Department', icon: Building2 },
  { key: 'salaries', label: 'Salary', icon: WalletCards },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

const inputClass =
  'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

const emptyEmployeeForm = () => ({
  employeeNumber: '',
  firstName: '',
  lastName: '',
  position: '',
  address: '',
  telephone: '',
  gender: 'Male',
  hiredDate: today(),
  departmentCode: '',
});

const emptyDepartmentForm = {
  departmentCode: '',
  departmentName: '',
  grossSalary: '',
  defaultDeduction: '',
};

const emptySalaryForm = () => ({
  employeeNumber: '',
  month: currentMonth(),
  totalDeduction: '',
});

function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogin = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
  };

  const handleRegister = async (credentials) => {
    const { data } = await api.post('/auth/register', credentials);
    setUser(data.user);
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <RefreshCcw className="h-5 w-5 animate-spin text-emerald-700" />
          <span className="text-sm font-medium">Opening EPMS</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return <PayrollWorkspace user={user} onLogout={handleLogout} />;
}

function LoginPage({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegisterMode = authMode === 'register';
  const SubmitIcon = isRegisterMode ? UserRoundPlus : CheckCircle2;

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegisterMode) {
        await onRegister(form);
      } else {
        await onLogin({
          username: form.username,
          password: form.password,
        });
      }
    } catch (authError) {
      setError(getApiError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-700 text-white">
            <BadgeDollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">SmartPark EPMS</h1>
            <p className="text-sm text-slate-500">Session based payroll access</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100 p-1">
          <button
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
              !isRegisterMode
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => switchMode('login')}
            type="button"
          >
            <CheckCircle2 className="h-4 w-4" />
            Login
          </button>
          <button
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
              isRegisterMode ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => switchMode('register')}
            type="button"
          >
            <UserRoundPlus className="h-4 w-4" />
            Register
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegisterMode ? (
            <FormField
              label="Full name"
              name="fullName"
              placeholder="Human Resource Officer"
              value={form.fullName}
              onChange={bindForm(setForm)}
              required
            />
          ) : null}

          <FormField
            label="Username"
            name="username"
            placeholder={isRegisterMode ? 'hruser' : 'admin'}
            value={form.username}
            onChange={bindForm(setForm)}
            required
          />

          <FormField
            label="Password"
            name="password"
            placeholder={isRegisterMode ? '' : 'admin123'}
            type="password"
            value={form.password}
            onChange={bindForm(setForm)}
            required
          />

          {isRegisterMode ? (
            <FormField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={bindForm(setForm)}
              required
            />
          ) : null}

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-400 ${
              isRegisterMode
                ? 'bg-sky-700 hover:bg-sky-800 focus:ring-sky-200'
                : 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-200'
            }`}
            disabled={submitting}
            type="submit"
          >
            <SubmitIcon className="h-4 w-4" />
            {submitting
              ? isRegisterMode
                ? 'Creating account'
                : 'Checking account'
              : isRegisterMode
                ? 'Register account'
                : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

function PayrollWorkspace({ user, onLogout }) {
  const [activePage, setActivePage] = useState('employees');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [summary, setSummary] = useState({
    departments: 0,
    employees: 0,
    salaryRecords: 0,
    totalNetPaid: 0,
  });
  const [salaryFilterMonth, setSalaryFilterMonth] = useState('');
  const [reportMonth, setReportMonth] = useState(currentMonth());
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [payrollEmployeeNumber, setPayrollEmployeeNumber] = useState('');

  const showNotice = useCallback((type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4200);
  }, []);

  const clearPayrollEmployeeNumber = useCallback(() => {
    setPayrollEmployeeNumber('');
  }, []);

  const loadReferenceData = useCallback(async () => {
    const [{ data: departmentData }, { data: employeeData }, { data: summaryData }] =
      await Promise.all([
        api.get('/departments'),
        api.get('/employees'),
        api.get('/reports/dashboard'),
      ]);

    setDepartments(departmentData.departments);
    setEmployees(employeeData.employees);
    setSummary(summaryData.summary);
  }, []);

  const loadSalaries = useCallback(async (month = salaryFilterMonth) => {
    const params = month ? { month } : {};
    const { data } = await api.get('/salaries', { params });
    setSalaries(data.salaries);
  }, [salaryFilterMonth]);

  const loadReport = useCallback(async (month = reportMonth) => {
    const { data } = await api.get('/reports/monthly-payroll', {
      params: { month },
    });
    setReport(data.report);
  }, [reportMonth]);

  const refreshAll = useCallback(async () => {
    setBusy(true);
    try {
      await Promise.all([loadReferenceData(), loadSalaries(), loadReport()]);
    } catch (error) {
      showNotice('error', getApiError(error));
    } finally {
      setBusy(false);
    }
  }, [loadReferenceData, loadReport, loadSalaries, showNotice]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createDepartment = async (payload) => {
    await api.post('/departments', payload);
    await loadReferenceData();
    showNotice('success', 'Department saved.');
  };

  const createEmployee = async (payload) => {
    const { data } = await api.post('/employees', payload);
    await loadReferenceData();
    setPayrollEmployeeNumber(data.employee.employeeNumber);
    setActivePage('salaries');
    showNotice('success', 'Employee saved and selected for payroll.');
  };

  const createSalary = async (payload) => {
    await api.post('/salaries', payload);
    await Promise.all([loadReferenceData(), loadSalaries(), loadReport()]);
    showNotice('success', 'Payroll saved.');
  };

  const updateSalary = async (id, payload) => {
    await api.put(`/salaries/${id}`, payload);
    await Promise.all([loadReferenceData(), loadSalaries(), loadReport()]);
    showNotice('success', 'Payroll updated.');
  };

  const deleteSalary = async (id) => {
    await api.delete(`/salaries/${id}`);
    await Promise.all([loadReferenceData(), loadSalaries(), loadReport()]);
    showNotice('success', 'Payroll deleted.');
  };

  const handleSalaryRetrieve = async () => {
    try {
      await loadSalaries(salaryFilterMonth);
      showNotice('success', 'Salary records retrieved.');
    } catch (error) {
      showNotice('error', getApiError(error));
    }
  };

  const handleReportLoad = async () => {
    try {
      await loadReport(reportMonth);
    } catch (error) {
      showNotice('error', getApiError(error));
    }
  };

  const ActiveIcon = navItems.find((item) => item.key === activePage)?.icon || UsersRound;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-700 text-white">
                <BadgeDollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">SmartPark</p>
                <h1 className="text-xl font-semibold text-slate-950">Employee Payroll Management System</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
                {user.username}
              </span>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-100"
                onClick={onLogout}
                title="Logout"
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;

              return (
                <button
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-100 ${
                    active
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-emerald-700">
            <ActiveIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {navItems.find((item) => item.key === activePage)?.label}
            </h2>
            <p className="text-sm text-slate-500">{busy ? 'Refreshing records' : 'Records are ready'}</p>
          </div>
        </div>

        <SummaryStrip summary={summary} />

        {notice ? <Notice notice={notice} /> : null}

        {activePage === 'employees' ? (
          <EmployeePage
            departments={departments}
            employees={employees}
            onCreate={createEmployee}
            onError={(message) => showNotice('error', message)}
          />
        ) : null}

        {activePage === 'departments' ? (
          <DepartmentPage
            departments={departments}
            onCreate={createDepartment}
            onError={(message) => showNotice('error', message)}
          />
        ) : null}

        {activePage === 'salaries' ? (
          <SalaryPage
            departments={departments}
            employees={employees}
            filterMonth={salaryFilterMonth}
            onCreate={createSalary}
            onDelete={deleteSalary}
            onError={(message) => showNotice('error', message)}
            onFilterMonthChange={setSalaryFilterMonth}
            onRefresh={handleSalaryRetrieve}
            onSelectedEmployeeNumberUsed={clearPayrollEmployeeNumber}
            onUpdate={updateSalary}
            selectedEmployeeNumber={payrollEmployeeNumber}
            salaries={salaries}
          />
        ) : null}

        {activePage === 'reports' ? (
          <ReportsPage
            month={reportMonth}
            onLoad={handleReportLoad}
            onMonthChange={setReportMonth}
            report={report}
          />
        ) : null}
      </main>
    </div>
  );
}

function SummaryStrip({ summary }) {
  const stats = [
    {
      label: 'Departments',
      value: summary.departments,
      icon: Building2,
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Employees',
      value: summary.employees,
      icon: UsersRound,
      accent: 'text-sky-700 bg-sky-50 border-sky-100',
    },
    {
      label: 'Salary records',
      value: summary.salaryRecords,
      icon: WalletCards,
      accent: 'text-amber-700 bg-amber-50 border-amber-100',
    },
    {
      label: 'Net paid',
      value: money(summary.totalNetPaid),
      icon: BadgeDollarSign,
      accent: 'text-slate-700 bg-slate-100 border-slate-200',
    },
  ];

  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={stat.label}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${stat.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function EmployeePage({ departments, employees, onCreate, onError }) {
  const [form, setForm] = useState(emptyEmployeeForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!form.departmentCode && departments[0]) {
      setForm((current) => ({ ...current, departmentCode: departments[0].departmentCode }));
    }
  }, [departments, form.departmentCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onCreate(form);
      setForm({ ...emptyEmployeeForm(), departmentCode: departments[0]?.departmentCode || '' });
    } catch (error) {
      onError(getApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={UserRoundPlus} title="Record Employee" />
        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Employee number"
              name="employeeNumber"
              onChange={bindForm(setForm)}
              value={form.employeeNumber}
              required
            />
            <FormField
              label="First name"
              name="firstName"
              onChange={bindForm(setForm)}
              value={form.firstName}
              required
            />
            <FormField
              label="Last name"
              name="lastName"
              onChange={bindForm(setForm)}
              value={form.lastName}
              required
            />
            <FormField
              label="Position"
              name="position"
              onChange={bindForm(setForm)}
              value={form.position}
              required
            />
            <FormField
              label="Telephone"
              name="telephone"
              onChange={bindForm(setForm)}
              value={form.telephone}
              required
            />
            <FormField
              label="Hired date"
              name="hiredDate"
              onChange={bindForm(setForm)}
              type="date"
              value={form.hiredDate}
              required
            />
            <FormField
              label="Gender"
              name="gender"
              onChange={bindForm(setForm)}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={form.gender}
              required
            />
            <FormField
              label="Department"
              name="departmentCode"
              onChange={bindForm(setForm)}
              options={departments.map((department) => ({
                label: `${department.departmentCode} - ${department.departmentName}`,
                value: department.departmentCode,
              }))}
              value={form.departmentCode}
              required
            />
          </div>
          <FormField
            label="Address"
            name="address"
            onChange={bindForm(setForm)}
            textarea
            value={form.address}
            required
          />
          <SubmitButton icon={Save} label="Save employee" loading={submitting} />
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={UsersRound} title="Employee Records" />
        <ResponsiveTable
          emptyText="No employees recorded yet."
          headers={['No.', 'Names', 'Position', 'Department', 'Telephone', 'Hired']}
        >
          {employees.map((employee) => (
            <tr className="border-t border-slate-100" key={employee.employeeNumber}>
              <td className="px-3 py-3 font-medium text-slate-900">{employee.employeeNumber}</td>
              <td className="px-3 py-3">{employee.firstName} {employee.lastName}</td>
              <td className="px-3 py-3">{employee.position}</td>
              <td className="px-3 py-3">{employee.departmentName || employee.departmentCode}</td>
              <td className="px-3 py-3">{employee.telephone}</td>
              <td className="px-3 py-3">{employee.hiredDate}</td>
            </tr>
          ))}
        </ResponsiveTable>
      </section>
    </div>
  );
}

function DepartmentPage({ departments, onCreate, onError }) {
  const [form, setForm] = useState(emptyDepartmentForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onCreate(form);
      setForm(emptyDepartmentForm);
    } catch (error) {
      onError(getApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={Building2} title="Record Department" />
        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <FormField
            label="Department code"
            name="departmentCode"
            onChange={bindForm(setForm)}
            value={form.departmentCode}
            required
          />
          <FormField
            label="Department name"
            name="departmentName"
            onChange={bindForm(setForm)}
            value={form.departmentName}
            required
          />
          <FormField
            label="Gross salary"
            min="0"
            name="grossSalary"
            onChange={bindForm(setForm)}
            type="number"
            value={form.grossSalary}
            required
          />
          <FormField
            label="Total deduction"
            min="0"
            name="defaultDeduction"
            onChange={bindForm(setForm)}
            type="number"
            value={form.defaultDeduction}
            required
          />
          <SubmitButton icon={Save} label="Save department" loading={submitting} />
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={BadgeDollarSign} title="Department Salary Scale" />
        <ResponsiveTable
          emptyText="No departments recorded yet."
          headers={['Code', 'Department', 'Gross salary', 'Total deduction', 'Net preview']}
        >
          {departments.map((department) => (
            <tr className="border-t border-slate-100" key={department.departmentCode}>
              <td className="px-3 py-3 font-semibold text-slate-900">{department.departmentCode}</td>
              <td className="px-3 py-3">{department.departmentName}</td>
              <td className="px-3 py-3">{money(department.grossSalary)}</td>
              <td className="px-3 py-3">{money(department.defaultDeduction)}</td>
              <td className="px-3 py-3 font-medium text-emerald-700">
                {money(department.grossSalary - department.defaultDeduction)}
              </td>
            </tr>
          ))}
        </ResponsiveTable>
      </section>
    </div>
  );
}

function SalaryPage({
  departments,
  employees,
  filterMonth,
  onCreate,
  onDelete,
  onError,
  onFilterMonthChange,
  onRefresh,
  onSelectedEmployeeNumberUsed,
  onUpdate,
  selectedEmployeeNumber,
  salaries,
}) {
  const [form, setForm] = useState(emptySalaryForm);
  const [editForm, setEditForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const departmentByCode = useMemo(
    () => new Map(departments.map((department) => [department.departmentCode, department])),
    [departments],
  );

  const getEmployeeDepartment = useCallback(
    (employeeNumber) => {
      const employee = employees.find((item) => item.employeeNumber === employeeNumber);
      return employee ? departmentByCode.get(employee.departmentCode) : null;
    },
    [departmentByCode, employees],
  );

  const getDefaultDeduction = useCallback(
    (employeeNumber) => String(getEmployeeDepartment(employeeNumber)?.defaultDeduction ?? ''),
    [getEmployeeDepartment],
  );

  useEffect(() => {
    const employeeNumber =
      selectedEmployeeNumber ||
      (!form.employeeNumber && employees[0] ? employees[0].employeeNumber : '');

    if (employeeNumber && employees.some((employee) => employee.employeeNumber === employeeNumber)) {
      const isPreferredEmployee = Boolean(selectedEmployeeNumber);
      setForm((current) => ({
        ...current,
        employeeNumber,
        totalDeduction: getDefaultDeduction(employeeNumber),
      }));

      if (isPreferredEmployee) {
        onSelectedEmployeeNumberUsed();
      }
    }
  }, [
    employees,
    form.employeeNumber,
    getDefaultDeduction,
    onSelectedEmployeeNumberUsed,
    selectedEmployeeNumber,
  ]);

  const selectedEmployee = employees.find((employee) => employee.employeeNumber === form.employeeNumber);
  const selectedDepartment = selectedEmployee
    ? departmentByCode.get(selectedEmployee.departmentCode)
    : null;
  const deduction =
    form.totalDeduction === ''
      ? Number(selectedDepartment?.defaultDeduction || 0)
      : Number(form.totalDeduction || 0);
  const grossSalary = Number(selectedDepartment?.grossSalary || 0);
  const netSalary = Math.max(grossSalary - deduction, 0);

  const handlePayrollEmployeeChange = (event) => {
    const employeeNumber = event.target.value;
    setForm((current) => ({
      ...current,
      employeeNumber,
      totalDeduction: getDefaultDeduction(employeeNumber),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onCreate({
        employeeNumber: form.employeeNumber,
        month: form.month,
        totalDeduction: form.totalDeduction,
      });
      const employeeNumber = employees[0]?.employeeNumber || '';
      setForm({
        ...emptySalaryForm(),
        employeeNumber,
        totalDeduction: getDefaultDeduction(employeeNumber),
      });
    } catch (error) {
      onError(getApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (salary) => {
    setEditForm({
      id: salary.id,
      employeeNumber: salary.employeeNumber,
      month: salary.month,
      totalDeduction: salary.totalDeduction,
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onUpdate(editForm.id, editForm);
      setEditForm(null);
    } catch (error) {
      onError(getApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async (salary) => {
    const confirmed = window.confirm(
      `Delete payroll for ${salary.firstName || salary.employeeNumber} ${salary.lastName || ''}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDelete(salary.id);
    } catch (error) {
      onError(getApiError(error));
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle icon={WalletCards} title="Make Payroll" />
        {employees.length === 0 ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No employees are saved yet. Open Employee, save an employee, then the name will appear here.
          </div>
        ) : null}
        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <FormField
            label="Employee"
            name="employeeNumber"
            onChange={handlePayrollEmployeeChange}
            options={employees.map((employee) => ({
              label: `${employee.employeeNumber} - ${employee.firstName} ${employee.lastName}`,
              value: employee.employeeNumber,
            }))}
            value={form.employeeNumber}
            disabled={employees.length === 0}
            required
          />
          <FormField
            label="Month of payment"
            name="month"
            onChange={bindForm(setForm)}
            type="month"
            value={form.month}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyValue label="Department" value={selectedDepartment?.departmentName || 'Pending'} />
            <ReadOnlyValue label="Gross salary" value={money(grossSalary)} />
          </div>
          <FormField
            label="Total deduction"
            min="0"
            name="totalDeduction"
            onChange={bindForm(setForm)}
            type="number"
            value={form.totalDeduction}
            required
          />
          <ReadOnlyValue label="Net salary" value={money(netSalary)} strong />
          <SubmitButton
            disabled={employees.length === 0}
            icon={Save}
            label="Save payroll"
            loading={submitting}
          />
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SectionTitle icon={Search} title="Salary Records" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className={inputClass}
              onChange={(event) => onFilterMonthChange(event.target.value)}
              type="month"
              value={filterMonth}
            />
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
              onClick={onRefresh}
              title="Retrieve salary records"
              type="button"
            >
              <RefreshCcw className="h-4 w-4" />
              Retrieve
            </button>
          </div>
        </div>

        {editForm ? (
          <form
            className="mt-4 grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 md:grid-cols-4"
            onSubmit={handleEditSubmit}
          >
            <FormField
              label="Employee"
              name="employeeNumber"
              onChange={bindForm(setEditForm)}
              options={employees.map((employee) => ({
                label: `${employee.employeeNumber} - ${employee.firstName} ${employee.lastName}`,
                value: employee.employeeNumber,
              }))}
              value={editForm.employeeNumber}
              required
            />
            <FormField
              label="Month"
              name="month"
              onChange={bindForm(setEditForm)}
              type="month"
              value={editForm.month}
              required
            />
            <FormField
              label="Deduction"
              min="0"
              name="totalDeduction"
              onChange={bindForm(setEditForm)}
              type="number"
              value={editForm.totalDeduction}
              required
            />
            <div className="flex items-end gap-2">
              <button
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-amber-600 px-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                disabled={submitting}
                type="submit"
              >
                <Edit3 className="h-4 w-4" />
                Update
              </button>
              <button
                className="h-11 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                onClick={() => setEditForm(null)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <ResponsiveTable
          emptyText="No salary records found."
          headers={['Employee', 'Department', 'Month', 'Gross', 'Deduction', 'Net', 'Actions']}
        >
          {salaries.map((salary) => (
            <tr className="border-t border-slate-100" key={salary.id}>
              <td className="px-3 py-3">
                <span className="font-medium text-slate-900">
                  {salary.firstName} {salary.lastName}
                </span>
                <span className="block text-xs text-slate-500">{salary.employeeNumber}</span>
              </td>
              <td className="px-3 py-3">{salary.departmentName || salary.departmentCode}</td>
              <td className="px-3 py-3">{readableMonth(salary.month)}</td>
              <td className="px-3 py-3">{money(salary.grossSalary)}</td>
              <td className="px-3 py-3">{money(salary.totalDeduction)}</td>
              <td className="px-3 py-3 font-semibold text-emerald-700">{money(salary.netSalary)}</td>
              <td className="px-3 py-3">
                <div className="flex gap-2">
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                    onClick={() => startEdit(salary)}
                    title="Edit salary"
                    type="button"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    onClick={() => confirmDelete(salary)}
                    title="Delete salary"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </ResponsiveTable>
      </section>
    </div>
  );
}

function ReportsPage({ month, onLoad, onMonthChange, report }) {
  const rows = report?.rows || [];
  const summary = report?.summary || {
    employeesPaid: 0,
    totalGrossSalary: 0,
    totalDeduction: 0,
    totalNetSalary: 0,
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SectionTitle icon={CalendarDays} title="Monthly Payroll" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            onChange={(event) => onMonthChange(event.target.value)}
            type="month"
            value={month}
          />
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={onLoad}
            type="button"
          >
            <Search className="h-4 w-4" />
            Generate
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
            onClick={() => window.print()}
            type="button"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="my-5 grid gap-3 md:grid-cols-4">
        <ReportMetric label="Employees paid" value={summary.employeesPaid} />
        <ReportMetric label="Gross salary" value={money(summary.totalGrossSalary)} />
        <ReportMetric label="Deduction" value={money(summary.totalDeduction)} />
        <ReportMetric label="Net salary" value={money(summary.totalNetSalary)} highlighted />
      </div>

      <div className="mb-3 text-sm font-semibold text-slate-700">
        Payroll for {readableMonth(report?.month || month)}
      </div>

      <ResponsiveTable
        emptyText="No monthly payroll generated for this month."
        headers={['First name', 'Last name', 'Position', 'Department', 'Net salary']}
      >
        {rows.map((row) => (
          <tr className="border-t border-slate-100" key={row.salaryId}>
            <td className="px-3 py-3">{row.firstName}</td>
            <td className="px-3 py-3">{row.lastName}</td>
            <td className="px-3 py-3">{row.position}</td>
            <td className="px-3 py-3">{row.department}</td>
            <td className="px-3 py-3 font-semibold text-emerald-700">{money(row.netSalary)}</td>
          </tr>
        ))}
      </ResponsiveTable>
    </section>
  );
}

function FormField({ label, name, onChange, options, textarea, value, ...props }) {
  const id = `${name}-${label}`.replace(/\s+/g, '-').toLowerCase();

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700" htmlFor={id}>
      <span>{label}</span>
      {textarea ? (
        <textarea
          className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id={id}
          name={name}
          onChange={onChange}
          value={value}
          {...props}
        />
      ) : options ? (
        <select
          className={inputClass}
          id={id}
          name={name}
          onChange={onChange}
          value={value}
          {...props}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={inputClass}
          id={id}
          name={name}
          onChange={onChange}
          value={value}
          {...props}
        />
      )}
    </label>
  );
}

function ReadOnlyValue({ label, strong, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-sm ${strong ? 'font-semibold text-emerald-700' : 'font-medium text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-emerald-700">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
    </div>
  );
}

function SubmitButton({ disabled, icon: Icon, label, loading }) {
  return (
    <button
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={disabled || loading}
      type="submit"
    >
      <Icon className="h-4 w-4" />
      {loading ? 'Saving' : label}
    </button>
  );
}

function ReportMetric({ highlighted, label, value }) {
  return (
    <article
      className={`rounded-md border p-4 ${
        highlighted
          ? 'border-emerald-100 bg-emerald-50 text-emerald-900'
          : 'border-slate-200 bg-slate-50 text-slate-900'
      }`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </article>
  );
}

function Notice({ notice }) {
  const isError = notice.type === 'error';

  return (
    <div
      className={`mb-5 rounded-md border px-4 py-3 text-sm ${
        isError
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {notice.message}
    </div>
  );
}

function ResponsiveTable({ children, emptyText, headers }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-600">
          <tr>
            {headers.map((header) => (
              <th className="px-3 py-3" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white text-slate-700">
          {hasRows ? (
            children
          ) : (
            <tr>
              <td className="px-3 py-8 text-center text-slate-500" colSpan={headers.length}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const bindForm = (setForm) => (event) => {
  const { name, value } = event.target;
  setForm((current) => ({ ...current, [name]: value }));
};

export default App;
