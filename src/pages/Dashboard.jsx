
import { useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  DollarSign,
  FileWarning,
  MoreHorizontal,
  Pill,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';

import {
  dashboardStats,
  salesData,
  lowStockMedicines,
  expiringMedicines,
  recentSales,
  recentCustomers,
  dashboardAlerts,
  categorySales,
} from '../data/dashboardData';

import '../styles/dashboard.css';

function Dashboard() {
  const [salesPeriod, setSalesPeriod] = useState('week');

  const currentSales = salesData[salesPeriod];

  const totalSales = useMemo(() => {
    return currentSales.reduce(
      (total, item) => total + item.sales,
      0
    );
  }, [currentSales]);

  const highestSale = useMemo(() => {
    return Math.max(
      ...currentSales.map((item) => item.sales)
    );
  }, [currentSales]);

  const maxCategoryValue = Math.max(
    ...categorySales.map((item) => item.value)
  );

  return (
    <div className="dashboard-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <PageHeader
        title="Dashboard"
        description="Monitor your pharmacy operations, sales, inventory, and alerts."
        action={
          <button className="primary-button">
            <ShoppingCart size={17} />
            New Sale
          </button>
        }
      />

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <section className="stats-grid">
        {dashboardStats.map((stat) => {
          let Icon = Pill;

          if (stat.icon === 'boxes') {
            Icon = Boxes;
          }

          if (stat.icon === 'sales') {
            Icon = ShoppingCart;
          }

          if (stat.icon === 'users') {
            Icon = Users;
          }

          return (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              description={stat.description}
              icon={Icon}
              variant={stat.variant}
            />
          );
        })}
      </section>

      {/* =====================================================
          QUICK BUSINESS SUMMARY
          ===================================================== */}

      <section className="quick-summary-grid">

        <div className="quick-summary-card">
          <div className="quick-summary-icon revenue">
            <DollarSign size={19} />
          </div>

          <div>
            <span>Today's Revenue</span>

            <strong>$4,285.00</strong>

            <small>
              <TrendingUp size={12} />
              12.6% vs yesterday
            </small>
          </div>
        </div>

        <div className="quick-summary-card">
          <div className="quick-summary-icon transactions">
            <ShoppingCart size={19} />
          </div>

          <div>
            <span>Today's Transactions</span>

            <strong>186</strong>

            <small>
              <TrendingUp size={12} />
              9.4% vs yesterday
            </small>
          </div>
        </div>

        <div className="quick-summary-card">
          <div className="quick-summary-icon customers">
            <Users size={19} />
          </div>

          <div>
            <span>New Customers</span>

            <strong>24</strong>

            <small>
              <TrendingUp size={12} />
              6.8% this week
            </small>
          </div>
        </div>

        <div className="quick-summary-card">
          <div className="quick-summary-icon prescriptions">
            <FileWarning size={19} />
          </div>

          <div>
            <span>Prescriptions</span>

            <strong>42</strong>

            <small>
              <TrendingDown size={12} />
              2.1% today
            </small>
          </div>
        </div>

      </section>

      {/* =====================================================
          MAIN DASHBOARD GRID
          ===================================================== */}

      <section className="dashboard-main-grid">

        {/* SALES CHART */}

        <div className="dashboard-card sales-chart-card">

          <div className="card-header">

            <div>
              <div className="card-title-row">
                <h3>Sales Overview</h3>

                <span className="live-indicator">
                  <span></span>
                  Live
                </span>
              </div>

              <p>
                Pharmacy sales performance
              </p>
            </div>

            <div className="chart-controls">

              <div className="chart-total">
                <strong>
                  $
                  {totalSales.toLocaleString()}
                </strong>

                <span>
                  <TrendingUp size={12} />
                  14.8%
                </span>
              </div>

              <div className="period-selector">

                <select
                  value={salesPeriod}
                  onChange={(event) =>
                    setSalesPeriod(event.target.value)
                  }
                >
                  <option value="week">
                    This Week
                  </option>

                  <option value="month">
                    This Month
                  </option>

                  <option value="year">
                    This Year
                  </option>
                </select>

                <ChevronDown size={14} />
              </div>

            </div>

          </div>

          <div className="sales-chart">

            <div className="chart-y-axis">
              <span>
                ${Math.round(highestSale / 1000)}k
              </span>

              <span>
                ${Math.round(highestSale * 0.75 / 1000)}k
              </span>

              <span>
                ${Math.round(highestSale * 0.5 / 1000)}k
              </span>

              <span>
                ${Math.round(highestSale * 0.25 / 1000)}k
              </span>

              <span>$0</span>
            </div>

            <div className="chart-main">

              <div className="chart-grid-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="chart-bars-large">

                {currentSales.map((item) => {

                  const height =
                    highestSale > 0
                      ? (item.sales / highestSale) * 100
                      : 0;

                  return (
                    <div
                      className="large-chart-column"
                      key={item.day}
                    >
                      <div className="chart-tooltip">
                        $
                        {item.sales.toLocaleString()}
                      </div>

                      <div
                        className="large-chart-bar"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <span>
                        {item.day}
                      </span>
                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </div>

        {/* ALERTS */}

        <div className="dashboard-card alerts-card">

          <div className="card-header">

            <div>
              <h3>Important Alerts</h3>

              <p>
                Items requiring attention
              </p>
            </div>

            <div className="alert-count">
              {dashboardAlerts.length}
            </div>

          </div>

          <div className="dashboard-alert-list">

            {dashboardAlerts.map((alert) => {

              let Icon = AlertTriangle;

              if (alert.type === 'warning') {
                Icon = Clock3;
              }

              if (alert.type === 'info') {
                Icon = FileWarning;
              }

              return (
                <div
                  className={`dashboard-alert ${alert.type}`}
                  key={alert.id}
                >
                  <div className="dashboard-alert-icon">
                    <Icon size={17} />
                  </div>

                  <div className="dashboard-alert-content">
                    <strong>
                      {alert.title}
                    </strong>

                    <p>
                      {alert.message}
                    </p>

                    <button>
                      View Details
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

          </div>

          <div className="alerts-footer">
            <button>
              View All Notifications
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </section>

      {/* =====================================================
          INVENTORY + CATEGORY
          ===================================================== */}

      <section className="dashboard-secondary-grid">

        {/* LOW STOCK */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Low Stock Medicines</h3>

              <p>
                Medicines below minimum stock level
              </p>
            </div>

            <button className="card-action-button">
              View All
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="low-stock-list">

            {lowStockMedicines.map((medicine) => {

              const stockPercentage =
                (medicine.stock /
                  medicine.minimumStock) *
                100;

              return (
                <div
                  className="low-stock-row"
                  key={medicine.id}
                >

                  <div className="medicine-mini-icon">
                    <Pill size={16} />
                  </div>

                  <div className="medicine-stock-info">

                    <div className="medicine-stock-top">

                      <div>
                        <strong>
                          {medicine.name}
                        </strong>

                        <span>
                          {medicine.category}
                        </span>
                      </div>

                      <div className="stock-number">
                        <strong>
                          {medicine.stock}
                        </strong>

                        <span>
                          / {medicine.minimumStock}
                        </span>
                      </div>

                    </div>

                    <div className="stock-progress">
                      <span
                        style={{
                          width: `${Math.min(
                            stockPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                  </div>

                  <span className="stock-warning">
                    Low
                  </span>

                </div>
              );
            })}

          </div>

        </div>

        {/* SALES BY CATEGORY */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Sales by Category</h3>

              <p>
                Distribution of medicine sales
              </p>
            </div>

            <BarChart3 size={19} />

          </div>

          <div className="category-chart">

            <div className="category-donut">

              <div className="donut-center">
                <strong>100%</strong>
                <span>Total</span>
              </div>

            </div>

            <div className="category-list">

              {categorySales.map((item) => {

                const percentage =
                  Math.round(item.value);

                return (
                  <div
                    className="category-item"
                    key={item.category}
                  >
                    <div className="category-label">

                      <span className="category-dot"></span>

                      <span>
                        {item.category}
                      </span>

                    </div>

                    <strong>
                      {percentage}%
                    </strong>

                    <div className="category-progress">
                      <span
                        style={{
                          width: `${(
                            item.value /
                            maxCategoryValue
                          ) * 100}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          EXPIRING MEDICINES
          ===================================================== */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h3>Medicines Expiring Soon</h3>

            <p>
              Medicines that require expiry management
            </p>
          </div>

          <button className="card-action-button">
            View Expiry Report
            <ArrowRight size={13} />
          </button>

        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Time Remaining</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {expiringMedicines.map((medicine) => (

                <tr key={medicine.id}>

                  <td>
                    <div className="table-medicine">
                      <div className="table-medicine-icon">
                        <Pill size={15} />
                      </div>

                      <strong>
                        {medicine.name}
                      </strong>
                    </div>
                  </td>

                  <td>
                    {medicine.batch}
                  </td>

                  <td>
                    {medicine.expiry}
                  </td>

                  <td>
                    {medicine.quantity}
                  </td>

                  <td>
                    <span className="days-remaining">
                      <Clock3 size={13} />
                      {medicine.daysLeft} days
                    </span>
                  </td>

                  <td>
                    <StatusBadge
                      status="Expiring Soon"
                      variant="warning"
                    />
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          RECENT SALES + CUSTOMERS
          ===================================================== */}

      <section className="dashboard-secondary-grid">

        {/* RECENT SALES */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Recent Sales</h3>

              <p>
                Latest pharmacy transactions
              </p>
            </div>

            <button className="card-action-button">
              View All
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="table-container">

            <table className="compact-table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                </tr>
              </thead>

              <tbody>

                {recentSales.slice(0, 5).map((sale) => (

                  <tr key={sale.id}>

                    <td>
                      <strong>
                        {sale.invoice}
                      </strong>
                    </td>

                    <td>
                      {sale.customer}
                    </td>

                    <td>
                      <strong>
                        {sale.total}
                      </strong>
                    </td>

                    <td>
                      <span className="payment-type">
                        {sale.payment}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* RECENT CUSTOMERS */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Recent Customers</h3>

              <p>
                Latest customer activity
              </p>
            </div>

            <button className="card-action-button">
              View All
              <ArrowRight size={13} />
            </button>

          </div>

          <div className="customer-list">

            {recentCustomers.map((customer) => (

              <div
                className="customer-row"
                key={customer.id}
              >

                <div className="customer-avatar">
                  {customer.name
                    .split(' ')
                    .map((word) => word[0])
                    .join('')
                    .slice(0, 2)}
                </div>

                <div className="customer-info">

                  <strong>
                    {customer.name}
                  </strong>

                  <span>
                    {customer.phone}
                  </span>

                </div>

                <div className="customer-spending">

                  <strong>
                    {customer.spent}
                  </strong>

                  <span>
                    {customer.purchases} purchases
                  </span>

                </div>

                <button className="more-button">
                  <MoreHorizontal size={17} />
                </button>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          SYSTEM STATUS
          ===================================================== */}

      <section className="system-status">

        <div className="system-status-left">

          <div className="system-status-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <strong>
              Pharmacy system operational
            </strong>

            <span>
              All major services are running normally.
            </span>
          </div>

        </div>

        <div className="system-status-time">
          <Clock3 size={14} />
          Last updated just now
        </div>

      </section>

    </div>
  );
}

export default Dashboard;
