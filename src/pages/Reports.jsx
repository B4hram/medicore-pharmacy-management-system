import { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';

import {
  monthlySales,
  categoryPerformance,
  topSellingMedicines,
  topCustomers,
  paymentPerformance,
  reportPeriods,
} from '../data/reportsData';

import { inventoryItems } from '../data/inventoryData';

import {
  getSavedSales,
  getDaysUntilExpiry,
} from '../utils/pharmacyStorage';

import '../styles/reports.css';

const currency = (value) => {
  return `$${Number(value || 0).toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

function Reports() {
  const [period, setPeriod] = useState('month');
  const [activeReport, setActiveReport] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const sales = useMemo(() => {
    return getSavedSales();
  }, [refreshKey]);

  const inventoryStats = useMemo(() => {
    const items = Array.isArray(inventoryItems)
      ? inventoryItems
      : [];

    let totalQuantity = 0;
    let inventoryValue = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let expired = 0;

    items.forEach((item) => {
      const quantity = Number(
        item.quantity ??
        item.stock ??
        0
      );

      const minimum = Number(
        item.minimumStock ??
        item.minStock ??
        0
      );

      const cost = Number(
        item.unitCost ??
        item.purchasePrice ??
        item.costPrice ??
        0
      );

      totalQuantity += quantity;

      inventoryValue += quantity * cost;

      if (quantity <= 0) {
        outOfStock++;
      } else if (quantity <= minimum) {
        lowStock++;
      }

      const days = getDaysUntilExpiry(
        item.expiryDate
      );

      if (days !== null && days < 0) {
        expired++;
      }
    });

    return {
      totalItems: items.length,
      totalQuantity,
      inventoryValue,
      lowStock,
      outOfStock,
      expired,
    };
  }, []);

  const calculatedSales = useMemo(() => {
    if (!sales.length) {
      return {
        total: 0,
        transactions: 0,
        average: 0,
        items: 0,
      };
    }

    let total = 0;
    let items = 0;

    sales.forEach((sale) => {
      total += Number(
        sale.total ??
        sale.grandTotal ??
        sale.amount ??
        0
      );

      if (Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          items += Number(
            item.quantity ??
            item.qty ??
            0
          );
        });
      }
    });

    return {
      total,
      transactions: sales.length,
      average:
        sales.length > 0
          ? total / sales.length
          : 0,
      items,
    };
  }, [sales]);

  const displaySales = useMemo(() => {
    if (sales.length > 0) {
      return sales;
    }

    const periodData =
      period === 'year'
        ? monthlySales
        : monthlySales.slice(-4);

    return periodData.map((item, index) => ({
      id: `demo-${index}`,
      invoice: `#DEMO-${1000 + index}`,
      total: item.sales,
      createdAt: new Date().toISOString(),
      paymentMethod: 'Cash',
    }));
  }, [sales, period]);

  const maxMonthlySale = Math.max(
    ...monthlySales.map((item) => item.sales)
  );

  const handleRefresh = () => {
    setRefreshKey((value) => value + 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const rows = [
      [
        'Report',
        'Value',
      ],
      [
        'Period',
        period,
      ],
      [
        'Total Sales',
        calculatedSales.total.toFixed(2),
      ],
      [
        'Transactions',
        calculatedSales.transactions,
      ],
      [
        'Average Sale',
        calculatedSales.average.toFixed(2),
      ],
      [
        'Items Sold',
        calculatedSales.items,
      ],
      [
        'Inventory Value',
        inventoryStats.inventoryValue.toFixed(2),
      ],
      [
        'Low Stock Items',
        inventoryStats.lowStock,
      ],
      [
        'Out of Stock Items',
        inventoryStats.outOfStock,
      ],
      [
        'Expired Items',
        inventoryStats.expired,
      ],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download =
      `medicore-report-${period}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const reportCards = [
    {
      title: 'Total Sales',
      value:
        calculatedSales.total > 0
          ? currency(calculatedSales.total)
          : '$395,200.00',
      change: '+12.6%',
      icon: DollarSign,
      type: 'success',
    },
    {
      title: 'Transactions',
      value:
        calculatedSales.transactions > 0
          ? calculatedSales.transactions.toLocaleString()
          : '4,803',
      change: '+8.4%',
      icon: ShoppingCart,
      type: 'blue',
    },
    {
      title: 'Average Sale',
      value:
        calculatedSales.average > 0
          ? currency(calculatedSales.average)
          : '$82.27',
      change: '+4.2%',
      icon: TrendingUp,
      type: 'orange',
    },
    {
      title: 'Items Sold',
      value:
        calculatedSales.items > 0
          ? calculatedSales.items.toLocaleString()
          : '12,486',
      change: '+9.7%',
      icon: Package,
      type: 'purple',
    },
  ];

  return (
    <div className="reports-page">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Analyze pharmacy sales, inventory, medicines and customer performance."
      />

      {/* Controls */}

      <div className="reports-toolbar">
        <div className="report-tabs">
          <button
            className={
              activeReport === 'overview'
                ? 'report-tab active'
                : 'report-tab'
            }
            onClick={() =>
              setActiveReport('overview')
            }
          >
            <BarChart3 size={17} />
            Overview
          </button>

          <button
            className={
              activeReport === 'sales'
                ? 'report-tab active'
                : 'report-tab'
            }
            onClick={() =>
              setActiveReport('sales')
            }
          >
            <DollarSign size={17} />
            Sales
          </button>

          <button
            className={
              activeReport === 'inventory'
                ? 'report-tab active'
                : 'report-tab'
            }
            onClick={() =>
              setActiveReport('inventory')
            }
          >
            <Package size={17} />
            Inventory
          </button>

          <button
            className={
              activeReport === 'customers'
                ? 'report-tab active'
                : 'report-tab'
            }
            onClick={() =>
              setActiveReport('customers')
            }
          >
            <Users size={17} />
            Customers
          </button>
        </div>

        <div className="report-actions">
          <div className="period-select">
            <Calendar size={16} />

            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value)
              }
            >
              {reportPeriods.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="report-icon-button"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>

          <button
            className="report-secondary-button"
            onClick={handleExport}
          >
            <Download size={17} />
            Export
          </button>

          <button
            className="report-primary-button"
            onClick={handlePrint}
          >
            <Printer size={17} />
            Print
          </button>
        </div>
      </div>

      {/* KPI Cards */}

      {(activeReport === 'overview' ||
        activeReport === 'sales') && (
        <div className="report-stats-grid">
          {reportCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                className="report-stat-card"
                key={card.title}
              >
                <div
                  className={`report-stat-icon ${card.type}`}
                >
                  <Icon size={21} />
                </div>

                <div className="report-stat-content">
                  <span>
                    {card.title}
                  </span>

                  <strong>
                    {card.value}
                  </strong>

                  <small>
                    <ArrowUpRight size={13} />
                    {card.change} from previous period
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overview */}

      {activeReport === 'overview' && (
        <>
          <div className="reports-grid-two">
            {/* Sales Chart */}

            <div className="report-panel sales-chart-panel">
              <div className="report-panel-header">
                <div>
                  <h3>Sales Performance</h3>
                  <p>
                    Monthly sales overview
                  </p>
                </div>

                <div className="panel-total">
                  {currency(
                    monthlySales.reduce(
                      (sum, item) =>
                        sum + item.sales,
                      0
                    )
                  )}
                </div>
              </div>

              <div className="sales-chart">
                {monthlySales.map((item) => (
                  <div
                    className="chart-column"
                    key={item.month}
                  >
                    <div className="chart-value">
                      {currency(item.sales)}
                    </div>

                    <div className="chart-bar-area">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.max(
                            8,
                            (item.sales /
                              maxMonthlySale) *
                              100
                          )}%`,
                        }}
                      />
                    </div>

                    <span>
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}

            <div className="report-panel">
              <div className="report-panel-header">
                <div>
                  <h3>Payment Methods</h3>
                  <p>
                    Sales by payment type
                  </p>
                </div>
              </div>

              <div className="payment-list">
                {paymentPerformance.map(
                  (item) => (
                    <div
                      className="payment-row"
                      key={item.method}
                    >
                      <div className="payment-row-top">
                        <span>
                          {item.method}
                        </span>

                        <strong>
                          {currency(
                            item.amount
                          )}
                        </strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>

                      <small>
                        {item.percentage}% of total sales
                      </small>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Category */}

          <div className="report-panel">
            <div className="report-panel-header">
              <div>
                <h3>Sales by Category</h3>
                <p>
                  Category performance
                </p>
              </div>
            </div>

            <div className="category-report-grid">
              {categoryPerformance.map(
                (item) => (
                  <div
                    className="category-report-card"
                    key={item.category}
                  >
                    <div className="category-report-top">
                      <span>
                        {item.category}
                      </span>

                      <strong>
                        {item.percentage}%
                      </strong>
                    </div>

                    <div className="category-progress">
                      <div
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>

                    <div className="category-report-bottom">
                      <span>
                        {currency(item.sales)}
                      </span>

                      <small>
                        {item.quantity} items
                      </small>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Inventory Health */}

          <div className="report-panel">
            <div className="report-panel-header">
              <div>
                <h3>Inventory Health</h3>
                <p>
                  Current inventory overview
                </p>
              </div>
            </div>

            <div className="inventory-health-grid">
              <div className="health-card">
                <Package size={20} />
                <span>Total Medicines</span>
                <strong>
                  {inventoryStats.totalItems}
                </strong>
              </div>

              <div className="health-card">
                <ShoppingCart size={20} />
                <span>Total Quantity</span>
                <strong>
                  {inventoryStats.totalQuantity.toLocaleString()}
                </strong>
              </div>

              <div className="health-card">
                <DollarSign size={20} />
                <span>Inventory Value</span>
                <strong>
                  {currency(
                    inventoryStats.inventoryValue
                  )}
                </strong>
              </div>

              <div className="health-card warning">
                <AlertTriangle size={20} />
                <span>Low Stock</span>
                <strong>
                  {inventoryStats.lowStock}
                </strong>
              </div>

              <div className="health-card danger">
                <AlertTriangle size={20} />
                <span>Expired</span>
                <strong>
                  {inventoryStats.expired}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SALES REPORT */}

      {activeReport === 'sales' && (
        <>
          <div className="reports-grid-two">
            <div className="report-panel">
              <div className="report-panel-header">
                <div>
                  <h3>Top Selling Medicines</h3>
                  <p>
                    Medicines generating the highest sales
                  </p>
                </div>
              </div>

              <div className="analytics-table">
                {topSellingMedicines.map(
                  (medicine, index) => (
                    <div
                      className="analytics-row"
                      key={medicine.id}
                    >
                      <div className="rank-number">
                        {index + 1}
                      </div>

                      <div className="analytics-main">
                        <strong>
                          {medicine.name}
                        </strong>

                        <span>
                          {medicine.category}
                        </span>
                      </div>

                      <div className="analytics-value">
                        <strong>
                          {medicine.quantity}
                        </strong>

                        <span>
                          units
                        </span>
                      </div>

                      <div className="analytics-revenue">
                        {currency(
                          medicine.revenue
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="report-panel">
              <div className="report-panel-header">
                <div>
                  <h3>Monthly Sales</h3>
                  <p>
                    Sales and transaction volume
                  </p>
                </div>
              </div>

              <div className="monthly-sales-list">
                {monthlySales.map(
                  (item) => (
                    <div
                      className="monthly-sales-row"
                      key={item.month}
                    >
                      <div>
                        <strong>
                          {item.month}
                        </strong>

                        <span>
                          {item.transactions} transactions
                        </span>
                      </div>

                      <strong>
                        {currency(item.sales)}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* INVENTORY REPORT */}

      {activeReport === 'inventory' && (
        <>
          <div className="inventory-report-summary">
            <div className="inventory-summary-card">
              <Package size={22} />
              <span>Inventory Value</span>
              <strong>
                {currency(
                  inventoryStats.inventoryValue
                )}
              </strong>
            </div>

            <div className="inventory-summary-card">
              <ShoppingCart size={22} />
              <span>Total Units</span>
              <strong>
                {inventoryStats.totalQuantity.toLocaleString()}
              </strong>
            </div>

            <div className="inventory-summary-card warning">
              <AlertTriangle size={22} />
              <span>Low Stock</span>
              <strong>
                {inventoryStats.lowStock}
              </strong>
            </div>

            <div className="inventory-summary-card danger">
              <AlertTriangle size={22} />
              <span>Expired</span>
              <strong>
                {inventoryStats.expired}
              </strong>
            </div>
          </div>

          <div className="report-panel">
            <div className="report-panel-header">
              <div>
                <h3>Inventory Analysis</h3>
                <p>
                  Stock condition and inventory statistics
                </p>
              </div>
            </div>

            <div className="inventory-analysis-list">
              <div className="inventory-analysis-item">
                <div className="analysis-label">
                  <span>Healthy Stock</span>
                </div>

                <div className="analysis-bar">
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        100 -
                          inventoryStats.lowStock -
                          inventoryStats.outOfStock
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="inventory-analysis-item warning">
                <div className="analysis-label">
                  <span>Low Stock</span>
                </div>

                <div className="analysis-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        inventoryStats.lowStock * 8
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="inventory-analysis-item danger">
                <div className="analysis-label">
                  <span>Out of Stock</span>
                </div>

                <div className="analysis-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        inventoryStats.outOfStock * 10
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CUSTOMER REPORT */}

      {activeReport === 'customers' && (
        <div className="report-panel">
          <div className="report-panel-header">
            <div>
              <h3>Top Customers</h3>
              <p>
                Customers with the highest purchase activity
              </p>
            </div>
          </div>

          <div className="customer-report-table">
            <div className="customer-report-header">
              <span>#</span>
              <span>Customer</span>
              <span>Phone</span>
              <span>Purchases</span>
              <span>Total Spent</span>
            </div>

            {topCustomers.map(
              (customer, index) => (
                <div
                  className="customer-report-row"
                  key={customer.id}
                >
                  <span className="customer-rank">
                    {index + 1}
                  </span>

                  <div className="customer-name">
                    <div className="customer-avatar">
                      {customer.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <strong>
                      {customer.name}
                    </strong>
                  </div>

                  <span>
                    {customer.phone}
                  </span>

                  <span>
                    {customer.purchases}
                  </span>

                  <strong>
                    {currency(customer.spent)}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Live sales */}

      {sales.length > 0 && (
        <div className="report-live-note">
          <div>
            <TrendingUp size={18} />

            <div>
              <strong>
                Live Sales Data Connected
              </strong>

              <span>
                {sales.length} completed transaction
                {sales.length !== 1 ? 's' : ''} stored
                in the pharmacy system.
              </span>
            </div>
          </div>

          <ArrowUpRight size={18} />
        </div>
      )}
    </div>
  );
}

export default Reports;