import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  ClipboardList,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { stockMovements } from '../../data/stockMovementsData';

const formatDate = (date) => {
  if (!date) return '-';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getMovementIcon = (type) => {
  if (type === 'Stock In') {
    return <ArrowDownToLine size={17} />;
  }

  if (type === 'Stock Out') {
    return <ArrowUpFromLine size={17} />;
  }

  return <SlidersHorizontal size={17} />;
};

const getMovementClass = (type) => {
  if (type === 'Stock In') return 'movement-in';
  if (type === 'Stock Out') return 'movement-out';

  return 'movement-adjustment';
};

function StockMovementHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [selectedMovement, setSelectedMovement] = useState(null);

  const filteredMovements = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return stockMovements.filter((movement) => {
      const matchesSearch =
        !search ||
        movement.medicineName.toLowerCase().includes(search) ||
        movement.genericName.toLowerCase().includes(search) ||
        movement.batchNumber.toLowerCase().includes(search) ||
        movement.reference.toLowerCase().includes(search) ||
        movement.reason.toLowerCase().includes(search) ||
        movement.user.toLowerCase().includes(search);

      const matchesType =
        typeFilter === 'All Types' ||
        movement.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter]);

  const statistics = useMemo(() => {
    const stockIn = stockMovements
      .filter((item) => item.type === 'Stock In')
      .reduce((sum, item) => sum + Math.abs(item.quantity), 0);

    const stockOut = stockMovements
      .filter((item) => item.type === 'Stock Out')
      .reduce((sum, item) => sum + Math.abs(item.quantity), 0);

    const adjustments = stockMovements.filter(
      (item) => item.type === 'Adjustment'
    ).length;

    return {
      total: stockMovements.length,
      stockIn,
      stockOut,
      adjustments,
    };
  }, []);

  return (
    <>
      <div className="stock-movement-panel">
        <div className="stock-movement-header">
          <div>
            <div className="stock-movement-title">
              <ClipboardList size={19} />
              <h2>Stock Movement History</h2>
            </div>

            <p>
              Track all inventory stock changes and adjustments.
            </p>
          </div>

          <div className="stock-movement-stats">
            <div className="movement-stat">
              <span>Total Movements</span>
              <strong>{statistics.total}</strong>
            </div>

            <div className="movement-stat movement-stat-in">
              <span>Stock In</span>
              <strong>+{statistics.stockIn}</strong>
            </div>

            <div className="movement-stat movement-stat-out">
              <span>Stock Out</span>
              <strong>-{statistics.stockOut}</strong>
            </div>

            <div className="movement-stat movement-stat-adjustment">
              <span>Adjustments</span>
              <strong>{statistics.adjustments}</strong>
            </div>
          </div>
        </div>

        <div className="stock-movement-toolbar">
          <div className="stock-movement-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search medicine, batch, reference..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="stock-movement-filter">
            <Filter size={16} />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option>All Types</option>
              <option>Stock In</option>
              <option>Stock Out</option>
              <option>Adjustment</option>
            </select>
          </div>
        </div>

        <div className="stock-movement-table-wrapper">
          <table className="stock-movement-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Reference</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredMovements.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    <div className="movement-medicine">
                      <strong>{movement.medicineName}</strong>
                      <span>{movement.genericName}</span>
                    </div>
                  </td>

                  <td>
                    <span className="movement-batch">
                      {movement.batchNumber}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`movement-type ${getMovementClass(
                        movement.type
                      )}`}
                    >
                      {getMovementIcon(movement.type)}
                      {movement.type}
                    </span>
                  </td>

                  <td>
                    <strong
                      className={`movement-quantity ${getMovementClass(
                        movement.type
                      )}`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </strong>
                  </td>

                  <td>
                    <span className="movement-reason">
                      {movement.reason}
                    </span>
                  </td>

                  <td>
                    <span className="movement-reference">
                      {movement.reference}
                    </span>
                  </td>

                  <td>
                    <div className="movement-date">
                      <strong>{formatDate(movement.date)}</strong>
                      <span>{movement.time}</span>
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="movement-view-button"
                      onClick={() => setSelectedMovement(movement)}
                      title="View movement details"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="movement-empty-state">
                      <ClipboardList size={32} />

                      <strong>No stock movements found</strong>

                      <span>
                        Try changing your search or filter.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="stock-movement-footer">
          Showing <strong>{filteredMovements.length}</strong> of{' '}
          <strong>{stockMovements.length}</strong> movements
        </div>
      </div>

      {selectedMovement && (
        <div
          className="movement-modal-overlay"
          onClick={() => setSelectedMovement(null)}
        >
          <div
            className="movement-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="movement-modal-header">
              <div>
                <span>STOCK MOVEMENT</span>
                <h2>{selectedMovement.medicineName}</h2>
                <p>{selectedMovement.batchNumber}</p>
              </div>

              <button
                type="button"
                className="movement-modal-close"
                onClick={() => setSelectedMovement(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="movement-modal-content">
              <div
                className={`movement-detail-type ${getMovementClass(
                  selectedMovement.type
                )}`}
              >
                {getMovementIcon(selectedMovement.type)}

                <div>
                  <span>Movement Type</span>
                  <strong>{selectedMovement.type}</strong>
                </div>
              </div>

              <div className="movement-detail-grid">
                <div>
                  <span>Medicine</span>
                  <strong>{selectedMovement.medicineName}</strong>
                </div>

                <div>
                  <span>Generic Name</span>
                  <strong>{selectedMovement.genericName}</strong>
                </div>

                <div>
                  <span>Batch Number</span>
                  <strong>{selectedMovement.batchNumber}</strong>
                </div>

                <div>
                  <span>Quantity Change</span>
                  <strong
                    className={`movement-detail-quantity ${getMovementClass(
                      selectedMovement.type
                    )}`}
                  >
                    {selectedMovement.quantity > 0 ? '+' : ''}
                    {selectedMovement.quantity}
                  </strong>
                </div>

                <div>
                  <span>Previous Stock</span>
                  <strong>{selectedMovement.previousStock}</strong>
                </div>

                <div>
                  <span>New Stock</span>
                  <strong>{selectedMovement.newStock}</strong>
                </div>

                <div>
                  <span>Reason</span>
                  <strong>{selectedMovement.reason}</strong>
                </div>

                <div>
                  <span>Reference</span>
                  <strong>{selectedMovement.reference}</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>{formatDate(selectedMovement.date)}</strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>{selectedMovement.time}</strong>
                </div>

                <div>
                  <span>Performed By</span>
                  <strong>{selectedMovement.user}</strong>
                </div>
              </div>

              <div className="movement-notes">
                <span>Notes</span>
                <p>{selectedMovement.notes || 'No notes available.'}</p>
              </div>
            </div>

            <div className="movement-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedMovement(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StockMovementHistory;