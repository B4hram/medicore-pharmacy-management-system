import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';

import { employees as initialEmployees } from '../data/employeesData';

import '../styles/employees.css';

function Employees() {
  const [employeeList, setEmployeeList] =
    useState(initialEmployees);

  const [search, setSearch] = useState('');
  const [department, setDepartment] =
    useState('All Departments');
  const [status, setStatus] =
    useState('All Status');

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [deleteEmployee, setDeleteEmployee] =
    useState(null);

  const emptyForm = {
    name: '',
    phone: '',
    email: '',
    position: '',
    department: 'Pharmacy',
    hireDate: '',
    status: 'Active',
    salary: '',
    address: '',
  };

  const [form, setForm] = useState(emptyForm);

  const departments = [
    'All Departments',
    'Pharmacy',
    'Sales',
    'Inventory',
    'Management',
  ];

  const filteredEmployees = useMemo(() => {
    return employeeList.filter((employee) => {
      const searchValue =
        `${employee.name} ${employee.employeeId} ${employee.phone} ${employee.email} ${employee.position}`
          .toLowerCase();

      const matchesSearch =
        searchValue.includes(
          search.toLowerCase()
        );

      const matchesDepartment =
        department === 'All Departments' ||
        employee.department === department;

      const matchesStatus =
        status === 'All Status' ||
        employee.status === status;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [
    employeeList,
    search,
    department,
    status,
  ]);

  const statistics = useMemo(() => {
    return {
      total: employeeList.length,

      active: employeeList.filter(
        (employee) =>
          employee.status === 'Active'
      ).length,

      leave: employeeList.filter(
        (employee) =>
          employee.status === 'On Leave'
      ).length,

      inactive: employeeList.filter(
        (employee) =>
          employee.status === 'Inactive'
      ).length,
    };
  }, [employeeList]);

  const openAddForm = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);

    setForm({
      name: employee.name || '',
      phone: employee.phone || '',
      email: employee.email || '',
      position: employee.position || '',
      department:
        employee.department || 'Pharmacy',
      hireDate: employee.hireDate || '',
      status: employee.status || 'Active',
      salary: employee.salary || '',
      address: employee.address || '',
    });

    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.position.trim()
    ) {
      alert(
        'Please fill in Name, Phone and Position.'
      );

      return;
    }

    if (editingEmployee) {
      setEmployeeList((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                ...form,
                salary:
                  Number(form.salary) || 0,
              }
            : employee
        )
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        employeeId: `EMP-${String(
          employeeList.length + 1
        ).padStart(3, '0')}`,
        ...form,
        salary:
          Number(form.salary) || 0,
      };

      setEmployeeList((previous) => [
        newEmployee,
        ...previous,
      ]);
    }

    setShowForm(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const confirmDelete = () => {
    if (!deleteEmployee) return;

    setEmployeeList((previous) =>
      previous.filter(
        (employee) =>
          employee.id !== deleteEmployee.id
      )
    );

    setDeleteEmployee(null);
  };

  const getStatusClass = (employeeStatus) => {
    if (employeeStatus === 'Active') {
      return 'active';
    }

    if (employeeStatus === 'On Leave') {
      return 'leave';
    }

    return 'inactive';
  };

  return (
    <div className="employees-page">
      <PageHeader
        title="Employees"
        subtitle="Manage pharmacy staff and employee information."
      />

      {/* Statistics */}

      <div className="employee-stats">
        <div className="employee-stat-card">
          <div className="employee-stat-icon blue">
            <Users size={21} />
          </div>

          <div>
            <span>Total Employees</span>
            <strong>
              {statistics.total}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon green">
            <UserCheck size={21} />
          </div>

          <div>
            <span>Active</span>
            <strong>
              {statistics.active}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon orange">
            <Calendar size={21} />
          </div>

          <div>
            <span>On Leave</span>
            <strong>
              {statistics.leave}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon red">
            <UserX size={21} />
          </div>

          <div>
            <span>Inactive</span>
            <strong>
              {statistics.inactive}
            </strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}

      <div className="employees-toolbar">
        <div className="employee-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={department}
          onChange={(event) =>
            setDepartment(event.target.value)
          }
          className="employee-filter"
        >
          {departments.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="employee-filter"
        >
          <option value="All Status">
            All Status
          </option>
          <option value="Active">
            Active
          </option>
          <option value="On Leave">
            On Leave
          </option>
          <option value="Inactive">
            Inactive
          </option>
        </select>

        <button
          className="employee-add-button"
          onClick={openAddForm}
        >
          <Plus size={17} />
          Add Employee
        </button>
      </div>

      {/* Table */}

      <div className="employees-card">
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map(
                (employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-name-cell">
                        <div className="employee-avatar">
                          {employee.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {employee.name}
                          </strong>

                          <span>
                            {employee.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="employee-position">
                        {employee.position}
                      </span>
                    </td>

                    <td>
                      <span className="employee-department">
                        {employee.department}
                      </span>
                    </td>

                    <td>
                      <div className="employee-contact">
                        <span>
                          <Phone size={12} />
                          {employee.phone}
                        </span>

                        <span>
                          <Mail size={12} />
                          {employee.email}
                        </span>
                      </div>
                    </td>

                    <td>
                      {employee.hireDate}
                    </td>

                    <td>
                      <span
                        className={`employee-status ${getStatusClass(
                          employee.status
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td>
                      <div className="employee-actions">
                        <button
                          title="View"
                          onClick={() => {
                            setSelectedEmployee(
                              employee
                            );
                            setShowDetails(true);
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            openEditForm(
                              employee
                            )
                          }
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          title="Delete"
                          className="danger"
                          onClick={() =>
                            setDeleteEmployee(
                              employee
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="employees-empty">
              <Users size={35} />

              <h3>
                No employees found
              </h3>

              <p>
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h3>
                  {editingEmployee
                    ? 'Edit Employee'
                    : 'Add Employee'}
                </h3>

                <p>
                  Enter employee information below.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >
              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label>
                    Full Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="employee-form-group">
                  <label>
                    Phone *
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+93 700 000 000"
                  />
                </div>

                <div className="employee-form-group">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@medicore.com"
                  />
                </div>

                <div className="employee-form-group">
                  <label>
                    Position *
                  </label>

                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="e.g. Pharmacist"
                  />
                </div>

                <div className="employee-form-group">
                  <label>
                    Department
                  </label>

                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                  >
                    <option>
                      Pharmacy
                    </option>

                    <option>
                      Sales
                    </option>

                    <option>
                      Inventory
                    </option>

                    <option>
                      Management
                    </option>
                  </select>
                </div>

                <div className="employee-form-group">
                  <label>
                    Hire Date
                  </label>

                  <input
                    type="date"
                    name="hireDate"
                    value={form.hireDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="employee-form-group">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>
                      Active
                    </option>

                    <option>
                      On Leave
                    </option>

                    <option>
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="employee-form-group">
                  <label>
                    Monthly Salary
                  </label>

                  <input
                    type="number"
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="employee-form-group full">
                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Employee address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="employee-modal-footer">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save-button"
                >
                  <Save size={16} />

                  {editingEmployee
                    ? 'Update Employee'
                    : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}

      {showDetails &&
        selectedEmployee && (
          <div className="employee-modal-overlay">
            <div className="employee-details-modal">
              <div className="employee-modal-header">
                <div>
                  <h3>
                    Employee Details
                  </h3>

                  <p>
                    Complete employee information
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowDetails(false)
                  }
                >
                  <X size={19} />
                </button>
              </div>

              <div className="employee-profile-header">
                <div className="employee-large-avatar">
                  {selectedEmployee.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2>
                    {selectedEmployee.name}
                  </h2>

                  <p>
                    {selectedEmployee.position}
                  </p>

                  <span
                    className={`employee-status ${getStatusClass(
                      selectedEmployee.status
                    )}`}
                  >
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>

              <div className="employee-details-grid">
                <div>
                  <span>Employee ID</span>
                  <strong>
                    {selectedEmployee.employeeId}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {selectedEmployee.department}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {selectedEmployee.phone}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {selectedEmployee.email}
                  </strong>
                </div>

                <div>
                  <span>Hire Date</span>
                  <strong>
                    {selectedEmployee.hireDate}
                  </strong>
                </div>

                <div>
                  <span>Monthly Salary</span>
                  <strong>
                    $
                    {Number(
                      selectedEmployee.salary || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="full">
                  <span>Address</span>
                  <strong>
                    {selectedEmployee.address}
                  </strong>
                </div>
              </div>

              <div className="employee-modal-footer">
                <button
                  className="employee-cancel-button"
                  onClick={() =>
                    setShowDetails(false)
                  }
                >
                  Close
                </button>

                <button
                  className="employee-save-button"
                  onClick={() => {
                    setShowDetails(false);
                    openEditForm(
                      selectedEmployee
                    );
                  }}
                >
                  <Edit3 size={16} />
                  Edit Employee
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation */}

      {deleteEmployee && (
        <div className="employee-modal-overlay">
          <div className="employee-delete-modal">
            <div className="delete-warning-icon">
              <AlertTriangle size={25} />
            </div>

            <h3>
              Delete Employee?
            </h3>

            <p>
              Are you sure you want to delete{' '}
              <strong>
                {deleteEmployee.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="employee-delete-actions">
              <button
                onClick={() =>
                  setDeleteEmployee(null)
                }
              >
                Cancel
              </button>

              <button
                className="confirm-delete"
                onClick={confirmDelete}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;