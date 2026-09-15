import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

import { inventoryItems } from '../data/inventoryData';
import { getDaysUntilExpiry } from '../utils/pharmacyStorage';

import '../styles/expiry.css';

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return {
      key: 'unknown',
      label: 'Unknown',
      className: 'unknown',
    };
  }

  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) {
    return {
      key: 'expired',
      label: 'Expired',
      className: 'expired',
    };
  }

  if (days <= 30) {
    return {
      key: 'critical',
      label: 'Critical',
      className: 'critical',
    };
  }

  if (days <= 90) {
    return {
      key: 'soon',
      label: 'Expiring Soon',
      className: 'soon',
    };
  }

  return {
    key: 'good',
    label: 'Good',
    className: 'good',
  };
};

const formatDate = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toFixed(2)}`;
};

const getDaysLabel = (days) => {
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  }

  if (days === 0) {
    return 'Expires today';
  }

  if (days === 1) {
    return '1 day left';
  }

  return `${days} days left`;
};

const getMedicineName = (item) => {
  return item.name || item.medicineName || 'Unknown Medicine';
};

const getBatchNumber = (item) => {
  return item.batchNumber || item.batch || '—';
};

const getQuantity = (item) => {
  return Number(item.stock ?? item.quantity ?? 0);
};

function Expiry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('expiry-asc');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const expiryItems = useMemo(() => {
    return inventoryItems.map((item, index) => {
      const expiryDate = item.expiryDate || item.expiry;

      return {
        ...item,
        internalId: item.id ?? index + 1,
        expiryDate,
        daysLeft: getDaysUntilExpiry(expiryDate),
        expiryStatus: getExpiryStatus(expiryDate),
      };
    });
  }, [refreshKey]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    const filtered = expiryItems.filter((item) => {
      const medicineName = getMedicineName(item).toLowerCase();
      const genericName = String(item.genericName || '').toLowerCase();
      const batch = getBatchNumber(item).toLowerCase();
      const supplier = String(item.supplier || '').toLowerCase();

      const matchesSearch =
        !search ||
        medicineName.includes(search) ||
        genericName.includes(search) ||
        batch.includes(search) ||
        supplier.includes(search);

      const matchesStatus =
        statusFilter === 'All' ||
        item.expiryStatus.key === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'expiry-desc':
          return b.daysLeft - a.daysLeft;

        case 'quantity-asc':
          return getQuantity(a) - getQuantity(b);

        case 'quantity-desc':
          return getQuantity(b) - getQuantity(a);

        case 'name-asc':
          return getMedicineName(a).localeCompare(getMedicineName(b));

        case 'name-desc':
          return getMedicineName(b).localeCompare(getMedicineName(a));

        case 'expiry-asc':
        default:
          return a.daysLeft - b.daysLeft;
      }
    });
  }, [expiryItems, searchTerm, statusFilter, sortBy]);

  const summary = useMemo(() => {
    return {
      total: expiryItems.length,
      expired: expiryItems.filter(
        (item) => item.expiryStatus.key === 'expired'
      ).length,
      critical: expiryItems.filter(
        (item) => item.expiryStatus.key === 'critical'
      ).length,
      soon: expiryItems.filter(
        (item) => item.expiryStatus.key === 'soon'
      ).length,
      good: expiryItems.filter(
        (item) => item.expiryStatus.key === 'good'
      ).length,
    };
  }, [expiryItems]);

  return (
    <div className="expiry-page">
      <div className="expiry-page-header">
        <div>
          <div className="expiry-title-row">
            <div className="expiry-title-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <h1>Expiry Tracking</h1>
              <p>
                Monitor medicine expiration dates and prevent expired stock
                from being sold.
              </p>
            </div>
          </div>
        </div>

        <button
          className="expiry-refresh-button"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="expiry-stat-grid">
        <div className="expiry-stat-card">
          <div className="expiry-stat-icon total">
            <Package size={20} />
          </div>

          <div>
            <span>Total Batches</span>
            <strong>{summary.total}</strong>
            <small>Tracked inventory batches</small>
          </div>
        </div>

        <div className="expiry-stat-card danger">
          <div className="expiry-stat-icon expired">
            <XCircle size={20} />
          </div>

          <div>
            <span>Expired</span>
            <strong>{summary.expired}</strong>
            <small>Require immediate action</small>
          </div>
        </div>

        <div className="expiry-stat-card critical">
          <div className="expiry-stat-icon critical">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Critical</span>
            <strong>{summary.critical}</strong>
            <small>30 days or less</small>
          </div>
        </div>

        <div className="expiry-stat-card warning">
          <div className="expiry-stat-icon soon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>Expiring Soon</span>
            <strong>{summary.soon}</strong>
            <small>31–90 days remaining</small>
          </div>
        </div>

        <div className="expiry-stat-card success">
          <div className="expiry-stat-icon good">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Good</span>
            <strong>{summary.good}</strong>
            <small>More than 90 days</small>
          </div>
        </div>
      </div>

      {(summary.expired > 0 || summary.critical > 0) && (
        <div className="expiry-alert-banner">
          <div className="expiry-alert-banner-icon">
            <AlertCircle size={21} />
          </div>

          <div>
            <strong>Immediate attention required</strong>
            <p>
              {summary.expired > 0 &&
                `${summary.expired} batch${summary.expired > 1 ? 'es' : ''} expired. `}
              {summary.critical > 0 &&
                `${summary.critical} batch${summary.critical > 1 ? 'es' : ''} expire within 30 days.`}
            </p>
          </div>
        </div>
      )}

      <div className="expiry-card">
        <div className="expiry-toolbar">
          <div className="expiry-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search medicine, batch, supplier..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>
                <XCircle size={16} />
              </button>
            )}
          </div>

          <div className="expiry-toolbar-controls">
            <div className="expiry-select-wrapper">
              <Filter size={16} />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="expired">Expired</option>
                <option value="critical">Critical</option>
                <option value="soon">Expiring Soon</option>
                <option value="good">Good</option>
              </select>
            </div>

            <div className="expiry-select-wrapper">
              {sortBy.includes('desc') ? (
                <ArrowDown size={16} />
              ) : (
                <ArrowUp size={16} />
              )}

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="expiry-asc">Earliest Expiry</option>
                <option value="expiry-desc">Latest Expiry</option>
                <option value="quantity-asc">Lowest Quantity</option>
                <option value="quantity-desc">Highest Quantity</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </div>
          </div>
        </div>

        <div className="expiry-result-bar">
          <span>
            Showing <strong>{filteredItems.length}</strong> of{' '}
            <strong>{expiryItems.length}</strong> batches
          </span>

          <span className="expiry-fefo-note">
            FEFO: First Expire, First Out
          </span>
        </div>

        <div className="expiry-table-container">
          <table className="expiry-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="expiry-empty-state">
                      <CalendarDays size={42} />
                      <h3>No expiry records found</h3>
                      <p>Try changing your search or filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={`${item.internalId}-${getBatchNumber(item)}`}
                    className={`expiry-row ${item.expiryStatus.className}`}
                  >
                    <td>
                      <div className="expiry-medicine-cell">
                        <div className="expiry-medicine-icon">
                          <Package size={17} />
                        </div>

                        <div>
                          <strong>{getMedicineName(item)}</strong>

                          {item.genericName && (
                            <small>{item.genericName}</small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="expiry-batch-number">
                        {getBatchNumber(item)}
                      </span>
                    </td>

                    <td>
                      <strong>{getQuantity(item)}</strong>{' '}
                      <span className="expiry-unit">
                        {item.unit || 'units'}
                      </span>
                    </td>

                    <td>
                      <strong>{formatDate(item.expiryDate)}</strong>
                    </td>

                    <td>
                      <span
                        className={`expiry-days ${item.expiryStatus.className}`}
                      >
                        {getDaysLabel(item.daysLeft)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`expiry-status-badge ${item.expiryStatus.className}`}
                      >
                        {item.expiryStatus.key === 'expired' && (
                          <XCircle size={13} />
                        )}

                        {item.expiryStatus.key === 'critical' && (
                          <AlertCircle size={13} />
                        )}

                        {item.expiryStatus.key === 'soon' && (
                          <Clock3 size={13} />
                        )}

                        {item.expiryStatus.key === 'good' && (
                          <CheckCircle2 size={13} />
                        )}

                        {item.expiryStatus.label}
                      </span>
                    </td>

                    <td>
                      <button
                        className="expiry-view-button"
                        onClick={() => setSelectedItem(item)}
                        title="View details"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div
          className="expiry-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedItem(null);
            }
          }}
        >
          <div className="expiry-details-modal">
            <div className="expiry-modal-header">
              <div>
                <div className="expiry-modal-title">
                  <div className="expiry-modal-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <h2>Expiry Details</h2>
                    <p>{getMedicineName(selectedItem)}</p>
                  </div>
                </div>
              </div>

              <button
                className="expiry-modal-close"
                onClick={() => setSelectedItem(null)}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="expiry-details-content">
              <div
                className={`expiry-detail-status ${selectedItem.expiryStatus.className}`}
              >
                {selectedItem.expiryStatus.key === 'expired' ? (
                  <XCircle size={25} />
                ) : selectedItem.expiryStatus.key === 'good' ? (
                  <CheckCircle2 size={25} />
                ) : (
                  <AlertCircle size={25} />
                )}

                <div>
                  <strong>{selectedItem.expiryStatus.label}</strong>
                  <span>{getDaysLabel(selectedItem.daysLeft)}</span>
                </div>
              </div>

              <div className="expiry-detail-grid">
                <div>
                  <span>Medicine Name</span>
                  <strong>{getMedicineName(selectedItem)}</strong>
                </div>

                <div>
                  <span>Generic Name</span>
                  <strong>{selectedItem.genericName || '—'}</strong>
                </div>

                <div>
                  <span>Batch Number</span>
                  <strong>{getBatchNumber(selectedItem)}</strong>
                </div>

                <div>
                  <span>Category</span>
                  <strong>{selectedItem.category || '—'}</strong>
                </div>

                <div>
                  <span>Current Quantity</span>
                  <strong>
                    {getQuantity(selectedItem)} {selectedItem.unit || 'units'}
                  </strong>
                </div>

                <div>
                  <span>Expiry Date</span>
                  <strong>{formatDate(selectedItem.expiryDate)}</strong>
                </div>

                <div>
                  <span>Days Remaining</span>
                  <strong>
                    {getDaysLabel(selectedItem.daysLeft)}
                  </strong>
                </div>

                <div>
                  <span>Supplier</span>
                  <strong>{selectedItem.supplier || '—'}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{selectedItem.location || '—'}</strong>
                </div>

                <div>
                  <span>Unit Cost</span>
                  <strong>
                    {formatCurrency(
                      selectedItem.unitCost ??
                        selectedItem.purchasePrice ??
                        selectedItem.cost
                    )}
                  </strong>
                </div>
              </div>

              <div className="expiry-detail-guidance">
                <AlertCircle size={18} />

                <div>
                  <strong>Pharmacy Action</strong>

                  <p>
                    {selectedItem.expiryStatus.key === 'expired'
                      ? 'Do not sell this batch. Remove it from normal sellable stock and follow your pharmacy disposal procedure.'
                      : selectedItem.expiryStatus.key === 'critical'
                      ? 'Prioritize this batch for sale according to FEFO and review the quantity regularly.'
                      : selectedItem.expiryStatus.key === 'soon'
                      ? 'Monitor this batch and prioritize it before newer batches.'
                      : 'This batch is currently outside the expiry warning period.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="expiry-modal-footer">
              <button
                className="expiry-secondary-button"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expiry;