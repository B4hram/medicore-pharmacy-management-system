import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  Package,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';

import { notificationsData } from '../data/notificationsData';
import { inventoryItems } from '../data/inventoryData';
import {
  getDaysUntilExpiry,
  getNotifications,
  saveNotifications,
} from '../utils/pharmacyStorage';

import '../styles/notifications.css';

const buildAutomaticNotifications = () => {
  const result = [];

  inventoryItems.forEach((item, index) => {
    const expiryDate = item.expiryDate || item.expiry;

    if (!expiryDate) return;

    const days = getDaysUntilExpiry(expiryDate);

    const medicineName =
      item.name || item.medicineName || 'Unknown Medicine';

    const batchNumber =
      item.batchNumber || item.batch || `BATCH-${index + 1}`;

    const quantity = Number(item.stock ?? item.quantity ?? 0);

    if (days < 0) {
      result.push({
        id: `auto-expired-${item.id ?? index}-${batchNumber}`,
        type: 'expiry',
        title: 'Expired Medicine',
        message: `${medicineName} batch ${batchNumber} has expired.`,
        medicine: medicineName,
        batch: batchNumber,
        severity: 'critical',
        read: false,
        automatic: true,
        createdAt: new Date().toISOString(),
        quantity,
      });
    } else if (days <= 30) {
      result.push({
        id: `auto-critical-${item.id ?? index}-${batchNumber}`,
        type: 'expiry',
        title: 'Critical Expiry Alert',
        message: `${medicineName} batch ${batchNumber} expires in ${days} days.`,
        medicine: medicineName,
        batch: batchNumber,
        severity: 'critical',
        read: false,
        automatic: true,
        createdAt: new Date().toISOString(),
        quantity,
      });
    } else if (days <= 90) {
      result.push({
        id: `auto-soon-${item.id ?? index}-${batchNumber}`,
        type: 'expiry',
        title: 'Medicine Expiring Soon',
        message: `${medicineName} batch ${batchNumber} expires in ${days} days.`,
        medicine: medicineName,
        batch: batchNumber,
        severity: 'warning',
        read: false,
        automatic: true,
        createdAt: new Date().toISOString(),
        quantity,
      });
    }
  });

  inventoryItems.forEach((item, index) => {
    const stock = Number(item.stock ?? item.quantity ?? 0);
    const minimum = Number(item.minimumStock ?? item.minStock ?? 0);

    if (minimum > 0 && stock <= minimum) {
      const medicineName =
        item.name || item.medicineName || 'Unknown Medicine';

      result.push({
        id: `auto-stock-${item.id ?? index}`,
        type: 'stock',
        title: stock <= 0 ? 'Out of Stock' : 'Low Stock Alert',
        message:
          stock <= 0
            ? `${medicineName} is currently out of stock.`
            : `${medicineName} has only ${stock} ${item.unit || 'units'} remaining.`,
        medicine: medicineName,
        severity: stock <= 0 ? 'critical' : 'warning',
        read: false,
        automatic: true,
        createdAt: new Date().toISOString(),
        quantity: stock,
      });
    }
  });

  return result;
};

const getNotificationIcon = (notification) => {
  if (notification.type === 'expiry') {
    if (notification.severity === 'critical') {
      return <XCircle size={19} />;
    }

    return <Clock3 size={19} />;
  }

  if (notification.type === 'stock') {
    return <Package size={19} />;
  }

  if (notification.type === 'system') {
    return <Info size={19} />;
  }

  return <Bell size={19} />;
};

