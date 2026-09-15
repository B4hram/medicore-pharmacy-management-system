import { useMemo, useState } from 'react';
import {
  Edit3,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import { customersData } from '../data/customersData';
import '../styles/customers.css';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  emergencyContact: '',
  bloodGroup: '',
  allergies: '',
  notes: '',
  status: 'Active',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function Customers() {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('medicore_customers');

    return saved ? JSON.parse(saved) : customersData;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const saveCustomers = (updatedCustomers) => {
    setCustomers(updatedCustomers);
    localStorage.setItem(
      'medicore_customers',
      JSON.stringify(updatedCustomers)
    );
  };

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.customerCode.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'All' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const totalCustomers = customers.length;

    const activeCustomers = customers.filter(
      (customer) => customer.status === 'Active'
    ).length;

    const inactiveCustomers = customers.filter(
      (customer) => customer.status === 'Inactive'
    ).length;

    const totalRevenue = customers.reduce(
      (sum, customer) => sum + Number(customer.totalSpent || 0),
      0
    );

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalRevenue,
    };
  }, [customers]);

  const openAddForm = () => {
    setEditingCustomer(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      gender: customer.gender || '',
      dateOfBirth: customer.dateOfBirth || '',
      address: customer.address || '',
      emergencyContact: customer.emergencyContact || '',
      bloodGroup: customer.bloodGroup || '',
      allergies: customer.allergies || '',
      notes: customer.notes || '',
      status: customer.status || 'Active',
    });

    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Customer name is required.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }

    return errors;
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingCustomer) {
      const updatedCustomers = customers.map((customer) =>
        customer.id === editingCustomer.id
          ? {
              ...customer,
              ...formData,
            }
          : customer
      );

      saveCustomers(updatedCustomers);
    } else {
      const newCustomer = {
        id: Date.now(),
        customerCode: `CUS-${1000 + customers.length + 1}`,
        ...formData,
        totalPurchases: 0,
        totalSpent: 0,
        lastVisit: '',
        registeredDate: new Date().toISOString().split('T')[0],
      };

      saveCustomers([newCustomer, ...customers]);
    }

    setShowForm(false);
    setEditingCustomer(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const deleteCustomer = () => {
    if (!customerToDelete) return;

    const updatedCustomers = customers.filter(
      (customer) => customer.id !== customerToDelete.id
    );

    saveCustomers(updatedCustomers);

    setCustomerToDelete(null);

    if (selectedCustomer?.id === customerToDelete.id) {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="customers-page">
      <PageHeader
        title="Customer Management"
        description="Manage pharmacy customers, records, and purchase history."
      />

      <div className="customer-stats-grid">
        <div className="customer-stat-card">
          <div className="customer-stat-icon blue">
            <Users size={21} />
          </div>

          <div>
            <span>Total Customers</span>
            <strong>{statistics.totalCustomers}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon green">
            <UserCheck size={21} />
          </div>

          <div>
            <span>Active Customers</span>
            <strong>{statistics.activeCustomers}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon orange">
            <User size={21} />
          </div>

          <div>
            <span>Inactive Customers</span>
            <strong>{statistics.inactiveCustomers}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon purple">
            <span className="currency-symbol">$</span>
          </div>

          <div>
            <span>Total Customer Spending</span>
            <strong>{formatCurrency(statistics.totalRevenue)}</strong>
          </div>
        </div>
      </div>

      <div className="customer-content-card">
        <div className="customer-toolbar">
          <div className="customer-search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="customer-toolbar-actions">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button className="customer-primary-button" onClick={openAddForm}>
              <Plus size={17} />
              Add Customer
            </button>
          </div>
        </div>

        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Purchases</th>
                <th>Total Spent</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="customer-empty-state">
                      <Users size={38} />
                      <h3>No customers found</h3>
                      <p>Try changing your search or filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>{customer.customerCode}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="customer-contact-cell">
                        <span>
                          <Phone size={13} />
                          {customer.phone}
                        </span>

                        {customer.email && (
                          <span>
                            <Mail size={13} />
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="customer-address-cell">
                        <MapPin size={14} />
                        {customer.address || '—'}
                      </div>
                    </td>

                    <td>
                      <strong>{customer.totalPurchases}</strong>
                    </td>

                    <td>
                      <strong className="customer-money">
                        {formatCurrency(customer.totalSpent)}
                      </strong>
                    </td>

                    <td>{formatDate(customer.lastVisit)}</td>

                    <td>
                      <span
                        className={`customer-status ${
                          customer.status === 'Active'
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>

                    <td>
                      <div className="customer-action-buttons">
                        <button
                          title="View customer"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          title="Edit customer"
                          onClick={() => openEditForm(customer)}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          title="Delete customer"
                          className="danger"
                          onClick={() => setCustomerToDelete(customer)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="customer-table-footer">
          Showing <strong>{filteredCustomers.length}</strong> of{' '}
          <strong>{customers.length}</strong> customers
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="customer-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="customer-details-modal">
            <div className="customer-modal-header">
              <div>
                <span className="customer-modal-eyebrow">
                  CUSTOMER PROFILE
                </span>
                <h2>{selectedCustomer.name}</h2>
                <p>{selectedCustomer.customerCode}</p>
              </div>

              <button onClick={() => setSelectedCustomer(null)}>
                <X size={19} />
              </button>
            </div>

            <div className="customer-details-content">
              <div className="customer-profile-summary">
                <div className="customer-large-avatar">
                  {selectedCustomer.name.charAt(0)}
                </div>

                <div>
                  <h3>{selectedCustomer.name}</h3>
                  <span>{selectedCustomer.status} Customer</span>
                </div>
              </div>

              <div className="customer-detail-stats">
                <div>
                  <span>Total Purchases</span>
                  <strong>{selectedCustomer.totalPurchases}</strong>
                </div>

                <div>
                  <span>Total Spent</span>
                  <strong>
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </strong>
                </div>

                <div>
                  <span>Last Visit</span>
                  <strong>
                    {formatDate(selectedCustomer.lastVisit)}
                  </strong>
                </div>
              </div>

              <div className="customer-info-section">
                <h3>Personal Information</h3>

                <div className="customer-info-grid">
                  <div>
                    <span>Phone</span>
                    <strong>{selectedCustomer.phone}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{selectedCustomer.email || '—'}</strong>
                  </div>

                  <div>
                    <span>Gender</span>
                    <strong>{selectedCustomer.gender || '—'}</strong>
                  </div>

                  <div>
                    <span>Date of Birth</span>
                    <strong>
                      {formatDate(selectedCustomer.dateOfBirth)}
                    </strong>
                  </div>

                  <div>
                    <span>Blood Group</span>
                    <strong>{selectedCustomer.bloodGroup || '—'}</strong>
                  </div>

                  <div>
                    <span>Emergency Contact</span>
                    <strong>
                      {selectedCustomer.emergencyContact || '—'}
                    </strong>
                  </div>

                  <div className="full">
                    <span>Address</span>
                    <strong>{selectedCustomer.address || '—'}</strong>
                  </div>

                  <div className="full">
                    <span>Allergies</span>
                    <strong>{selectedCustomer.allergies || 'None known'}</strong>
                  </div>

                  <div className="full">
                    <span>Notes</span>
                    <strong>{selectedCustomer.notes || 'No notes available.'}</strong>
                  </div>
                </div>
              </div>

              <div className="customer-purchase-history">
                <div className="customer-history-header">
                  <div>
                    <h3>Purchase History</h3>
                    <p>Customer transaction summary</p>
                  </div>
                </div>

                <div className="customer-history-empty">
                  <div>
                    <span>Purchase records</span>
                    <strong>{selectedCustomer.totalPurchases}</strong>
                  </div>

                  <div>
                    <span>Lifetime spending</span>
                    <strong>
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </strong>
                  </div>

                  <div>
                    <span>Registered</span>
                    <strong>
                      {formatDate(selectedCustomer.registeredDate)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button
                className="customer-secondary-button"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>

              <button
                className="customer-primary-button"
                onClick={() => {
                  setSelectedCustomer(null);
                  openEditForm(selectedCustomer);
                }}
              >
                <Edit3 size={16} />
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showForm && (
        <div className="customer-modal-overlay">
          <div className="customer-form-modal">
            <div className="customer-modal-header">
              <div>
                <span className="customer-modal-eyebrow">
                  CUSTOMER MANAGEMENT
                </span>

                <h2>
                  {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                </h2>

                <p>
                  {editingCustomer
                    ? 'Update customer information.'
                    : 'Create a new pharmacy customer record.'}
                </p>
              </div>

              <button onClick={() => setShowForm(false)}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="customer-form">
              <div className="customer-form-section">
                <h3>Basic Information</h3>

                <div className="customer-form-grid">
                  <label>
                    Customer Name *
                    <input
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          name: event.target.value,
                        })
                      }
                      placeholder="Enter customer name"
                    />

                    {formErrors.name && (
                      <small>{formErrors.name}</small>
                    )}
                  </label>

                  <label>
                    Phone Number *
                    <input
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          phone: event.target.value,
                        })
                      }
                      placeholder="+93 700 000 000"
                    />

                    {formErrors.phone && (
                      <small>{formErrors.phone}</small>
                    )}
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          email: event.target.value,
                        })
                      }
                      placeholder="customer@example.com"
                    />

                    {formErrors.email && (
                      <small>{formErrors.email}</small>
                    )}
                  </label>

                  <label>
                    Gender
                    <select
                      value={formData.gender}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          gender: event.target.value,
                        })
                      }
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </label>

                  <label>
                    Date of Birth
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Blood Group
                    <select
                      value={formData.bloodGroup}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          bloodGroup: event.target.value,
                        })
                      }
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </label>

                  <label>
                    Emergency Contact
                    <input
                      value={formData.emergencyContact}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          emergencyContact: event.target.value,
                        })
                      }
                      placeholder="+93 700 000 000"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={formData.status}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          status: event.target.value,
                        })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>

                  <label className="full">
                    Address
                    <input
                      value={formData.address}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          address: event.target.value,
                        })
                      }
                      placeholder="Customer address"
                    />
                  </label>

                  <label className="full">
                    Allergies
                    <input
                      value={formData.allergies}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          allergies: event.target.value,
                        })
                      }
                      placeholder="Known allergies"
                    />
                  </label>

                  <label className="full">
                    Notes
                    <textarea
                      value={formData.notes}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          notes: event.target.value,
                        })
                      }
                      placeholder="Additional customer notes..."
                      rows="4"
                    />
                  </label>
                </div>
              </div>

              <div className="customer-modal-footer">
                <button
                  type="button"
                  className="customer-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="customer-primary-button">
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {customerToDelete && (
        <div className="customer-modal-overlay">
          <div className="customer-delete-modal">
            <div className="customer-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2>Delete Customer?</h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>{customerToDelete.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="customer-delete-actions">
              <button
                className="customer-secondary-button"
                onClick={() => setCustomerToDelete(null)}
              >
                Cancel
              </button>

              <button
                className="customer-danger-button"
                onClick={deleteCustomer}
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;