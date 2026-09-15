const STORAGE_KEYS = {
  inventoryOverrides: 'medicore_inventory_overrides',
  sales: 'medicore_sales',
  notifications: 'medicore_notifications',
};

/* =========================================================
   INVENTORY OVERRIDES
========================================================= */

export function getInventoryOverrides() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.inventoryOverrides);

    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === 'object'
      ? parsed
      : {};
  } catch (error) {
    console.error('Error loading inventory overrides:', error);
    return {};
  }
}

export function saveInventoryOverrides(overrides) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.inventoryOverrides,
      JSON.stringify(overrides || {})
    );

    return true;
  } catch (error) {
    console.error('Error saving inventory overrides:', error);
    return false;
  }
}

/* =========================================================
   SALES
========================================================= */

export function getSavedSales() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.sales);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading sales:', error);
    return [];
  }
}

export function saveSale(sale) {
  try {
    const sales = getSavedSales();

    const newSale = {
      ...sale,
      id:
        sale?.id ||
        `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt:
        sale?.createdAt ||
        new Date().toISOString(),
    };

    sales.unshift(newSale);

    localStorage.setItem(
      STORAGE_KEYS.sales,
      JSON.stringify(sales)
    );

    return newSale;
  } catch (error) {
    console.error('Error saving sale:', error);
    return null;
  }
}

export function deleteSale(saleId) {
  try {
    const sales = getSavedSales();

    const updatedSales = sales.filter(
      (sale) => sale.id !== saleId
    );

    localStorage.setItem(
      STORAGE_KEYS.sales,
      JSON.stringify(updatedSales)
    );

    return true;
  } catch (error) {
    console.error('Error deleting sale:', error);
    return false;
  }
}

export function clearSavedSales() {
  try {
    localStorage.removeItem(STORAGE_KEYS.sales);
    return true;
  } catch (error) {
    console.error('Error clearing sales:', error);
    return false;
  }
}

/* =========================================================
   UPDATE INVENTORY AFTER SALE
========================================================= */

export function updateInventoryAfterSale(items = []) {
  try {
    const overrides = getInventoryOverrides();

    items.forEach((item) => {
      const inventoryId =
        item.inventoryId ||
        item.id ||
        item.medicineId;

      if (!inventoryId) {
        return;
      }

      const quantitySold = Number(
        item.quantity || item.qty || 0
      );

      const currentStock = Number(
        overrides[inventoryId] ??
        item.stock ??
        item.availableStock ??
        0
      );

      const newStock = Math.max(
        0,
        currentStock - quantitySold
      );

      overrides[inventoryId] = newStock;
    });

    saveInventoryOverrides(overrides);

    return true;
  } catch (error) {
    console.error(
      'Error updating inventory after sale:',
      error
    );

    return false;
  }
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

export function getNotifications() {
  try {
    const saved = localStorage.getItem(
      STORAGE_KEYS.notifications
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
}

export function saveNotifications(notifications) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(notifications || [])
    );

    return true;
  } catch (error) {
    console.error('Error saving notifications:', error);
    return false;
  }
}

export function clearNotifications() {
  try {
    localStorage.removeItem(
      STORAGE_KEYS.notifications
    );

    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
}

/* =========================================================
   EXPIRY CALCULATION
========================================================= */

export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) {
    return null;
  }

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) {
    return null;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const difference =
    expiry.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

/* =========================================================
   STORAGE RESET
========================================================= */

export function clearPharmacyStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error(
      'Error clearing pharmacy storage:',
      error
    );

    return false;
  }
}