import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Edit3,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import { suppliersData } from '../data/suppliersData';
import '../styles/suppliers.css';

const STORAGE_KEY = 'medicore_suppliers';

const emptyForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: 'Afghanistan',
  status: 'Active',
  notes: '',
};

function readSuppliers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Use demo data if localStorage is unavailable.
  }

  return suppliersData;
}

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function getInitials(name) {
  return String(name || 'Supplier')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Suppliers() {
  const [suppliers, setSuppliers] = useState(readSuppliers);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    const result = suppliers.filter((supplier) => {
      const matchesSearch =
        !search ||
        supplier.name.toLowerCase().includes(search) ||
        supplier.contactPerson.toLowerCase().includes(search) ||
        supplier.phone.toLowerCase().includes(search) ||
        supplier.email.toLowerCase().includes(search) ||
        supplier.supplierCode.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'All' || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name);

        case 'purchases-high':
          return b.totalAmount - a.totalAmount;

        case 'purchases-low':
          return a.totalAmount - b.totalAmount;

        case 'recent':
          return new Date(b.lastPurchase) - new Date(a.lastPurchase);

        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [suppliers, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedSuppliers = filteredSuppliers.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const stats = useMemo(() => {
    return {
      total: suppliers.length,
      active: suppliers.filter((supplier) => supplier.status === 'Active')
        .length,
      purchases: suppliers.reduce(
        (sum, supplier) => sum + Number(supplier.totalPurchases || 0),
        0
      ),
      amount: suppliers.reduce(
        (sum, supplier) => sum + Number(supplier.totalAmount || 0),
        0
      ),
    };
  }, [suppliers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  function openAddForm() {
    setEditingSupplier(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  }

  function openEditForm(supplier) {
    setEditingSupplier(supplier);

    setFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || 'Afghanistan',
      status: supplier.status || 'Active',
      notes: supplier.notes || '',
    });

    setFormErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingSupplier(null);
    setFormErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function validateForm() {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Supplier name is required.';
    }

    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person is required.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    return errors;
  }

  function saveSupplier(event) {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingSupplier) {
      setSuppliers((previous) =>
        previous.map((supplier) =>
          supplier.id === editingSupplier.id
            ? {
                ...supplier,
                ...formData,
              }
            : supplier
        )
      );
    } else {
      const nextId =
        suppliers.length > 0
          ? Math.max(...suppliers.map((supplier) => supplier.id)) + 1
          : 1;

      const supplierNumber = String(nextId).padStart(3, '0');

      setSuppliers((previous) => [
        {
          id: nextId,
          supplierCode: `SUP-${supplierNumber}`,
          ...formData,
          totalPurchases: 0,
          totalAmount: 0,
          lastPurchase: '',
        },
        ...previous,
      ]);
    }

    closeForm();
  }

  function confirmDelete() {
    if (!supplierToDelete) return;

    setSuppliers((previous) =>
      previous.filter((supplier) => supplier.id !== supplierToDelete.id)
    );

    if (selectedSupplier?.id === supplierToDelete.id) {
      setSelectedSupplier(null);
    }

    setSupplierToDelete(null);
  }

  return (
    <div className="suppliers-page">
      <div className="suppliers-page-header">
        <div>
          <h1>Supplier Management</h1>
          <p>
            Manage pharmaceutical suppliers, contacts, and purchasing
            relationships.
          </p>
        </div>

        <button className="supplier-primary-button" onClick={openAddForm}>
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      <div className="supplier-stats-grid">
        <div className="supplier-stat-card">
          <div className="supplier-stat-icon blue">
            <Building2 size={20} />
          </div>

          <div>
            <span>Total Suppliers</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="supplier-stat-card">
          <div className="supplier-stat-icon green">
            <Users size={20} />
          </div>

          <div>
            <span>Active Suppliers</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="supplier-stat-card">
          <div className="supplier-stat-icon orange">
            <Building2 size={20} />
          </div>

          <div>
            <span>Total Purchases</span>
            <strong>{stats.purchases}</strong>
          </div>
        </div>

        <div className="supplier-stat-card">
          <div className="supplier-stat-icon purple">
            <span>$</span>
          </div>

          <div>
            <span>Total Purchase Value</span>
            <strong>{formatCurrency(stats.amount)}</strong>
          </div>
        </div>
      </div>

      <div className="suppliers-toolbar">
        <div className="supplier-search-box">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search supplier, contact, phone, email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="supplier-filter-group">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="purchases-high">Highest Purchases</option>
            <option value="purchases-low">Lowest Purchases</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      <div className="suppliers-table-card">
        <div className="suppliers-table-wrapper">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Purchases</th>
                <th>Total Amount</th>
                <th>Last Purchase</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <div className="supplier-name-cell">
                      <div className="supplier-avatar">
                        {getInitials(supplier.name)}
                      </div>

                      <div>
                        <strong>{supplier.name}</strong>
                        <span>{supplier.supplierCode}</span>
                      </div>
                    </div>
                  </td>

                  <td>{supplier.contactPerson}</td>

                  <td>
                    <div className="supplier-contact">
                      <Phone size={12} />
                      {supplier.phone}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`supplier-status ${supplier.status.toLowerCase()}`}
                    >
                      {supplier.status}
                    </span>
                  </td>

                  <td>{supplier.totalPurchases}</td>

                  <td className="supplier-amount">
                    {formatCurrency(supplier.totalAmount)}
                  </td>

                  <td>{formatDate(supplier.lastPurchase)}</td>

                  <td>
                    <div className="supplier-actions">
                      <button
                        className="supplier-icon-button"
                        title="View Details"
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="supplier-icon-button"
                        title="Edit"
                        onClick={() => openEditForm(supplier)}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        className="supplier-icon-button danger"
                        title="Delete"
                        onClick={() => setSupplierToDelete(supplier)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedSuppliers.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="suppliers-empty-state">
                      <Building2 size={34} />
                      <h3>No suppliers found</h3>
                      <p>Try changing your search or filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="suppliers-pagination">
          <span>
            Showing{' '}
            {filteredSuppliers.length === 0
              ? 0
              : (safePage - 1) * itemsPerPage + 1}{' '}
            to {Math.min(safePage * itemsPerPage, filteredSuppliers.length)} of{' '}
            {filteredSuppliers.length}
          </span>

          <div className="supplier-pagination-buttons">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  className={safePage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              disabled={safePage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next
            </button>
          </div>

          <select
            value={itemsPerPage}
            onChange={(event) => setItemsPerPage(Number(event.target.value))}
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
          </select>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="supplier-modal-overlay">
          <div className="supplier-form-modal">
            <div className="supplier-modal-header">
              <div>
                <h2>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <p>
                  {editingSupplier
                    ? 'Update supplier information.'
                    : 'Create a new supplier record.'}
                </p>
              </div>

              <button className="supplier-modal-close" onClick={closeForm}>
                <X size={18} />
              </button>
            </div>

            <form className="supplier-form" onSubmit={saveSupplier}>
              <div className="supplier-form-grid">
                <div className="supplier-form-group">
                  <label>
                    Supplier Name <span>*</span>
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Enter supplier name"
                  />

                  {formErrors.name && (
                    <small>{formErrors.name}</small>
                  )}
                </div>

                <div className="supplier-form-group">
                  <label>
                    Contact Person <span>*</span>
                  </label>

                  <input
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={formErrors.contactPerson ? 'error' : ''}
                    placeholder="Enter contact person"
                  />

                  {formErrors.contactPerson && (
                    <small>{formErrors.contactPerson}</small>
                  )}
                </div>

                <div className="supplier-form-group">
                  <label>
                    Phone <span>*</span>
                  </label>

                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={formErrors.phone ? 'error' : ''}
                    placeholder="+93 700 000 000"
                  />

                  {formErrors.phone && <small>{formErrors.phone}</small>}
                </div>

                <div className="supplier-form-group">
                  <label>Email</label>

                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={formErrors.email ? 'error' : ''}
                    placeholder="supplier@example.com"
                  />

                  {formErrors.email && <small>{formErrors.email}</small>}
                </div>

                <div className="supplier-form-group">
                  <label>
                    City <span>*</span>
                  </label>

                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={formErrors.city ? 'error' : ''}
                    placeholder="Kabul"
                  />

                  {formErrors.city && <small>{formErrors.city}</small>}
                </div>

                <div className="supplier-form-group">
                  <label>Country</label>

                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="supplier-form-group full">
                  <label>Address</label>

                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Complete supplier address"
                  />
                </div>

                <div className="supplier-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="supplier-form-group full">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional supplier notes..."
                  />
                </div>
              </div>

              <div className="supplier-form-footer">
                <button
                  type="button"
                  className="supplier-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="supplier-primary-button"
                >
                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedSupplier && (
        <div className="supplier-modal-overlay">
          <div className="supplier-details-modal">
            <div className="supplier-modal-header">
              <div>
                <h2>Supplier Details</h2>
                <p>{selectedSupplier.supplierCode}</p>
              </div>

              <button
                className="supplier-modal-close"
                onClick={() => setSelectedSupplier(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="supplier-details-content">
              <div className="supplier-profile-header">
                <div className="supplier-large-avatar">
                  {getInitials(selectedSupplier.name)}
                </div>

                <div>
                  <h2>{selectedSupplier.name}</h2>

                  <span
                    className={`supplier-status ${selectedSupplier.status.toLowerCase()}`}
                  >
                    {selectedSupplier.status}
                  </span>
                </div>
              </div>

              <div className="supplier-detail-grid">
                <div>
                  <span>Contact Person</span>
                  <strong>{selectedSupplier.contactPerson}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{selectedSupplier.phone}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{selectedSupplier.email || '—'}</strong>
                </div>

                <div>
                  <span>City</span>
                  <strong>{selectedSupplier.city}</strong>
                </div>

                <div>
                  <span>Country</span>
                  <strong>{selectedSupplier.country}</strong>
                </div>

                <div>
                  <span>Last Purchase</span>
                  <strong>{formatDate(selectedSupplier.lastPurchase)}</strong>
                </div>

                <div className="full">
                  <span>Address</span>
                  <strong>{selectedSupplier.address || '—'}</strong>
                </div>
              </div>

              <div className="supplier-purchase-summary">
                <div>
                  <span>Total Purchase Orders</span>
                  <strong>{selectedSupplier.totalPurchases}</strong>
                </div>

                <div>
                  <span>Total Purchase Value</span>
                  <strong>
                    {formatCurrency(selectedSupplier.totalAmount)}
                  </strong>
                </div>
              </div>

              <div className="supplier-detail-notes">
                <div>
                  <Mail size={15} />
                  <strong>Supplier Notes</strong>
                </div>

                <p>{selectedSupplier.notes || 'No notes available.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {supplierToDelete && (
        <div className="supplier-modal-overlay">
          <div className="supplier-delete-modal">
            <div className="supplier-delete-icon">
              <Trash2 size={21} />
            </div>

            <h2>Delete Supplier?</h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>{supplierToDelete.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="supplier-delete-actions">
              <button
                className="supplier-secondary-button"
                onClick={() => setSupplierToDelete(null)}
              >
                Cancel
              </button>

              <button
                className="supplier-danger-button"
                onClick={confirmDelete}
              >
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;