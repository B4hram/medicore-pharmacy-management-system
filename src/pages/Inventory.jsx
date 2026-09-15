import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  PackageSearch,
  Pill,
  Search,
  X,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';

import { inventoryItems } from '../data/inventoryData';

import '../styles/inventory.css';

const getInventoryStatus = (quantity, minimumStock) => {
  const stock = Number(quantity) || 0;
  const minimum = Number(minimumStock) || 0;

  if (stock <= 0) return 'Out of Stock';
  if (stock <= minimum) return 'Low Stock';

  return 'In Stock';
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toFixed(2)}`;
};

const formatDate = (date) => {
  if (!date) return '-';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;

  const today = new Date();
  const expiry = new Date(`${expiryDate}T00:00:00`);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);

  if (days === null) {
    return {
      label: 'Unknown',
      className: 'unknown',
    };
  }

  if (days < 0) {
    return {
      label: 'Expired',
      className: 'expired',
    };
  }

  if (days <= 30) {
    return {
      label: 'Critical',
      className: 'critical',
    };
  }

  if (days <= 90) {
    return {
      label: 'Expiring Soon',
      className: 'soon',
    };
  }

  return {
    label: 'Good',
    className: 'good',
  };
};

function Inventory() {
  const [items, setItems] = useState(inventoryItems);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [sortBy, setSortBy] = useState('medicine-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [selectedItem, setSelectedItem] = useState(null);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);

  const [expandedBatch, setExpandedBatch] = useState(null);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category))].sort();
  }, [items]);

  /*
   * Add calculated values to inventory items.
   */
  const processedInventory = useMemo(() => {
    return items.map((item) => {
      const status = getInventoryStatus(
        item.quantity,
        item.minimumStock
      );

      const stockValue =
        Number(item.quantity || 0) *
        Number(item.purchasePrice || 0);

      const expiry = getExpiryStatus(item.expiryDate);

      return {
        ...item,
        status,
        stockValue,
        expiryStatus: expiry,
      };
    });
  }, [items]);

  /*
   * Group inventory by medicine.
   */
  const medicineGroups = useMemo(() => {
    const groups = {};

    processedInventory.forEach((item) => {
      if (!groups[item.medicineId]) {
        groups[item.medicineId] = {
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          genericName: item.genericName,
          category: item.category,
          batches: [],
        };
      }

      groups[item.medicineId].batches.push(item);
    });

    Object.values(groups).forEach((group) => {
      group.batches.sort(
        (a, b) =>
          new Date(a.expiryDate) -
          new Date(b.expiryDate)
      );
    });

    return Object.values(groups);
  }, [processedInventory]);

  /*
   * Find the FEFO batch.
   *
   * FEFO = First Expiry, First Out
   */
  const getSellFirstBatch = (batches) => {
    return [...batches]
      .filter((batch) => {
        const days = getDaysUntilExpiry(batch.expiryDate);

        return (
          Number(batch.quantity) > 0 &&
          days !== null &&
          days >= 0
        );
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate) -
          new Date(b.expiryDate)
      )[0];
  };

  /*
   * Filter inventory.
   */
  const filteredInventory = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = processedInventory.filter((item) => {
      const matchesSearch =
        !search ||
        item.medicineName
          ?.toLowerCase()
          .includes(search) ||
        item.genericName
          ?.toLowerCase()
          .includes(search) ||
        item.batchNumber
          ?.toLowerCase()
          .includes(search) ||
        item.supplier
          ?.toLowerCase()
          .includes(search) ||
        item.location
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === 'All Categories' ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'All Status' ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'medicine-desc':
          return b.medicineName.localeCompare(
            a.medicineName
          );

        case 'quantity-low':
          return a.quantity - b.quantity;

        case 'quantity-high':
          return b.quantity - a.quantity;

        case 'expiry-soon':
          return (
            new Date(a.expiryDate) -
            new Date(b.expiryDate)
          );

        case 'expiry-latest':
          return (
            new Date(b.expiryDate) -
            new Date(a.expiryDate)
          );

        case 'value-high':
          return b.stockValue - a.stockValue;

        case 'medicine-asc':
        default:
          return a.medicineName.localeCompare(
            b.medicineName
          );
      }
    });

    return result;
  }, [
    processedInventory,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortBy,
  ]);

  /*
   * Pagination.
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredInventory.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedInventory = filteredInventory.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  /*
   * Summary statistics.
   */
  const summary = useMemo(() => {
    const totalQuantity = processedInventory.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

    const inventoryValue =
      processedInventory.reduce(
        (sum, item) =>
          sum + Number(item.stockValue || 0),
        0
      );

    const lowStock = processedInventory.filter(
      (item) => item.status === 'Low Stock'
    ).length;

    const outOfStock =
      processedInventory.filter(
        (item) => item.status === 'Out of Stock'
      ).length;

    const expiringSoon =
      processedInventory.filter((item) => {
        const days = getDaysUntilExpiry(
          item.expiryDate
        );

        return (
          days !== null &&
          days >= 0 &&
          days <= 90
        );
      }).length;

    const expired =
      processedInventory.filter((item) => {
        const days = getDaysUntilExpiry(
          item.expiryDate
        );

        return days !== null && days < 0;
      }).length;

    return {
      totalItems: processedInventory.length,
      totalQuantity,
      inventoryValue,
      lowStock,
      outOfStock,
      expiringSoon,
      expired,
    };
  }, [processedInventory]);

  /*
   * Open batch management.
   */
  const openBatchManager = (medicineId) => {
    setSelectedMedicineId(medicineId);
    setShowBatchModal(true);
    setExpandedBatch(null);
  };

  const closeBatchManager = () => {
    setShowBatchModal(false);
    setSelectedMedicineId(null);
    setExpandedBatch(null);
  };

  const selectedMedicine = medicineGroups.find(
    (medicine) =>
      medicine.medicineId === selectedMedicineId
  );

  /*
   * Adjustment from previous step.
   */
  const [showAdjustmentModal, setShowAdjustmentModal] =
    useState(false);

  const [adjustmentItem, setAdjustmentItem] =
    useState(null);

  const [adjustmentType, setAdjustmentType] =
    useState('add');

  const [adjustmentQuantity, setAdjustmentQuantity] =
    useState('');

  const [adjustmentReason, setAdjustmentReason] =
    useState('');

  const [adjustmentNotes, setAdjustmentNotes] =
    useState('');

  const [adjustmentError, setAdjustmentError] =
    useState('');

  const openAdjustmentModal = (
    item,
    type = 'add'
  ) => {
    setAdjustmentItem(item);
    setAdjustmentType(type);
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setAdjustmentNotes('');
    setAdjustmentError('');
    setShowAdjustmentModal(true);
  };

  const closeAdjustmentModal = () => {
    setShowAdjustmentModal(false);
    setAdjustmentItem(null);
    setAdjustmentError('');
  };

  const handleAdjustmentSubmit = (event) => {
    event.preventDefault();

    const quantity = Number(adjustmentQuantity);

    if (!quantity || quantity <= 0) {
      setAdjustmentError(
        'Please enter a valid quantity greater than 0.'
      );
      return;
    }

    if (!adjustmentReason.trim()) {
      setAdjustmentError(
        'Please enter a reason for this stock adjustment.'
      );
      return;
    }

    if (
      adjustmentType === 'remove' &&
      quantity > Number(adjustmentItem.quantity)
    ) {
      setAdjustmentError(
        'You cannot remove more stock than currently available.'
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== adjustmentItem.id) {
          return item;
        }

        let newQuantity = Number(item.quantity);

        if (adjustmentType === 'add') {
          newQuantity += quantity;
        }

        if (adjustmentType === 'remove') {
          newQuantity -= quantity;
        }

        if (adjustmentType === 'set') {
          newQuantity = quantity;
        }

        return {
          ...item,
          quantity: newQuantity,
          status: getInventoryStatus(
            newQuantity,
            item.minimumStock
          ),
        };
      })
    );

    closeAdjustmentModal();
  };

  const getAdjustmentNewStock = () => {
    if (!adjustmentItem) return 0;

    const quantity = Number(
      adjustmentQuantity || 0
    );

    if (adjustmentType === 'add') {
      return (
        Number(adjustmentItem.quantity) +
        quantity
      );
    }

    if (adjustmentType === 'remove') {
      return Math.max(
        0,
        Number(adjustmentItem.quantity) -
          quantity
      );
    }

    return quantity;
  };

  return (
    <div className="inventory-page">
      <PageHeader
        title="Inventory Management"
        description="Monitor stock levels, batches, expiry dates, and inventory value."
      />

      {/* =====================================================
          SUMMARY
      ===================================================== */}
      <div className="inventory-summary-grid">
        <div className="inventory-summary-card">
          <div className="inventory-summary-icon blue">
            <Boxes size={22} />
          </div>

          <div>
            <span>Total Inventory Items</span>
            <strong>
              {summary.totalItems}
            </strong>
            <small>
              {summary.totalQuantity} total units
            </small>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon green">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>In Stock</span>
            <strong>
              {
                processedInventory.filter(
                  (item) =>
                    item.status === 'In Stock'
                ).length
              }
            </strong>
            <small>
              Healthy stock levels
            </small>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon orange">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>
              {summary.lowStock}
            </strong>
            <small>
              Requires restocking
            </small>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon red">
            <PackageSearch size={22} />
          </div>

          <div>
            <span>Expiry Alerts</span>
            <strong>
              {summary.expiringSoon}
            </strong>
            <small>
              Within 90 days
            </small>
          </div>
        </div>

        <div className="inventory-summary-card">
          <div className="inventory-summary-icon purple">
            <Pill size={22} />
          </div>

          <div>
            <span>Inventory Value</span>
            <strong>
              {formatCurrency(
                summary.inventoryValue
              )}
            </strong>
            <small>
              Based on purchase price
            </small>
          </div>
        </div>
      </div>

      {/* =====================================================
          EXPIRY ALERT
      ===================================================== */}
      {summary.expiringSoon > 0 && (
        <div className="inventory-expiry-banner">
          <div className="inventory-expiry-banner-icon">
            <Clock size={22} />
          </div>

          <div>
            <strong>
              Expiry Attention Required
            </strong>

            <p>
              {summary.expiringSoon} inventory batch
              {summary.expiringSoon !== 1
                ? 'es are'
                : ' is'}{' '}
              approaching expiry within 90 days.
              Review batches and prioritize FEFO.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}
      <div className="inventory-toolbar">
        <div className="inventory-search-wrapper">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search medicine, batch, supplier..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />

          {searchTerm && (
            <button
              type="button"
              className="inventory-search-clear"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => {
            setCategoryFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="inventory-filter-select"
        >
          <option>
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className="inventory-filter-select"
        >
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value)
          }
          className="inventory-filter-select"
        >
          <option value="medicine-asc">
            Medicine: A-Z
          </option>

          <option value="medicine-desc">
            Medicine: Z-A
          </option>

          <option value="quantity-low">
            Quantity: Low to High
          </option>

          <option value="quantity-high">
            Quantity: High to Low
          </option>

          <option value="expiry-soon">
            Expiry: Soonest
          </option>

          <option value="expiry-latest">
            Expiry: Latest
          </option>

          <option value="value-high">
            Stock Value: Highest
          </option>
        </select>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}
      <div className="inventory-card">
        <div className="inventory-card-header">
          <div>
            <h2>Inventory Stock</h2>

            <p>
              {filteredInventory.length} batch
              {filteredInventory.length !== 1
                ? 'es'
                : ''}{' '}
              found
            </p>
          </div>

          <div className="inventory-fefo-info">
            <CalendarDays size={17} />

            <span>
              FEFO enabled
            </span>
          </div>
        </div>

        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedInventory.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="inventory-empty"
                  >
                    <PackageSearch size={40} />

                    <strong>
                      No inventory found
                    </strong>

                    <span>
                      Try changing your search or filters.
                    </span>
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item) => {
                  const medicine = medicineGroups.find(
                    (group) =>
                      group.medicineId ===
                      item.medicineId
                  );

                  const sellFirstBatch =
                    medicine
                      ? getSellFirstBatch(
                          medicine.batches
                        )
                      : null;

                  const isSellFirst =
                    sellFirstBatch?.id === item.id;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="inventory-medicine-cell">
                          <div className="inventory-medicine-icon">
                            <Pill size={17} />
                          </div>

                          <div>
                            <strong>
                              {item.medicineName}
                            </strong>

                            <span>
                              {item.genericName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="inventory-batch-cell">
                          <strong>
                            {item.batchNumber}
                          </strong>

                          {isSellFirst && (
                            <span className="sell-first-badge">
                              Sell First
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="inventory-category">
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-stock-cell">
                          <strong>
                            {item.quantity}
                          </strong>

                          <span>
                            {item.unit}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="inventory-expiry-cell">
                          <strong>
                            {formatDate(
                              item.expiryDate
                            )}
                          </strong>

                          <span
                            className={`expiry-status ${item.expiryStatus.className}`}
                          >
                            {item.expiryStatus.label}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span>
                          {item.location}
                        </span>
                      </td>

                      <td>
                        <StatusBadge
                          status={item.status}
                        />
                      </td>

                      <td>
                        <div className="inventory-action-buttons">
                          <button
                            type="button"
                            className="inventory-action-button view"
                            title="View details"
                            onClick={() =>
                              setSelectedItem(item)
                            }
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            className="inventory-action-button add"
                            title="Add stock"
                            onClick={() =>
                              openAdjustmentModal(
                                item,
                                'add'
                              )
                            }
                          >
                            <ArrowUp size={17} />
                          </button>

                          <button
                            type="button"
                            className="inventory-action-button remove"
                            title="Remove stock"
                            onClick={() =>
                              openAdjustmentModal(
                                item,
                                'remove'
                              )
                            }
                          >
                            <ArrowDown size={17} />
                          </button>

                          <button
                            type="button"
                            className="inventory-action-button batch"
                            title="Manage batches"
                            onClick={() =>
                              openBatchManager(
                                item.medicineId
                              )
                            }
                          >
                            <Boxes size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}
        <div className="inventory-pagination">
          <div className="inventory-pagination-info">
            Showing{' '}
            <strong>
              {filteredInventory.length === 0
                ? 0
                : (safeCurrentPage - 1) *
                    itemsPerPage +
                  1}
            </strong>{' '}
            to{' '}
            <strong>
              {Math.min(
                safeCurrentPage * itemsPerPage,
                filteredInventory.length
              )}
            </strong>{' '}
            of{' '}
            <strong>
              {filteredInventory.length}
            </strong>{' '}
            batches
          </div>

          <div className="inventory-pagination-controls">
            <select
              value={itemsPerPage}
              onChange={(event) => {
                setItemsPerPage(
                  Number(event.target.value)
                );
                setCurrentPage(1);
              }}
              className="inventory-page-size"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
            >
              Previous
            </button>

            <span>
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={
                safeCurrentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}
      {selectedItem && (
        <div
          className="inventory-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setSelectedItem(null);
            }
          }}
        >
          <div className="inventory-details-modal">
            <div className="inventory-modal-header">
              <div>
                <span className="inventory-modal-kicker">
                  Inventory Details
                </span>

                <h2>
                  {selectedItem.medicineName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedItem(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="inventory-details-content">
              <div className="inventory-detail-hero">
                <div className="inventory-detail-icon">
                  <Pill size={28} />
                </div>

                <div>
                  <h3>
                    {selectedItem.medicineName}
                  </h3>

                  <p>
                    {selectedItem.genericName}
                  </p>
                </div>

                <StatusBadge
                  status={selectedItem.status}
                />
              </div>

              <div className="inventory-detail-grid">
                <div>
                  <span>Batch Number</span>
                  <strong>
                    {selectedItem.batchNumber}
                  </strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>
                    {selectedItem.category}
                  </strong>
                </div>

                <div>
                  <span>Current Stock</span>
                  <strong>
                    {selectedItem.quantity}{' '}
                    {selectedItem.unit}
                  </strong>
                </div>

                <div>
                  <span>Minimum Stock</span>
                  <strong>
                    {selectedItem.minimumStock}{' '}
                    {selectedItem.unit}
                  </strong>
                </div>

                <div>
                  <span>Purchase Price</span>
                  <strong>
                    {formatCurrency(
                      selectedItem.purchasePrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>Selling Price</span>
                  <strong>
                    {formatCurrency(
                      selectedItem.sellingPrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>Expiry Date</span>
                  <strong>
                    {formatDate(
                      selectedItem.expiryDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Supplier</span>
                  <strong>
                    {selectedItem.supplier}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedItem.location}
                  </strong>
                </div>

                <div>
                  <span>Stock Value</span>
                  <strong>
                    {formatCurrency(
                      selectedItem.stockValue
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="inventory-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedItem(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const item =
                    selectedItem;

                  setSelectedItem(null);

                  openAdjustmentModal(
                    item,
                    'add'
                  );
                }}
              >
                <ArrowUp size={17} />
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BATCH MANAGEMENT MODAL
      ===================================================== */}
      {showBatchModal &&
        selectedMedicine && (
          <div
            className="inventory-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeBatchManager();
              }
            }}
          >
            <div className="inventory-batch-modal">
              <div className="inventory-modal-header">
                <div>
                  <span className="inventory-modal-kicker">
                    Batch Management
                  </span>

                  <h2>
                    {selectedMedicine.medicineName}
                  </h2>

                  <p>
                    {selectedMedicine.genericName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBatchManager}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="batch-management-summary">
                <div>
                  <span>Total Batches</span>
                  <strong>
                    {selectedMedicine.batches.length}
                  </strong>
                </div>

                <div>
                  <span>Total Quantity</span>
                  <strong>
                    {selectedMedicine.batches.reduce(
                      (sum, batch) =>
                        sum +
                        Number(
                          batch.quantity || 0
                        ),
                      0
                    )}{' '}
                    {selectedMedicine.batches[0]?.unit ||
                      ''}
                  </strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>
                    {selectedMedicine.category}
                  </strong>
                </div>
              </div>

              <div className="fefo-explanation">
                <div className="fefo-explanation-icon">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <strong>
                    FEFO — First Expiry, First Out
                  </strong>

                  <p>
                    The batch with the earliest
                    non-expired date is recommended
                    for sale first.
                  </p>
                </div>
              </div>

              <div className="batch-list">
                {selectedMedicine.batches.map(
                  (batch, index) => {
                    const expiryStatus =
                      getExpiryStatus(
                        batch.expiryDate
                      );

                    const daysLeft =
                      getDaysUntilExpiry(
                        batch.expiryDate
                      );

                    const sellFirstBatch =
                      getSellFirstBatch(
                        selectedMedicine.batches
                      );

                    const isSellFirst =
                      sellFirstBatch?.id ===
                      batch.id;

                    const isExpanded =
                      expandedBatch ===
                      batch.id;

                    return (
                      <div
                        key={batch.id}
                        className={`batch-item ${
                          isSellFirst
                            ? 'sell-first'
                            : ''
                        } ${
                          expiryStatus.className
                        }`}
                      >
                        <div className="batch-main-row">
                          <div className="batch-number-section">
                            <div className="batch-number-icon">
                              <Boxes size={18} />
                            </div>

                            <div>
                              <strong>
                                {batch.batchNumber}
                              </strong>

                              {isSellFirst && (
                                <span className="fefo-badge">
                                  <CheckCircle2
                                    size={13}
                                  />
                                  SELL FIRST
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="batch-quantity-section">
                            <span>
                              Quantity
                            </span>

                            <strong>
                              {batch.quantity}{' '}
                              {batch.unit}
                            </strong>
                          </div>

                          <div className="batch-expiry-section">
                            <span>
                              Expiry
                            </span>

                            <strong>
                              {formatDate(
                                batch.expiryDate
                              )}
                            </strong>

                            <span
                              className={`batch-expiry-label ${expiryStatus.className}`}
                            >
                              {expiryStatus.label}
                            </span>

                            {daysLeft !== null && (
                              <small>
                                {daysLeft < 0
                                  ? `${Math.abs(
                                      daysLeft
                                    )} days expired`
                                  : daysLeft === 0
                                  ? 'Expires today'
                                  : `${daysLeft} days left`}
                              </small>
                            )}
                          </div>

                          <button
                            type="button"
                            className="batch-expand-button"
                            onClick={() =>
                              setExpandedBatch(
                                isExpanded
                                  ? null
                                  : batch.id
                              )
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp
                                size={18}
                              />
                            ) : (
                              <ChevronDown
                                size={18}
                              />
                            )}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="batch-expanded-details">
                            <div>
                              <span>
                                Supplier
                              </span>

                              <strong>
                                {batch.supplier}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Storage Location
                              </span>

                              <strong>
                                {batch.location}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Purchase Price
                              </span>

                              <strong>
                                {formatCurrency(
                                  batch.purchasePrice
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Selling Price
                              </span>

                              <strong>
                                {formatCurrency(
                                  batch.sellingPrice
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Stock Value
                              </span>

                              <strong>
                                {formatCurrency(
                                  batch.stockValue
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Stock Status
                              </span>

                              <StatusBadge
                                status={
                                  batch.status
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              <div className="inventory-modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeBatchManager}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          STOCK ADJUSTMENT MODAL
      ===================================================== */}
      {showAdjustmentModal &&
        adjustmentItem && (
          <div
            className="inventory-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeAdjustmentModal();
              }
            }}
          >
            <div className="inventory-adjustment-modal">
              <div className="inventory-modal-header">
                <div>
                  <span className="inventory-modal-kicker">
                    Stock Adjustment
                  </span>

                  <h2>
                    {adjustmentType === 'add'
                      ? 'Add Stock'
                      : adjustmentType === 'remove'
                      ? 'Remove Stock'
                      : 'Set Stock'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    closeAdjustmentModal
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={
                  handleAdjustmentSubmit
                }
                className="inventory-adjustment-form"
              >
                <div className="adjustment-medicine-box">
                  <div className="inventory-detail-icon">
                    <Pill size={22} />
                  </div>

                  <div>
                    <strong>
                      {
                        adjustmentItem.medicineName
                      }
                    </strong>

                    <span>
                      Batch:{' '}
                      {
                        adjustmentItem.batchNumber
                      }
                    </span>
                  </div>
                </div>

                <div className="adjustment-type-grid">
                  <button
                    type="button"
                    className={
                      adjustmentType === 'add'
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setAdjustmentType(
                        'add'
                      )
                    }
                  >
                    <ArrowUp size={18} />
                    <span>Add Stock</span>
                  </button>

                  <button
                    type="button"
                    className={
                      adjustmentType === 'remove'
                        ? 'active remove'
                        : ''
                    }
                    onClick={() =>
                      setAdjustmentType(
                        'remove'
                      )
                    }
                  >
                    <ArrowDown size={18} />
                    <span>Remove Stock</span>
                  </button>

                  <button
                    type="button"
                    className={
                      adjustmentType === 'set'
                        ? 'active set'
                        : ''
                    }
                    onClick={() =>
                      setAdjustmentType(
                        'set'
                      )
                    }
                  >
                    <Boxes size={18} />
                    <span>Set Stock</span>
                  </button>
                </div>

                <div className="inventory-form-group">
                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      adjustmentQuantity
                    }
                    onChange={(event) => {
                      setAdjustmentQuantity(
                        event.target.value
                      );
                      setAdjustmentError(
                        ''
                      );
                    }}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="inventory-form-group">
                  <label>
                    Reason
                  </label>

                  <select
                    value={
                      adjustmentReason
                    }
                    onChange={(event) =>
                      setAdjustmentReason(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select reason
                    </option>

                    <option value="New Purchase">
                      New Purchase
                    </option>

                    <option value="Stock Correction">
                      Stock Correction
                    </option>

                    <option value="Damaged">
                      Damaged
                    </option>

                    <option value="Expired">
                      Expired
                    </option>

                    <option value="Return">
                      Customer Return
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="inventory-form-group">
                  <label>
                    Notes
                  </label>

                  <textarea
                    rows="3"
                    value={
                      adjustmentNotes
                    }
                    onChange={(event) =>
                      setAdjustmentNotes(
                        event.target.value
                      )
                    }
                    placeholder="Optional notes..."
                  />
                </div>

                {adjustmentError && (
                  <div className="adjustment-error">
                    <AlertTriangle
                      size={17}
                    />

                    <span>
                      {adjustmentError}
                    </span>
                  </div>
                )}

                <div className="stock-preview">
                  <div>
                    <span>
                      Current Stock
                    </span>

                    <strong>
                      {
                        adjustmentItem.quantity
                      }{' '}
                      {
                        adjustmentItem.unit
                      }
                    </strong>
                  </div>

                  <span className="preview-arrow">
                    →
                  </span>

                  <div>
                    <span>
                      New Stock
                    </span>

                    <strong>
                      {
                        getAdjustmentNewStock()
                      }{' '}
                      {
                        adjustmentItem.unit
                      }
                    </strong>
                  </div>
                </div>

                <div className="inventory-adjustment-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      closeAdjustmentModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Confirm Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

export default Inventory;