const formatNotificationTime = (date) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const stored = getNotifications([]);

    if (stored.length === 0) {
      const initial = [...notificationsData, ...buildAutomaticNotifications()];
      setNotifications(initial);
      saveNotifications(initial);
    } else {
      setNotifications(stored);
    }
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notification) => {
        if (filter === 'unread') {
          return !notification.read;
        }

        if (filter === 'expiry') {
          return notification.type === 'expiry';
        }

        if (filter === 'stock') {
          return notification.type === 'stock';
        }

        if (filter === 'critical') {
          return notification.severity === 'critical';
        }

        return true;
      })
      .sort((a, b) => {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [notifications, filter]);

  const updateNotifications = (nextNotifications) => {
    setNotifications(nextNotifications);
    saveNotifications(nextNotifications);
  };

  const markAsRead = (id) => {
    const updated = notifications.map((notification) =>
      notification.id === id
        ? { ...notification, read: true }
        : notification
    );

    updateNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    updateNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(
      (notification) => notification.id !== id
    );

    updateNotifications(updated);

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const clearAllNotifications = () => {
    updateNotifications([]);
    setSelectedNotification(null);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-title-area">
          <div className="notifications-title-icon">
            <Bell size={22} />
          </div>

          <div>
            <h1>Notifications</h1>
            <p>
              Important pharmacy alerts, expiry warnings, and inventory
              notifications.
            </p>
          </div>
        </div>

        <div className="notifications-header-actions">
          {unreadCount > 0 && (
            <button
              className="notifications-mark-all"
              onClick={markAllAsRead}
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              className="notifications-clear-button"
              onClick={clearAllNotifications}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notifications-summary">
        <div className="notification-summary-card">
          <div className="notification-summary-icon total">
            <Bell size={19} />
          </div>

          <div>
            <span>Total</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="notification-summary-icon unread">
            <AlertCircle size={19} />
          </div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="notification-summary-icon critical">
            <XCircle size={19} />
          </div>

          <div>
            <span>Critical</span>
            <strong>
              {
                notifications.filter(
                  (notification) =>
                    notification.severity === 'critical'
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="notification-summary-card">
          <div className="notification-summary-icon success">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Reviewed</span>
            <strong>
              {notifications.filter((notification) => notification.read).length}
            </strong>
          </div>
        </div>
      </div>

      <div className="notifications-card">
        <div className="notifications-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
            <span>{notifications.length}</span>
          </button>

          <button
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            Unread
            <span>{unreadCount}</span>
          </button>

          <button
            className={filter === 'expiry' ? 'active' : ''}
            onClick={() => setFilter('expiry')}
          >
            Expiry
            <span>
              {
                notifications.filter(
                  (notification) => notification.type === 'expiry'
                ).length
              }
            </span>
          </button>

          <button
            className={filter === 'stock' ? 'active' : ''}
            onClick={() => setFilter('stock')}
          >
            Stock
            <span>
              {
                notifications.filter(
                  (notification) => notification.type === 'stock'
                ).length
              }
            </span>
          </button>

          <button
            className={filter === 'critical' ? 'active' : ''}
            onClick={() => setFilter('critical')}
          >
            Critical
            <span>
              {
                notifications.filter(
                  (notification) =>
                    notification.severity === 'critical'
                ).length
              }
            </span>
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <CheckCircle2 size={34} />
              </div>

              <h3>No notifications</h3>
              <p>
                There are no notifications matching the selected filter.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? 'read' : 'unread'
                } ${notification.severity}`}
              >
                <div
                  className={`notification-item-icon ${
                    notification.type
                  } ${notification.severity}`}
                >
                  {getNotificationIcon(notification)}
                </div>

                <div className="notification-item-content">
                  <div className="notification-item-top">
                    <div>
                      <div className="notification-item-title-row">
                        <h3>{notification.title}</h3>

                        {!notification.read && (
                          <span className="notification-unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>
                    </div>

                    <span className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>

                  <div className="notification-item-bottom">
                    <div className="notification-tags">
                      {notification.medicine && (
                        <span>{notification.medicine}</span>
                      )}

                      {notification.batch && (
                        <span>Batch: {notification.batch}</span>
                      )}

                      {notification.automatic && (
                        <span className="automatic">Automatic</span>
                      )}
                    </div>

                    <div className="notification-actions">
                      <button
                        onClick={() => setSelectedNotification(notification)}
                      >
                        View
                      </button>

                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={14} />
                          Read
                        </button>
                      )}

                      <button
                        className="delete"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedNotification && (
        <div
          className="notifications-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null);
            }
          }}
        >
          <div className="notification-details-modal">
            <div className="notification-details-header">
              <div className="notification-details-title">
                <div
                  className={`notification-details-icon ${selectedNotification.severity}`}
                >
                  {getNotificationIcon(selectedNotification)}
                </div>

                <div>
                  <h2>{selectedNotification.title}</h2>
                  <span>
                    {formatNotificationTime(
                      selectedNotification.createdAt
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="notification-modal-close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="notification-details-body">
              <p className="notification-details-message">
                {selectedNotification.message}
              </p>

              <div className="notification-details-grid">
                <div>
                  <span>Type</span>
                  <strong>
                    {selectedNotification.type === 'expiry'
                      ? 'Expiry Alert'
                      : selectedNotification.type === 'stock'
                      ? 'Stock Alert'
                      : 'System Alert'}
                  </strong>
                </div>

                <div>
                  <span>Severity</span>
                  <strong>
                    {selectedNotification.severity === 'critical'
                      ? 'Critical'
                      : 'Warning'}
                  </strong>
                </div>

                <div>
                  <span>Medicine</span>
                  <strong>
                    {selectedNotification.medicine || '—'}
                  </strong>
                </div>

                <div>
                  <span>Batch</span>
                  <strong>{selectedNotification.batch || '—'}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedNotification.read ? 'Read' : 'Unread'}
                  </strong>
                </div>

                <div>
                  <span>Source</span>
                  <strong>
                    {selectedNotification.automatic
                      ? 'Automatic System Alert'
                      : 'Pharmacy Notification'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="notification-details-footer">
              {!selectedNotification.read && (
                <button
                  className="notification-primary-button"
                  onClick={() => {
                    markAsRead(selectedNotification.id);

                    setSelectedNotification({
                      ...selectedNotification,
                      read: true,
                    });
                  }}
                >
                  <Check size={16} />
                  Mark as Read
                </button>
              )}

              <button
                className="notification-secondary-button"
                onClick={() => setSelectedNotification(null)}
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

export default Notifications;