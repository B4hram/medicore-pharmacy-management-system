import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react';

import { purchasesData } from '../data/purchasesData';
import { suppliersData } from '../data/suppliersData';

import '../styles/purchases.css';

const PURCHASE_STORAGE_KEY = 'medicore_purchases';
const SUPPLIER_STORAGE_KEY = 'medicore_suppliers';

const emptyItem = {
  medicineName: '',
  batchNumber: '',
  quantity: '',
  unit: 'boxes',
  purchasePrice: '',
  sellingPrice: '',
  expiryDate: '',
};

const emptyForm = {
  supplierId: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  expectedDate: '',
  status: 'Pending',
  paymentStatus: 'Unpaid',
  discount: '0',
  tax: '0',
  notes: '',
  items: [{ ...emptyItem }],
};

function readPurchases() {
  try {
    const stored = localStorage.getItem(PURCHASE_STORAGE_KEY);

    if (stored) return JSON.parse(stored);
  } catch {
    // Use demo data.
  }

  return purchasesData;
}

function readSuppliers() {
  try {
    const stored = localStorage.getItem(SUPPLIER_STORAGE_KEY);

    if (stored) return JSON.parse(stored);
  } catch {
    // Use demo data.
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

function getPurchaseStatusClass(status) {
  return String(status || '').toLowerCase().replace(/\s+/g, '-');
}

function Purchases() {
  const [purchases, setPurchases] = useState(readPurchases);
  const [suppliers] = useState(readSuppliers);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  const [expandedPurchaseId, setExpandedPurchaseId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(purchases));
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return purchases
      .filter((purchase) => {
        const matchesSearch =
          !search ||
          purchase.purchaseNumber.toLowerCase().includes(search) ||
          purchase.supplierName.toLowerCase().includes(search) ||
          purchase.items.some((item) =>
            item.medicineName.toLowerCase().includes(search)
          );

        const matchesStatus =
          statusFilter === 'All' || purchase.status === statusFilter;

        const matchesPayment =
          paymentFilter === 'All' ||
          purchase.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
      })
      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
  }, [purchases, searchTerm, statusFilter, paymentFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPurchases.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedPurchases = filteredPurchases.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const stats = useMemo(() => {
    const received = purchases.filter(
      (purchase) => purchase.status === 'Received'
    );

    const pending = purchases.filter(
      (purchase) => purchase.status === 'Pending'
    );

    const totalValue = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.total || 0),
      0
    );

    const unpaid = purchases
      .filter((purchase) => purchase.paymentStatus === 'Unpaid')
      .reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);

    return {
      total: purchases.length,
      received: received.length,
      pending: pending.length,
      totalValue,
      unpaid,
    };
  }, [purchases]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, itemsPerPage]);

  function calculateTotals(items, discount, tax) {
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.purchasePrice) || 0;

      return sum + quantity * price;
    }, 0);

    const discountValue = Number(discount) || 0;
    const taxValue = Number(tax) || 0;

    return {
      subtotal,
      discount: discountValue,
      tax: taxValue,
      total: Math.max(0, subtotal - discountValue + taxValue),
    };
  }

  const formTotals = calculateTotals(
    formData.items,
    formData.discount,
    formData.tax
  );

  function openAddForm() {
    setEditingPurchase(null);

    setFormData({
      ...emptyForm,
      supplierId: suppliers[0]?.id ? String(suppliers[0].id) : '',
      items: [{ ...emptyItem }],
    });

    setFormErrors({});
    setShowForm(true);
  }

  function openEditForm(purchase) {
    setEditingPurchase(purchase);

    setFormData({
      supplierId: String(purchase.supplierId || ''),
      purchaseDate: purchase.purchaseDate || '',
      expectedDate: purchase.expectedDate || '',
      status: purchase.status || 'Pending',
      paymentStatus: purchase.paymentStatus || 'Unpaid',
      discount: String(purchase.discount || 0),
      tax: String(purchase.tax || 0),
      notes: purchase.notes || '',
      items: purchase.items.map((item) => ({
        medicineName: item.medicineName || '',
        batchNumber: item.batchNumber || '',
        quantity: item.quantity || '',
        unit: item.unit || 'boxes',
        purchasePrice: item.purchasePrice || '',
        sellingPrice: item.sellingPrice || '',
        expiryDate: item.expiryDate || '',
      })),
    });

    setFormErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingPurchase(null);
    setFormErrors({});
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateItem(index, field, value) {
    setFormData((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  }

  function addItem() {
    setFormData((previous) => ({
      ...previous,
      items: [...previous.items, { ...emptyItem }],
    }));
  }

  function removeItem(index) {
    if (formData.items.length === 1) return;

    setFormData((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function validateForm() {
    const errors = {};

    if (!formData.supplierId) {
      errors.supplierId = 'Please select a supplier.';
    }

    if (!formData.purchaseDate) {
      errors.purchaseDate = 'Purchase date is required.';
    }

    if (formData.items.length === 0) {
      errors.items = 'Add at least one medicine.';
    }

    formData.items.forEach((item, index) => {
      if (!item.medicineName.trim()) {
        errors[`medicine-${index}`] = 'Medicine name is required.';
      }

      if (!item.batchNumber.trim()) {
        errors[`batch-${index}`] = 'Batch number is required.';
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        errors[`quantity-${index}`] = 'Quantity must be greater than 0.';
      }

      if (!item.purchasePrice || Number(item.purchasePrice) <= 0) {
        errors[`price-${index}`] = 'Purchase price is required.';
      }

      if (!item.expiryDate) {
        errors[`expiry-${index}`] = 'Expiry date is required.';
      }
    });

    return errors;
  }

  function savePurchase(event) {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const supplier = suppliers.find(
      (item) => String(item.id) === String(formData.supplierId)
    );

    const preparedItems = formData.items.map((item, index) => ({
      id: index + 1,
      medicineId: Date.now() + index,
      medicineName: item.medicineName.trim(),
      batchNumber: item.batchNumber.trim(),
      quantity: Number(item.quantity),
      unit: item.unit,
      purchasePrice: Number(item.purchasePrice),
      sellingPrice: Number(item.sellingPrice || 0),
      expiryDate: item.expiryDate,
      subtotal:
        Number(item.quantity || 0) * Number(item.purchasePrice || 0),
    }));

    const totals = calculateTotals(
      preparedItems,
      formData.discount,
      formData.tax
    );

    if (editingPurchase) {
      setPurchases((previous) =>
        previous.map((purchase) =>
          purchase.id === editingPurchase.id
            ? {
                ...purchase,
                supplierId: Number(formData.supplierId),
                supplierName: supplier?.name || 'Unknown Supplier',
                purchaseDate: formData.purchaseDate,
                expectedDate: formData.expectedDate,
                status: formData.status,
                paymentStatus: formData.paymentStatus,
                discount: totals.discount,
                tax: totals.tax,
                subtotal: totals.subtotal,
                total: totals.total,
                notes: formData.notes,
                items: preparedItems,
              }
            : purchase
        )
      );
    } else {
      const nextId =
        purchases.length > 0
          ? Math.max(...purchases.map((purchase) => purchase.id)) + 1
          : 1;

      const purchaseNumber = `PO-2026-${String(nextId).padStart(3, '0')}`;

      setPurchases((previous) => [
        {
          id: nextId,
          purchaseNumber,
          supplierId: Number(formData.supplierId),
          supplierName: supplier?.name || 'Unknown Supplier',
          purchaseDate: formData.purchaseDate,
          expectedDate: formData.expectedDate,
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          total: totals.total,
          notes: formData.notes,
          items: preparedItems,
        },
        ...previous,
      ]);
    }

    closeForm();
  }

  function deletePurchase() {
    if (!purchaseToDelete) return;

    setPurchases((previous) =>
      previous.filter((purchase) => purchase.id !== purchaseToDelete.id)
    );

    setPurchaseToDelete(null);
  }

  function toggleExpanded(id) {
    setExpandedPurchaseId((previous) => (previous === id ? null : id));
  }

  return (
    <div className="purchases-page">
      <div className="purchases-page-header">
        <div>
          <h1>Purchase Management</h1>
          <p>
            Manage supplier purchases, incoming stock, batches, and payment
            status.
          </p>
        </div>

        <button className="purchase-primary-button" onClick={openAddForm}>
          <Plus size={16} />
          New Purchase
        </button>
      </div>

      {/* SUMMARY */}

      <div className="purchase-stats-grid">
        <div className="purchase-stat-card">
          <div className="purchase-stat-icon blue">
            <ClipboardList size={20} />
          </div>

          <div>
            <span>Total Purchase Orders</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="purchase-stat-card">
          <div className="purchase-stat-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Received</span>
            <strong>{stats.received}</strong>
          </div>
        </div>

        <div className="purchase-stat-card">
          <div className="purchase-stat-icon orange">
            <Truck size={20} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <div className="purchase-stat-card">
          <div className="purchase-stat-icon purple">
            <Package size={20} />
          </div>

          <div>
            <span>Total Purchase Value</span>
            <strong>{formatCurrency(stats.totalValue)}</strong>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}

      <div className="purchases-toolbar">
        <div className="purchase-search-box">
          <Search size={16} />

          <input
            placeholder="Search purchase, supplier, medicine..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="purchase-filter-group">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="purchases-table-card">
        <div className="purchases-table-wrapper">
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Purchase</th>
                <th>Supplier</th>
                <th>Purchase Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>
                    <strong className="purchase-number">
                      {purchase.purchaseNumber}
                    </strong>
                  </td>

                  <td>
                    <div className="purchase-supplier">
                      <div className="purchase-supplier-icon">
                        <Truck size={15} />
                      </div>

                      <span>{purchase.supplierName}</span>
                    </div>
                  </td>

                  <td>{formatDate(purchase.purchaseDate)}</td>

                  <td>
                    <span className="purchase-item-count">
                      {purchase.items.length}
                    </span>
                  </td>

                  <td className="purchase-total">
                    {formatCurrency(purchase.total)}
                  </td>

                  <td>
                    <span
                      className={`purchase-status ${getPurchaseStatusClass(
                        purchase.status
                      )}`}
                    >
                      {purchase.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`purchase-payment-status ${String(
                        purchase.paymentStatus
                      ).toLowerCase()}`}
                    >
                      {purchase.paymentStatus}
                    </span>
                  </td>

                  <td>
                    <div className="purchase-actions">
                      <button
                        className="purchase-icon-button"
                        title="View"
                        onClick={() => setSelectedPurchase(purchase)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="purchase-icon-button"
                        title="Expand"
                        onClick={() => toggleExpanded(purchase.id)}
                      >
                        {expandedPurchaseId === purchase.id ? (
                          <ChevronUp size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </button>

                      <button
                        className="purchase-icon-button"
                        title="Edit"
                        onClick={() => openEditForm(purchase)}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        className="purchase-icon-button danger"
                        title="Delete"
                        onClick={() => setPurchaseToDelete(purchase)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedPurchases.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="purchases-empty-state">
                      <ClipboardList size={35} />
                      <h3>No purchases found</h3>
                      <p>Try changing your filters or search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* EXPANDED PURCHASE */}

        {expandedPurchaseId &&
          (() => {
            const purchase = purchases.find(
              (item) => item.id === expandedPurchaseId
            );

            if (!purchase) return null;

            return (
              <div className="purchase-expanded-panel">
                <div className="purchase-expanded-header">
                  <div>
                    <strong>{purchase.purchaseNumber}</strong>
                    <span>{purchase.supplierName}</span>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>{formatCurrency(purchase.total)}</strong>
                  </div>
                </div>

                <div className="purchase-items-table-wrapper">
                  <table className="purchase-items-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Batch</th>
                        <th>Quantity</th>
                        <th>Purchase Price</th>
                        <th>Expiry</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchase.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.medicineName}</td>
                          <td>{item.batchNumber}</td>
                          <td>
                            {item.quantity} {item.unit}
                          </td>
                          <td>{formatCurrency(item.purchasePrice)}</td>
                          <td>{formatDate(item.expiryDate)}</td>
                          <td>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

        <div className="purchases-pagination">
          <span>
            Showing{' '}
            {filteredPurchases.length === 0
              ? 0
              : (safePage - 1) * itemsPerPage + 1}{' '}
            to {Math.min(safePage * itemsPerPage, filteredPurchases.length)} of{' '}
            {filteredPurchases.length}
          </span>

          <div className="purchase-pagination-buttons">
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

      {/* ADD / EDIT PURCHASE MODAL */}

      {showForm && (
        <div className="purchase-modal-overlay">
          <div className="purchase-form-modal">
            <div className="purchase-modal-header">
              <div>
                <h2>
                  {editingPurchase ? 'Edit Purchase' : 'Create New Purchase'}
                </h2>

                <p>
                  Record incoming medicine stock from your supplier.
                </p>
              </div>

              <button
                className="purchase-modal-close"
                onClick={closeForm}
              >
                <X size={18} />
              </button>
            </div>

            <form className="purchase-form" onSubmit={savePurchase}>
              <div className="purchase-form-section">
                <div className="purchase-section-title">
                  <Truck size={15} />
                  Supplier & Purchase Information
                </div>

                <div className="purchase-form-grid three">
                  <div className="purchase-form-group">
                    <label>
                      Supplier <span>*</span>
                    </label>

                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleFormChange}
                      className={formErrors.supplierId ? 'error' : ''}
                    >
                      <option value="">Select supplier</option>

                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>

                    {formErrors.supplierId && (
                      <small>{formErrors.supplierId}</small>
                    )}
                  </div>

                  <div className="purchase-form-group">
                    <label>
                      Purchase Date <span>*</span>
                    </label>

                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="purchase-form-group">
                    <label>Expected Delivery</label>

                    <input
                      type="date"
                      name="expectedDate"
                      value={formData.expectedDate}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="purchase-form-group">
                    <label>Status</label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Received">Received</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="purchase-form-group">
                    <label>Payment Status</label>

                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleFormChange}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="purchase-form-section">
                <div className="purchase-section-title">
                  <Package size={15} />
                  Medicines
                </div>

                <div className="purchase-items-form">
                  {formData.items.map((item, index) => (
                    <div className="purchase-item-form-row" key={index}>
                      <div className="purchase-form-group">
                        <label>
                          Medicine <span>*</span>
                        </label>

                        <input
                          value={item.medicineName}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'medicineName',
                              event.target.value
                            )
                          }
                          placeholder="Medicine name"
                        />

                        {formErrors[`medicine-${index}`] && (
                          <small>{formErrors[`medicine-${index}`]}</small>
                        )}
                      </div>

                      <div className="purchase-form-group">
                        <label>
                          Batch <span>*</span>
                        </label>

                        <input
                          value={item.batchNumber}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'batchNumber',
                              event.target.value
                            )
                          }
                          placeholder="Batch number"
                        />
                      </div>

                      <div className="purchase-form-group">
                        <label>
                          Quantity <span>*</span>
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'quantity',
                              event.target.value
                            )
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="purchase-form-group">
                        <label>Unit</label>

                        <select
                          value={item.unit}
                          onChange={(event) =>
                            updateItem(index, 'unit', event.target.value)
                          }
                        >
                          <option value="boxes">Boxes</option>
                          <option value="bottles">Bottles</option>
                          <option value="packs">Packs</option>
                          <option value="pieces">Pieces</option>
                          <option value="strips">Strips</option>
                        </select>
                      </div>

                      <div className="purchase-form-group">
                        <label>
                          Purchase Price <span>*</span>
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.purchasePrice}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'purchasePrice',
                              event.target.value
                            )
                          }
                          placeholder="0.00"
                        />
                      </div>

                      <div className="purchase-form-group">
                        <label>Selling Price</label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.sellingPrice}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'sellingPrice',
                              event.target.value
                            )
                          }
                          placeholder="0.00"
                        />
                      </div>

                      <div className="purchase-form-group">
                        <label>
                          Expiry Date <span>*</span>
                        </label>

                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(event) =>
                            updateItem(
                              index,
                              'expiryDate',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="purchase-remove-item"
                        disabled={formData.items.length === 1}
                        onClick={() => removeItem(index)}
                        title="Remove medicine"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="purchase-add-item"
                  onClick={addItem}
                >
                  <Plus size={14} />
                  Add Another Medicine
                </button>
              </div>

              <div className="purchase-form-section">
                <div className="purchase-section-title">
                  <ClipboardList size={15} />
                  Purchase Summary
                </div>

                <div className="purchase-summary-grid">
                  <div className="purchase-form-group">
                    <label>Discount</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="discount"
                      value={formData.discount}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="purchase-form-group">
                    <label>Tax</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="tax"
                      value={formData.tax}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="purchase-totals-box">
                    <div>
                      <span>Subtotal</span>
                      <strong>{formatCurrency(formTotals.subtotal)}</strong>
                    </div>

                    <div>
                      <span>Discount</span>
                      <strong>-{formatCurrency(formTotals.discount)}</strong>
                    </div>

                    <div>
                      <span>Tax</span>
                      <strong>+{formatCurrency(formTotals.tax)}</strong>
                    </div>

                    <div className="grand-total">
                      <span>Grand Total</span>
                      <strong>{formatCurrency(formTotals.total)}</strong>
                    </div>
                  </div>
                </div>

                <div className="purchase-form-group purchase-notes">
                  <label>Notes</label>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    placeholder="Additional purchase notes..."
                  />
                </div>
              </div>

              <div className="purchase-form-footer">
                <button
                  type="button"
                  className="purchase-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="purchase-primary-button"
                >
                  {editingPurchase ? 'Save Purchase' : 'Create Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}

      {selectedPurchase && (
        <div className="purchase-modal-overlay">
          <div className="purchase-details-modal">
            <div className="purchase-modal-header">
              <div>
                <h2>{selectedPurchase.purchaseNumber}</h2>
                <p>{selectedPurchase.supplierName}</p>
              </div>

              <button
                className="purchase-modal-close"
                onClick={() => setSelectedPurchase(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="purchase-details-content">
              <div className="purchase-detail-summary">
                <div>
                  <span>Supplier</span>
                  <strong>{selectedPurchase.supplierName}</strong>
                </div>

                <div>
                  <span>Purchase Date</span>
                  <strong>
                    {formatDate(selectedPurchase.purchaseDate)}
                  </strong>
                </div>

                <div>
                  <span>Expected Delivery</span>
                  <strong>
                    {formatDate(selectedPurchase.expectedDate)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedPurchase.status}</strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>{selectedPurchase.paymentStatus}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{formatCurrency(selectedPurchase.total)}</strong>
                </div>
              </div>

              <div className="purchase-details-section">
                <h3>Purchased Medicines</h3>

                <div className="purchase-detail-items">
                  {selectedPurchase.items.map((item) => (
                    <div
                      className="purchase-detail-item"
                      key={item.id}
                    >
                      <div>
                        <strong>{item.medicineName}</strong>
                        <span>Batch: {item.batchNumber}</span>
                      </div>

                      <div>
                        <span>Quantity</span>
                        <strong>
                          {item.quantity} {item.unit}
                        </strong>
                      </div>

                      <div>
                        <span>Purchase Price</span>
                        <strong>
                          {formatCurrency(item.purchasePrice)}
                        </strong>
                      </div>

                      <div>
                        <span>Expiry</span>
                        <strong>{formatDate(item.expiryDate)}</strong>
                      </div>

                      <div>
                        <span>Subtotal</span>
                        <strong>{formatCurrency(item.subtotal)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="purchase-details-total">
                <div>
                  <span>Subtotal</span>
                  <strong>
                    {formatCurrency(selectedPurchase.subtotal)}
                  </strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>
                    -{formatCurrency(selectedPurchase.discount)}
                  </strong>
                </div>

                <div>
                  <span>Tax</span>
                  <strong>+{formatCurrency(selectedPurchase.tax)}</strong>
                </div>

                <div className="grand">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(selectedPurchase.total)}</strong>
                </div>
              </div>

              <div className="purchase-detail-note">
                <strong>Notes</strong>
                <p>{selectedPurchase.notes || 'No notes available.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {purchaseToDelete && (
        <div className="purchase-modal-overlay">
          <div className="purchase-delete-modal">
            <div className="purchase-delete-icon">
              <Trash2 size={21} />
            </div>

            <h2>Delete Purchase?</h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>{purchaseToDelete.purchaseNumber}</strong>?
            </p>

            <div className="purchase-delete-actions">
              <button
                className="purchase-secondary-button"
                onClick={() => setPurchaseToDelete(null)}
              >
                Cancel
              </button>

              <button
                className="purchase-danger-button"
                onClick={deletePurchase}
              >
                Delete Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchases;