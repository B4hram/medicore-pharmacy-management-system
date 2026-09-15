import {
  AlertCircle,
  Banknote,
  Barcode,
  Calculator,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Minus,
  Package,
  Pill,
  Plus,
  Printer,
  Receipt,
  RefreshCcw,
  Search,
  ShoppingCart,
  Trash2,
  User,
  UserPlus,
  X,
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { inventoryItems } from '../data/inventoryData';
import {
  defaultSalesSettings,
  demoCustomers,
  getNextInvoiceNumber,
  paymentMethods,
} from '../data/salesData';

import {
  getInventoryOverrides,
  getSavedSales,
  saveSale,
  updateInventoryAfterSale,
} from '../utils/pharmacyStorage';

import '../styles/sales.css';

const WALK_IN_CUSTOMER = {
  id: 'walk-in',
  name: 'Walk-in Customer',
  phone: '',
  email: '',
};

const currency = defaultSalesSettings.currency;

const normalizeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const formatMoney = (value) => {
  return `${currency}${normalizeNumber(value).toFixed(2)}`;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(date));
};

const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) {
    return null;
  }

  const expiry = new Date(expiryDate);
  const today = new Date();

  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );
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

const getInventoryId = (item) => {
  return String(
    item.id ??
      item.inventoryId ??
      item.medicineId ??
      item._id ??
      item.batchNumber ??
      item.name
  );
};

const getMedicineName = (item) => {
  return (
    item.name ??
    item.medicineName ??
    item.productName ??
    'Unknown Medicine'
  );
};

const getGenericName = (item) => {
  return (
    item.genericName ??
    item.generic ??
    ''
  );
};

const getCategory = (item) => {
  return (
    item.category ??
    item.categoryName ??
    'Other'
  );
};

const getUnit = (item) => {
  return (
    item.unit ??
    'boxes'
  );
};

const getSellingPrice = (item) => {
  return normalizeNumber(
    item.sellingPrice ??
      item.salePrice ??
      item.price ??
      item.unitPrice
  );
};

const getPurchasePrice = (item) => {
  return normalizeNumber(
    item.purchasePrice ??
      item.costPrice ??
      item.unitCost ??
      item.cost
  );
};

const getStock = (item) => {
  return normalizeNumber(
    item.stock ??
      item.quantity ??
      item.currentStock ??
      item.availableStock
  );
};

const getBatchNumber = (item) => {
  return (
    item.batchNumber ??
    item.batch ??
    'N/A'
  );
};

const getExpiryDate = (item) => {
  return (
    item.expiryDate ??
    item.expiry ??
    null
  );
};

const getSupplier = (item) => {
  return (
    item.supplier ??
    item.supplierName ??
    'Not specified'
  );
};

const getPrescriptionRequired = (item) => {
  return Boolean(
    item.prescriptionRequired ??
      item.requiresPrescription ??
      item.prescription
  );
};

const normalizeInventory = (rawItems) => {
  const result = [];

  rawItems.forEach((item) => {
    const inventoryId = getInventoryId(item);

    if (Array.isArray(item.batches) && item.batches.length > 0) {
      item.batches.forEach((batch, index) => {
        const quantity = normalizeNumber(
          batch.quantity ??
            batch.stock ??
            batch.availableStock
        );

        result.push({
          id: `${inventoryId}-${index}`,
          inventoryId,
          medicineId: item.medicineId ?? inventoryId,
          name: getMedicineName(item),
          genericName: getGenericName(item),
          category: getCategory(item),
          batchNumber:
            batch.batchNumber ??
            batch.batch ??
            getBatchNumber(item),
          stock: quantity,
          unit: batch.unit ?? getUnit(item),
          purchasePrice: normalizeNumber(
            batch.purchasePrice ??
              getPurchasePrice(item)
          ),
          sellingPrice: normalizeNumber(
            batch.sellingPrice ??
              getSellingPrice(item)
          ),
          expiryDate:
            batch.expiryDate ??
            batch.expiry ??
            getExpiryDate(item),
          supplier:
            batch.supplier ??
            getSupplier(item),
          prescriptionRequired:
            batch.prescriptionRequired ??
            getPrescriptionRequired(item),
          barcode:
            batch.barcode ??
            item.barcode ??
            '',
          location:
            batch.location ??
            item.location ??
            'Main Store',
        });
      });

      return;
    }

    result.push({
      id: inventoryId,
      inventoryId,
      medicineId: item.medicineId ?? inventoryId,
      name: getMedicineName(item),
      genericName: getGenericName(item),
      category: getCategory(item),
      batchNumber: getBatchNumber(item),
      stock: getStock(item),
      unit: getUnit(item),
      purchasePrice: getPurchasePrice(item),
      sellingPrice: getSellingPrice(item),
      expiryDate: getExpiryDate(item),
      supplier: getSupplier(item),
      prescriptionRequired:
        getPrescriptionRequired(item),
      barcode: item.barcode ?? '',
      location: item.location ?? 'Main Store',
    });
  });

  return result;
};

const getBatchStock = (
  item,
  overrides
) => {
  const inventoryOverride =
    overrides[item.inventoryId];

  if (
    inventoryOverride?.batches &&
    item.batchNumber &&
    Object.prototype.hasOwnProperty.call(
      inventoryOverride.batches,
      item.batchNumber
    )
  ) {
    return normalizeNumber(
      inventoryOverride.batches[item.batchNumber]
    );
  }

  if (
    typeof inventoryOverride?.quantity === 'number'
  ) {
    return Math.min(
      item.stock,
      inventoryOverride.quantity
    );
  }

  return item.stock;
};

const getInitialCart = () => [];

function Sales() {
  const [inventoryOverrides, setInventoryOverrides] =
    useState(getInventoryOverrides());

  const [cart, setCart] =
    useState(getInitialCart);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('All Categories');

  const [selectedCustomer, setSelectedCustomer] =
    useState(WALK_IN_CUSTOMER);

  const [customerSearch, setCustomerSearch] =
    useState('');

  const [showCustomerMenu, setShowCustomerMenu] =
    useState(false);

  const [discount, setDiscount] =
    useState('');

  const [taxRate, setTaxRate] =
    useState(defaultSalesSettings.taxRate);

  const [paymentMethod, setPaymentMethod] =
    useState('cash');

  const [amountReceived, setAmountReceived] =
    useState('');

  const [prescriptionNumber, setPrescriptionNumber] =
    useState('');

  const [prescriptionNotes, setPrescriptionNotes] =
    useState('');

  const [showPrescriptionWarning, setShowPrescriptionWarning] =
    useState(false);

  const [selectedMedicine, setSelectedMedicine] =
    useState(null);

  const [medicineQuantity, setMedicineQuantity] =
    useState(1);

  const [showMedicineModal, setShowMedicineModal] =
    useState(false);

  const [showReceipt, setShowReceipt] =
    useState(false);

  const [completedSale, setCompletedSale] =
    useState(null);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [sales, setSales] =
    useState(getSavedSales);

  useEffect(() => {
    const handleInventoryUpdate = () => {
      setInventoryOverrides(
        getInventoryOverrides()
      );
    };

    window.addEventListener(
      'storage',
      handleInventoryUpdate
    );

    window.addEventListener(
      'medicore-inventory-updated',
      handleInventoryUpdate
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleInventoryUpdate
      );

      window.removeEventListener(
        'medicore-inventory-updated',
        handleInventoryUpdate
      );
    };
  }, []);

  const medicines = useMemo(() => {
    return normalizeInventory(
      inventoryItems
    ).map((item) => ({
      ...item,
      availableStock: getBatchStock(
        item,
        inventoryOverrides
      ),
    }));
  }, [inventoryOverrides]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        medicines.map(
          (medicine) => medicine.category
        )
      ),
    ];

    return [
      'All Categories',
      ...uniqueCategories,
    ];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const query =
      searchTerm
        .trim()
        .toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !query ||
        medicine.name
          .toLowerCase()
          .includes(query) ||
        medicine.genericName
          .toLowerCase()
          .includes(query) ||
        medicine.batchNumber
          .toLowerCase()
          .includes(query) ||
        medicine.barcode
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter ===
          'All Categories' ||
        medicine.category ===
          categoryFilter;

      const isAvailable =
        medicine.availableStock > 0;

      const isNotExpired =
        getDaysUntilExpiry(
          medicine.expiryDate
        ) !== null
          ? getDaysUntilExpiry(
              medicine.expiryDate
            ) >= 0
          : true;

      return (
        matchesSearch &&
        matchesCategory &&
        isAvailable &&
        isNotExpired
      );
    });
  }, [
    medicines,
    searchTerm,
    categoryFilter,
  ]);

  const customerResults = useMemo(() => {
    const query =
      customerSearch
        .trim()
        .toLowerCase();

    if (!query) {
      return demoCustomers;
    }

    return demoCustomers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(query) ||
        customer.phone
          .toLowerCase()
          .includes(query)
    );
  }, [customerSearch]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        item.sellingPrice *
          item.quantity,
      0
    );
  }, [cart]);

  const discountAmount = useMemo(() => {
    const value =
      normalizeNumber(discount);

    return Math.min(
      Math.max(value, 0),
      subtotal
    );
  }, [
    discount,
    subtotal,
  ]);

  const taxableAmount =
    Math.max(
      subtotal -
        discountAmount,
      0
    );

  const taxAmount =
    taxableAmount *
    (normalizeNumber(taxRate) / 100);

  const total =
    taxableAmount +
    taxAmount;

  const received =
    normalizeNumber(
      amountReceived
    );

  const change =
    Math.max(
      received - total,
      0
    );

  const remaining =
    Math.max(
      total - received,
      0
    );

  const prescriptionRequiredItems =
    cart.filter(
      (item) =>
        item.prescriptionRequired
    );

  const hasPrescriptionRequirement =
    prescriptionRequiredItems.length >
    0;

  const canCompleteSale =
    cart.length > 0 &&
    (paymentMethod !== 'cash' ||
      received >= total) &&
    (!hasPrescriptionRequirement ||
      prescriptionNumber.trim());

  const openMedicine = (medicine) => {
    setSelectedMedicine(
      medicine
    );

    setMedicineQuantity(1);

    setErrorMessage('');

    setShowMedicineModal(true);
  };

  const addToCart = (
    medicine,
    quantity = 1
  ) => {
    const requestedQuantity =
      normalizeNumber(quantity);

    if (
      requestedQuantity <= 0
    ) {
      setErrorMessage(
        'Please enter a valid quantity.'
      );

      return;
    }

    if (
      requestedQuantity >
      medicine.availableStock
    ) {
      setErrorMessage(
        `Only ${medicine.availableStock} ${medicine.unit} available.`
      );

      return;
    }

    setCart((currentCart) => {
      const existing =
        currentCart.find(
          (item) =>
            item.id === medicine.id
        );

      if (existing) {
        const newQuantity =
          existing.quantity +
          requestedQuantity;

        if (
          newQuantity >
          medicine.availableStock
        ) {
          setErrorMessage(
            `Only ${medicine.availableStock} ${medicine.unit} available.`
          );

          return currentCart;
        }

        return currentCart.map(
          (item) =>
            item.id === medicine.id
              ? {
                  ...item,
                  quantity:
                    newQuantity,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          id: medicine.id,
          inventoryId:
            medicine.inventoryId,
          medicineId:
            medicine.medicineId,
          name: medicine.name,
          genericName:
            medicine.genericName,
          category:
            medicine.category,
          batchNumber:
            medicine.batchNumber,
          quantity:
            requestedQuantity,
          availableStock:
            medicine.availableStock,
          unit:
            medicine.unit,
          sellingPrice:
            medicine.sellingPrice,
          purchasePrice:
            medicine.purchasePrice,
          expiryDate:
            medicine.expiryDate,
          supplier:
            medicine.supplier,
          prescriptionRequired:
            medicine.prescriptionRequired,
          barcode:
            medicine.barcode,
        },
      ];
    });

    setShowMedicineModal(false);

    setSelectedMedicine(null);

    setSearchTerm('');

    setErrorMessage('');
  };

  const increaseQuantity = (
    cartItem
  ) => {
    setCart((currentCart) =>
      currentCart.map(
        (item) => {
          if (
            item.id !==
            cartItem.id
          ) {
            return item;
          }

          if (
            item.quantity >=
            item.availableStock
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              item.quantity + 1,
          };
        }
      )
    );
  };

  const decreaseQuantity = (
    cartItem
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (
            item.id !==
            cartItem.id
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              item.quantity - 1,
          };
        })
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  const updateQuantity = (
    cartItem,
    value
  ) => {
    const quantity =
      Math.floor(
        normalizeNumber(value)
      );

    setCart((currentCart) =>
      currentCart.map(
        (item) => {
          if (
            item.id !==
            cartItem.id
          ) {
            return item;
          }

          if (
            quantity <= 0
          ) {
            return {
              ...item,
              quantity: 1,
            };
          }

          return {
            ...item,
            quantity: Math.min(
              quantity,
              item.availableStock
            ),
          };
        }
      )
    );
  };

  const removeFromCart = (
    cartItem
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !==
          cartItem.id
      )
    );
  };

  const clearSale = () => {
    setCart([]);

    setSelectedCustomer(
      WALK_IN_CUSTOMER
    );

    setDiscount('');

    setTaxRate(
      defaultSalesSettings.taxRate
    );

    setPaymentMethod('cash');

    setAmountReceived('');

    setPrescriptionNumber('');

    setPrescriptionNotes('');

    setErrorMessage('');

    setShowPrescriptionWarning(false);
  };

  const selectCustomer = (
    customer
  ) => {
    setSelectedCustomer(
      customer
    );

    setShowCustomerMenu(false);

    setCustomerSearch('');
  };

  const validateSale = () => {
    if (cart.length === 0) {
      return 'Please add at least one medicine to the cart.';
    }

    const stockProblem =
      cart.find(
        (item) =>
          item.quantity >
          item.availableStock
      );

    if (stockProblem) {
      return `${stockProblem.name} does not have enough stock.`;
    }

    if (
      hasPrescriptionRequirement &&
      !prescriptionNumber.trim()
    ) {
      return 'A prescription number is required for prescription medicines.';
    }

    if (
      paymentMethod === 'cash' &&
      received < total
    ) {
      return `Customer still owes ${formatMoney(
        remaining
      )}.`;
    }

    return '';
  };

  const completeSale = () => {
    const validationError =
      validateSale();

    if (validationError) {
      setErrorMessage(
        validationError
      );

      if (
        hasPrescriptionRequirement &&
        !prescriptionNumber.trim()
      ) {
        setShowPrescriptionWarning(
          true
        );
      }

      return;
    }

    const invoiceNumber =
      getNextInvoiceNumber();

    const sale = {
      id:
        `sale-${Date.now()}`,

      invoiceNumber,

      date:
        new Date().toISOString(),

      customer: {
        id:
          selectedCustomer.id,

        name:
          selectedCustomer.name,

        phone:
          selectedCustomer.phone,
      },

      items:
        cart.map(
          (item) => ({
            id:
              item.id,

            medicineId:
              item.medicineId,

            inventoryId:
              item.inventoryId,

            name:
              item.name,

            genericName:
              item.genericName,

            batchNumber:
              item.batchNumber,

            quantity:
              item.quantity,

            unit:
              item.unit,

            unitPrice:
              item.sellingPrice,

            total:
              item.sellingPrice *
              item.quantity,

            expiryDate:
              item.expiryDate,
          })
        ),

      subtotal,

      discount:
        discountAmount,

      taxRate:
        normalizeNumber(
          taxRate
        ),

      tax:
        taxAmount,

      total,

      paymentMethod,

      amountReceived:
        received,

      change,

      prescription:
        hasPrescriptionRequirement
          ? {
              required:
                true,

              number:
                prescriptionNumber.trim(),

              notes:
                prescriptionNotes.trim(),
            }
          : {
              required:
                false,

              number:
                '',

              notes:
                '',
            },

      status:
        'Completed',
    };

    updateInventoryAfterSale(
      cart
    );

    saveSale(sale);

    setSales(
      getSavedSales()
    );

    setCompletedSale(
      sale
    );

    setShowSuccess(true);

    setShowReceipt(true);

    setInventoryOverrides(
      getInventoryOverrides()
    );

    setCart([]);

    setDiscount('');

    setAmountReceived('');

    setPrescriptionNumber('');

    setPrescriptionNotes('');

    setErrorMessage('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const quickCashAmount = (
    value
  ) => {
    setAmountReceived(
      String(value)
    );
  };

  return (
    <div className="sales-page">

      <div className="sales-page-header">

        <div>
          <div className="sales-breadcrumb">
            Sales
            <span>/</span>
            Point of Sale
          </div>

          <h1>
            Pharmacy Point of Sale
          </h1>

          <p>
            Process physical pharmacy
            sales quickly and accurately.
          </p>
        </div>

        <div className="sales-header-actions">

          <div className="sales-status-pill">
            <span className="sales-status-dot" />
            POS Ready
          </div>

          <button
            className="sales-secondary-button"
            type="button"
            onClick={clearSale}
          >
            <RefreshCcw size={16} />
            New Sale
          </button>

        </div>

      </div>

      {showSuccess && (
        <div className="sale-success-banner">

          <div className="success-banner-icon">
            <Check size={20} />
          </div>

          <div>
            <strong>
              Sale completed successfully
            </strong>

            <span>
              Invoice #
              {completedSale?.invoiceNumber}
              {' '}
              has been created.
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowSuccess(false)
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      {errorMessage && (
        <div className="sale-error-banner">

          <AlertCircle size={18} />

          <span>
            {errorMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setErrorMessage('')
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      <div className="pos-layout">

        {/* LEFT SIDE */}

        <section className="pos-products-panel">

          <div className="pos-panel-header">

            <div>
              <h2>
                Select Medicine
              </h2>

              <span>
                Search medicines and add
                them to the sale.
              </span>
            </div>

            <div className="medicine-count">
              {filteredMedicines.length}
              {' '}
              available
            </div>

          </div>

          <div className="medicine-search-area">

            <div className="sales-search-wrapper">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search medicine, generic name, batch or barcode..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm('')
                  }
                >
                  <X size={16} />
                </button>
              )}

            </div>

            <div className="category-filter-wrapper">

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={15} />

            </div>

          </div>

          <div className="medicine-grid">

            {filteredMedicines.length === 0 ? (
              <div className="pos-empty-state">

                <div className="empty-state-icon">
                  <Pill size={25} />
                </div>

                <h3>
                  No medicines found
                </h3>

                <p>
                  Try another medicine name,
                  batch number or category.
                </p>

              </div>
            ) : (
              filteredMedicines.map(
                (medicine) => {

                  const expiry =
                    getExpiryStatus(
                      medicine.expiryDate
                    );

                  return (
                    <button
                      className="medicine-pos-card"
                      key={medicine.id}
                      type="button"
                      onClick={() =>
                        openMedicine(
                          medicine
                        )
                      }
                    >

                      <div className="medicine-card-top">

                        <div className="medicine-icon">
                          <Pill size={20} />
                        </div>

                        <span
                          className={`expiry-mini-badge ${expiry.className}`}
                        >
                          {expiry.label}
                        </span>

                      </div>

                      <div className="medicine-card-info">

                        <strong>
                          {medicine.name}
                        </strong>

                        <span>
                          {medicine.genericName ||
                            'Generic name not specified'}
                        </span>

                      </div>

                      <div className="medicine-card-meta">

                        <div>
                          <small>
                            Batch
                          </small>

                          <strong>
                            {medicine.batchNumber}
                          </strong>
                        </div>

                        <div>
                          <small>
                            Stock
                          </small>

                          <strong>
                            {medicine.availableStock}
                            {' '}
                            {medicine.unit}
                          </strong>
                        </div>

                      </div>

                      <div className="medicine-card-bottom">

                        <strong className="medicine-price">
                          {formatMoney(
                            medicine.sellingPrice
                          )}
                        </strong>

                        {medicine.prescriptionRequired && (
                          <span className="rx-badge">
                            Rx Required
                          </span>
                        )}

                      </div>

                    </button>
                  );
                }
              )
            )}

          </div>

        </section>

        {/* RIGHT SIDE */}

        <section className="pos-cart-panel">

          <div className="cart-panel-header">

            <div className="cart-title">

              <div className="cart-title-icon">
                <ShoppingCart size={19} />
              </div>

              <div>
                <h2>
                  Current Sale
                </h2>

                <span>
                  {cart.length}
                  {' '}
                  {cart.length === 1
                    ? 'item'
                    : 'items'}
                </span>
              </div>

            </div>

            {cart.length > 0 && (
              <button
                className="clear-cart-button"
                type="button"
                onClick={clearSale}
              >
                Clear
              </button>
            )}

          </div>

          {/* CUSTOMER */}

          <div className="customer-section">

            <div className="section-small-heading">
              <User size={15} />
              Customer
            </div>

            <div className="customer-selector">

              <button
                className="selected-customer"
                type="button"
                onClick={() =>
                  setShowCustomerMenu(
                    (value) => !value
                  )
                }
              >

                <div className="customer-avatar">
                  <User size={16} />
                </div>

                <div>
                  <strong>
                    {selectedCustomer.name}
                  </strong>

                  <span>
                    {selectedCustomer.phone ||
                      'No phone number'}
                  </span>
                </div>

                <ChevronDown size={16} />

              </button>

              {showCustomerMenu && (
                <div className="customer-dropdown">

                  <div className="customer-dropdown-search">

                    <Search size={15} />

                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={
                        customerSearch
                      }
                      onChange={(event) =>
                        setCustomerSearch(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <button
                    className="customer-option walk-in"
                    type="button"
                    onClick={() =>
                      selectCustomer(
                        WALK_IN_CUSTOMER
                      )
                    }
                  >

                    <User size={15} />

                    <div>
                      <strong>
                        Walk-in Customer
                      </strong>

                      <span>
                        No customer record
                      </span>
                    </div>

                  </button>

                  {customerResults.map(
                    (customer) => (
                      <button
                        className="customer-option"
                        key={customer.id}
                        type="button"
                        onClick={() =>
                          selectCustomer(
                            customer
                          )
                        }
                      >

                        <div className="small-customer-avatar">
                          {customer.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {customer.name}
                          </strong>

                          <span>
                            {customer.phone}
                          </span>
                        </div>

                      </button>
                    )
                  )}

                  <button
                    className="add-customer-option"
                    type="button"
                  >
                    <UserPlus size={15} />
                    Add New Customer
                  </button>

                </div>
              )}

            </div>

          </div>

          {/* CART */}

          <div className="cart-items-section">

            <div className="section-small-heading">
              <ShoppingCart size={15} />
              Cart Items
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty-state">

                <div className="cart-empty-icon">
                  <ShoppingCart size={28} />
                </div>

                <strong>
                  Your cart is empty
                </strong>

                <span>
                  Select a medicine from
                  the left side to begin.
                </span>

              </div>
            ) : (
              <div className="cart-items-list">

                {cart.map(
                  (item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      <div className="cart-item-icon">
                        <Pill size={17} />
                      </div>

                      <div className="cart-item-info">

                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          Batch:
                          {' '}
                          {item.batchNumber}
                        </span>

                        <span>
                          {formatMoney(
                            item.sellingPrice
                          )}
                          {' '}
                          /
                          {' '}
                          {item.unit}
                        </span>

                        {item.prescriptionRequired && (
                          <small className="cart-rx-warning">
                            Prescription required
                          </small>
                        )}

                      </div>

                      <div className="cart-item-controls">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item
                            )
                          }
                        >
                          <Minus size={13} />
                        </button>

                        <input
                          type="number"
                          min="1"
                          max={
                            item.availableStock
                          }
                          value={
                            item.quantity
                          }
                          onChange={(event) =>
                            updateQuantity(
                              item,
                              event.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item
                            )
                          }
                        >
                          <Plus size={13} />
                        </button>

                      </div>

                      <div className="cart-item-total">

                        <strong>
                          {formatMoney(
                            item.sellingPrice *
                              item.quantity
                          )}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* PRESCRIPTION */}

          {hasPrescriptionRequirement && (
            <div className="prescription-section">

              <div className="prescription-header">

                <div className="prescription-title">
                  <FileText size={16} />

                  <div>
                    <strong>
                      Prescription Information
                    </strong>

                    <span>
                      Required for selected medicine
                    </span>
                  </div>
                </div>

                <span className="required-label">
                  Required
                </span>

              </div>

              <div className="prescription-fields">

                <div className="sales-field">

                  <label>
                    Prescription Number
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. RX-2026-0012"
                    value={
                      prescriptionNumber
                    }
                    onChange={(event) =>
                      setPrescriptionNumber(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="sales-field">

                  <label>
                    Notes
                  </label>

                  <input
                    type="text"
                    placeholder="Optional prescription notes"
                    value={
                      prescriptionNotes
                    }
                    onChange={(event) =>
                      setPrescriptionNotes(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>
          )}

          {/* SUMMARY */}

          <div className="sale-summary">

            <div className="summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                {formatMoney(
                  subtotal
                )}
              </strong>
            </div>

            <div className="summary-row discount-row">

              <span>
                Discount
              </span>

              <div className="summary-input-wrapper">
                <span>
                  {currency}
                </span>

                <input
                  type="number"
                  min="0"
                  value={discount}
                  placeholder="0.00"
                  onChange={(event) =>
                    setDiscount(
                      event.target.value
                    )
                  }
                />
              </div>

            </div>

            <div className="summary-row tax-row">

              <span>
                Tax
              </span>

              <div className="tax-input-wrapper">

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(event) =>
                    setTaxRate(
                      event.target.value
                    )
                  }
                />

                <span>
                  %
                </span>

              </div>

              <strong>
                {formatMoney(
                  taxAmount
                )}
              </strong>

            </div>

            <div className="summary-divider" />

            <div className="total-row">

              <span>
                Total
              </span>

              <strong>
                {formatMoney(total)}
              </strong>

            </div>

          </div>

          {/* PAYMENT */}

          <div className="payment-section">

            <div className="section-small-heading">
              <Calculator size={15} />
              Payment
            </div>

            <div className="payment-methods">

              {paymentMethods.map(
                (method) => {

                  const Icon =
                    method.id ===
                    'cash'
                      ? Banknote
                      : method.id ===
                        'card'
                      ? CreditCard
                      : Receipt;

                  return (
                    <button
                      key={method.id}
                      className={`payment-method ${
                        paymentMethod ===
                        method.id
                          ? 'active'
                          : ''
                      }`}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          method.id
                        )
                      }
                    >

                      <Icon size={17} />

                      <span>
                        {method.label}
                      </span>

                    </button>
                  );
                }
              )}

            </div>

            <div className="amount-received">

              <label>
                Amount Received
              </label>

              <div className="amount-input">

                <span>
                  {currency}
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={
                    amountReceived
                  }
                  onChange={(event) =>
                    setAmountReceived(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {paymentMethod ===
              'cash' && (
              <div className="quick-cash-buttons">

                {[20, 50, 100].map(
                  (value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() =>
                        quickCashAmount(
                          value
                        )
                      }
                    >
                      {currency}
                      {value}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    quickCashAmount(
                      Math.ceil(total)
                    )
                  }
                >
                  Exact
                </button>

              </div>
            )}

            {received > 0 &&
              received >= total && (
                <div className="change-display">

                  <span>
                    Change
                  </span>

                  <strong>
                    {formatMoney(
                      change
                    )}
                  </strong>

                </div>
              )}

            {paymentMethod ===
              'cash' &&
              received > 0 &&
              received < total && (
                <div className="remaining-display">

                  <span>
                    Remaining
                  </span>

                  <strong>
                    {formatMoney(
                      remaining
                    )}
                  </strong>

                </div>
              )}

          </div>

          {/* COMPLETE */}

          <div className="complete-sale-area">

            {hasPrescriptionRequirement &&
              !prescriptionNumber.trim() && (
                <div className="rx-complete-warning">

                  <AlertCircle
                    size={15}
                  />

                  <span>
                    Prescription number
                    required.
                  </span>

                </div>
              )}

            <button
              className="complete-sale-button"
              type="button"
              disabled={
                !canCompleteSale
              }
              onClick={
                completeSale
              }
            >

              <Check size={19} />

              Complete Sale

              <span>
                {formatMoney(total)}
              </span>

            </button>

            <div className="sale-secure-note">
              <Package size={13} />
              Stock will be automatically
              deducted after completion.
            </div>

          </div>

        </section>

      </div>

      {/* MEDICINE MODAL */}

      {showMedicineModal &&
        selectedMedicine && (
          <div
            className="sales-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowMedicineModal(
                  false
                );
              }
            }}
          >

            <div className="medicine-selection-modal">

              <div className="sales-modal-header">

                <div>
                  <div className="modal-eyebrow">
                    Add Medicine
                  </div>

                  <h2>
                    {selectedMedicine.name}
                  </h2>

                  <span>
                    {selectedMedicine.genericName ||
                      'Generic name not specified'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowMedicineModal(
                      false
                    )
                  }
                >
                  <X size={18} />
                </button>

              </div>

              <div className="medicine-selection-body">

                <div className="medicine-detail-grid">

                  <div>
                    <span>
                      Category
                    </span>

                    <strong>
                      {selectedMedicine.category}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Batch Number
                    </span>

                    <strong>
                      {selectedMedicine.batchNumber}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Available Stock
                    </span>

                    <strong>
                      {selectedMedicine.availableStock}
                      {' '}
                      {selectedMedicine.unit}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Selling Price
                    </span>

                    <strong>
                      {formatMoney(
                        selectedMedicine.sellingPrice
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Expiry Date
                    </span>

                    <strong>
                      {selectedMedicine.expiryDate
                        ? formatDate(
                            selectedMedicine.expiryDate
                          )
                        : 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Supplier
                    </span>

                    <strong>
                      {selectedMedicine.supplier}
                    </strong>
                  </div>

                </div>

                {selectedMedicine.prescriptionRequired && (
                  <div className="rx-modal-warning">

                    <AlertCircle size={19} />

                    <div>
                      <strong>
                        Prescription Required
                      </strong>

                      <span>
                        This medicine requires a
                        valid prescription before
                        completing the sale.
                      </span>
                    </div>

                  </div>
                )}

                <div className="modal-quantity-area">

                  <label>
                    Quantity
                  </label>

                  <div className="modal-quantity-control">

                    <button
                      type="button"
                      onClick={() =>
                        setMedicineQuantity(
                          (value) =>
                            Math.max(
                              1,
                              value - 1
                            )
                        )
                      }
                    >
                      <Minus size={17} />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={
                        selectedMedicine.availableStock
                      }
                      value={
                        medicineQuantity
                      }
                      onChange={(event) =>
                        setMedicineQuantity(
                          Math.max(
                            1,
                            Math.min(
                              selectedMedicine.availableStock,
                              Math.floor(
                                normalizeNumber(
                                  event.target
                                    .value
                                )
                              )
                            )
                          )
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMedicineQuantity(
                          (value) =>
                            Math.min(
                              selectedMedicine.availableStock,
                              value + 1
                            )
                        )
                      }
                    >
                      <Plus size={17} />
                    </button>

                  </div>

                </div>

                <div className="modal-price-preview">

                  <span>
                    Total
                  </span>

                  <strong>
                    {formatMoney(
                      selectedMedicine.sellingPrice *
                        medicineQuantity
                    )}
                  </strong>

                </div>

              </div>

              <div className="sales-modal-footer">

                <button
                  className="modal-cancel-button"
                  type="button"
                  onClick={() =>
                    setShowMedicineModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  className="modal-add-button"
                  type="button"
                  onClick={() =>
                    addToCart(
                      selectedMedicine,
                      medicineQuantity
                    )
                  }
                >
                  <ShoppingCart size={17} />
                  Add to Cart
                </button>

              </div>

            </div>

          </div>
        )}

      {/* RECEIPT */}

      {showReceipt &&
        completedSale && (
          <div
            className="receipt-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowReceipt(false);
              }
            }}
          >

            <div className="receipt-modal">

              <div className="receipt-modal-toolbar no-print">

                <div>
                  <strong>
                    Sale Completed
                  </strong>

                  <span>
                    Invoice #
                    {completedSale.invoiceNumber}
                  </span>
                </div>

                <div>

                  <button
                    type="button"
                    onClick={
                      handlePrintReceipt
                    }
                  >
                    <Printer size={16} />
                    Print Receipt
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowReceipt(false)
                    }
                  >
                    <X size={18} />
                  </button>

                </div>

              </div>

              <div className="printable-receipt">

                <div className="receipt-brand">

                  <div className="receipt-logo">
                    <Pill size={22} />
                  </div>

                  <h1>
                    {defaultSalesSettings.pharmacyName}
                  </h1>

                  <p>
                    {defaultSalesSettings.pharmacyAddress}
                  </p>

                  <p>
                    {defaultSalesSettings.pharmacyPhone}
                  </p>

                </div>

                <div className="receipt-title">
                  SALES RECEIPT
                </div>

                <div className="receipt-meta">

                  <div>
                    <span>
                      Invoice
                    </span>

                    <strong>
                      #
                      {
                        completedSale.invoiceNumber
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        completedSale.date
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Time
                    </span>

                    <strong>
                      {formatTime(
                        completedSale.date
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Customer
                    </span>

                    <strong>
                      {
                        completedSale
                          .customer
                          .name
                      }
                    </strong>
                  </div>

                </div>

                <div className="receipt-table">

                  <div className="receipt-table-header">

                    <span>
                      Item
                    </span>

                    <span>
                      Qty
                    </span>

                    <span>
                      Price
                    </span>

                    <span>
                      Total
                    </span>

                  </div>

                  {completedSale.items.map(
                    (item, index) => (
                      <div
                        className="receipt-table-row"
                        key={`${item.id}-${index}`}
                      >

                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <small>
                            Batch:
                            {' '}
                            {item.batchNumber}
                          </small>
                        </div>

                        <span>
                          {item.quantity}
                        </span>

                        <span>
                          {formatMoney(
                            item.unitPrice
                          )}
                        </span>

                        <strong>
                          {formatMoney(
                            item.total
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>

                <div className="receipt-summary">

                  <div>
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatMoney(
                        completedSale.subtotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Discount
                    </span>

                    <strong>
                      -
                      {formatMoney(
                        completedSale.discount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Tax
                      {' '}
                      (
                      {
                        completedSale.taxRate
                      }
                      %)
                    </span>

                    <strong>
                      {formatMoney(
                        completedSale.tax
                      )}
                    </strong>
                  </div>

                  <div className="receipt-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {formatMoney(
                        completedSale.total
                      )}
                    </strong>

                  </div>

                  <div>
                    <span>
                      Payment
                    </span>

                    <strong>
                      {
                        completedSale
                          .paymentMethod
                          .toUpperCase()
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Amount Received
                    </span>

                    <strong>
                      {formatMoney(
                        completedSale.amountReceived
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Change
                    </span>

                    <strong>
                      {formatMoney(
                        completedSale.change
                      )}
                    </strong>
                  </div>

                </div>

                {completedSale.prescription?.required && (
                  <div className="receipt-prescription">

                    <strong>
                      Prescription Information
                    </strong>

                    <span>
                      Prescription:
                      {' '}
                      {
                        completedSale
                          .prescription
                          .number
                      }
                    </span>

                    {completedSale
                      .prescription
                      .notes && (
                      <span>
                        Notes:
                        {' '}
                        {
                          completedSale
                            .prescription
                            .notes
                        }
                      </span>
                    )}

                  </div>
                )}

                <div className="receipt-footer">

                  <strong>
                    Thank you for choosing
                    MediCore Pharmacy
                  </strong>

                  <span>
                    Please keep this receipt
                    for your records.
                  </span>

                  <small>
                    Computer-generated receipt
                  </small>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* PRESCRIPTION WARNING */}

      {showPrescriptionWarning && (
        <div className="sales-modal-overlay">

          <div className="prescription-warning-modal">

            <div className="warning-modal-icon">
              <AlertCircle size={25} />
            </div>

            <h2>
              Prescription Required
            </h2>

            <p>
              One or more medicines in this
              sale require a valid prescription.
              Please enter the prescription
              number before completing the sale.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowPrescriptionWarning(
                  false
                );
              }}
            >
              Continue
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Sales;