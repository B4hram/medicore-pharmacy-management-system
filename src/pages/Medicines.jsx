import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  Filter,
  FolderPlus,
  Package,
  Pill,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';

import {
  medicineCategories,
  medicineStatuses,
  medicinesData,
} from '../data/medicinesData';

import '../styles/medicines.css';

const emptyMedicineForm = {
  name: '',
  genericName: '',
  category: '',
  manufacturer: '',
  batchNumber: '',
  barcode: '',
  purchasePrice: '',
  sellingPrice: '',
  stock: '',
  minimumStock: '',
  unit: 'Boxes',
  expiryDate: '',
  supplier: '',
  prescriptionRequired: false,
};

const getMedicineStatus = (stock, minimumStock) => {
  const currentStock = Number(stock) || 0;
  const minimum = Number(minimumStock) || 0;

  if (currentStock <= 0) return 'Out of Stock';
  if (currentStock <= minimum) return 'Low Stock';

  return 'In Stock';
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toFixed(2)}`;
};

const formatDate = (date) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function Medicines() {
  const [medicines, setMedicines] = useState(medicinesData);

  // Categories
  const [categories, setCategories] = useState(
    medicineCategories
  );

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState('All Categories');
  const [statusFilter, setStatusFilter] =
    useState('All Status');

  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('name-asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Medicine modals
  const [selectedMedicine, setSelectedMedicine] =
    useState(null);

  const [medicineToDelete, setMedicineToDelete] =
    useState(null);

  const [showMedicineForm, setShowMedicineForm] =
    useState(false);

  const [editingMedicine, setEditingMedicine] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyMedicineForm);

  const [formErrors, setFormErrors] = useState({});

  // Category management
  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const [newCategory, setNewCategory] =
    useState('');

  const [categoryError, setCategoryError] =
    useState('');

  const [categoryToDelete, setCategoryToDelete] =
    useState(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] =
    useState([]);

  const [showBulkDeleteModal, setShowBulkDeleteModal] =
    useState(false);

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredAndSortedMedicines = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    const filtered = medicines.filter((medicine) => {
      const medicineName =
        medicine.name?.toLowerCase() || '';

      const genericName =
        medicine.genericName?.toLowerCase() || '';

      const batchNumber =
        medicine.batchNumber?.toLowerCase() || '';

      const barcode =
        medicine.barcode?.toLowerCase() || '';

      const matchesSearch =
        !normalizedSearch ||
        medicineName.includes(normalizedSearch) ||
        genericName.includes(normalizedSearch) ||
        batchNumber.includes(normalizedSearch) ||
        barcode.includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === 'All Categories' ||
        medicine.category === categoryFilter;

      const status = getMedicineStatus(
        medicine.stock,
        medicine.minimumStock
      );

      const matchesStatus =
        statusFilter === 'All Status' ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);

        case 'name-desc':
          return b.name.localeCompare(a.name);

        case 'price-low':
          return (
            Number(a.sellingPrice) -
            Number(b.sellingPrice)
          );

        case 'price-high':
          return (
            Number(b.sellingPrice) -
            Number(a.sellingPrice)
          );

        case 'stock-low':
          return (
            Number(a.stock) -
            Number(b.stock)
          );

        case 'stock-high':
          return (
            Number(b.stock) -
            Number(a.stock)
          );

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

        default:
          return 0;
      }
    });
  }, [
    medicines,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortBy,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAndSortedMedicines.length /
        itemsPerPage
    )
  );

  const paginatedMedicines =
    filteredAndSortedMedicines.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    categoryFilter,
    statusFilter,
    sortBy,
    itemsPerPage,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalMedicines = medicines.length;

  const inStockCount = medicines.filter(
    (medicine) =>
      getMedicineStatus(
        medicine.stock,
        medicine.minimumStock
      ) === 'In Stock'
  ).length;

  const lowStockCount = medicines.filter(
    (medicine) =>
      getMedicineStatus(
        medicine.stock,
        medicine.minimumStock
      ) === 'Low Stock'
  ).length;

  const outOfStockCount = medicines.filter(
    (medicine) =>
      getMedicineStatus(
        medicine.stock,
        medicine.minimumStock
      ) === 'Out of Stock'
  ).length;

  // =========================================================
  // FORM
  // =========================================================

  const openAddMedicine = () => {
    setEditingMedicine(null);
    setFormData({
      ...emptyMedicineForm,
      category: categories[0] || '',
    });
    setFormErrors({});
    setShowMedicineForm(true);
  };

  const openEditMedicine = (medicine) => {
    setEditingMedicine(medicine);

    setFormData({
      name: medicine.name || '',
      genericName: medicine.genericName || '',
      category: medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      batchNumber: medicine.batchNumber || '',
      barcode: medicine.barcode || '',
      purchasePrice: medicine.purchasePrice ?? '',
      sellingPrice: medicine.sellingPrice ?? '',
      stock: medicine.stock ?? '',
      minimumStock: medicine.minimumStock ?? '',
      unit: medicine.unit || 'Boxes',
      expiryDate: medicine.expiryDate || '',
      supplier: medicine.supplier || '',
      prescriptionRequired:
        medicine.prescriptionRequired || false,
    });

    setFormErrors({});
    setShowMedicineForm(true);
  };

  const closeMedicineForm = () => {
    setShowMedicineForm(false);
    setEditingMedicine(null);
    setFormData(emptyMedicineForm);
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Medicine name is required.';
    }

    if (!formData.genericName.trim()) {
      errors.genericName =
        'Generic name is required.';
    }

    if (!formData.category) {
      errors.category = 'Category is required.';
    }

    if (!formData.manufacturer.trim()) {
      errors.manufacturer =
        'Manufacturer is required.';
    }

    if (!formData.batchNumber.trim()) {
      errors.batchNumber =
        'Batch number is required.';
    }

    if (
      formData.purchasePrice === '' ||
      Number(formData.purchasePrice) < 0
    ) {
      errors.purchasePrice =
        'Enter a valid purchase price.';
    }

    if (
      formData.sellingPrice === '' ||
      Number(formData.sellingPrice) < 0
    ) {
      errors.sellingPrice =
        'Enter a valid selling price.';
    }

    if (
      Number(formData.sellingPrice) <
      Number(formData.purchasePrice)
    ) {
      errors.sellingPrice =
        'Selling price cannot be lower than purchase price.';
    }

    if (
      formData.stock === '' ||
      Number(formData.stock) < 0
    ) {
      errors.stock = 'Enter a valid stock quantity.';
    }

    if (
      formData.minimumStock === '' ||
      Number(formData.minimumStock) < 0
    ) {
      errors.minimumStock =
        'Enter a valid minimum stock.';
    }

    if (!formData.expiryDate) {
      errors.expiryDate =
        'Expiry date is required.';
    }

    if (!formData.supplier.trim()) {
      errors.supplier =
        'Supplier name is required.';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSaveMedicine = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const medicineStatus = getMedicineStatus(
      Number(formData.stock),
      Number(formData.minimumStock)
    );

    if (editingMedicine) {
      setMedicines((previous) =>
        previous.map((medicine) =>
          medicine.id === editingMedicine.id
            ? {
                ...medicine,
                ...formData,
                purchasePrice: Number(
                  formData.purchasePrice
                ),
                sellingPrice: Number(
                  formData.sellingPrice
                ),
                stock: Number(formData.stock),
                minimumStock: Number(
                  formData.minimumStock
                ),
                status: medicineStatus,
              }
            : medicine
        )
      );
    } else {
      const newMedicine = {
        id: Date.now(),
        ...formData,
        purchasePrice: Number(
          formData.purchasePrice
        ),
        sellingPrice: Number(
          formData.sellingPrice
        ),
        stock: Number(formData.stock),
        minimumStock: Number(
          formData.minimumStock
        ),
        status: medicineStatus,
      };

      setMedicines((previous) => [
        newMedicine,
        ...previous,
      ]);
    }

    closeMedicineForm();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteMedicine = () => {
    if (!medicineToDelete) return;

    setMedicines((previous) =>
      previous.filter(
        (medicine) =>
          medicine.id !== medicineToDelete.id
      )
    );

    setSelectedIds((previous) =>
      previous.filter(
        (id) => id !== medicineToDelete.id
      )
    );

    setMedicineToDelete(null);
  };

  // =========================================================
  // BULK SELECTION
  // =========================================================

  const visibleIds = paginatedMedicines.map(
    (medicine) => medicine.id
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) =>
      selectedIds.includes(id)
    );

  const someVisibleSelected =
    visibleIds.some((id) =>
      selectedIds.includes(id)
    );

  const toggleMedicineSelection = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (selectedId) =>
              selectedId !== id
          )
        : [...previous, id]
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) => !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...visibleIds,
        ]),
      ]);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    setMedicines((previous) =>
      previous.filter(
        (medicine) =>
          !selectedIds.includes(medicine.id)
      )
    );

    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const openCategoryManager = () => {
    setNewCategory('');
    setCategoryError('');
    setShowCategoryManager(true);
  };

  const handleAddCategory = (event) => {
    event.preventDefault();

    const trimmedCategory =
      newCategory.trim();

    if (!trimmedCategory) {
      setCategoryError(
        'Please enter a category name.'
      );
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.toLowerCase() ===
        trimmedCategory.toLowerCase()
    );

    if (alreadyExists) {
      setCategoryError(
        'This category already exists.'
      );
      return;
    }

    setCategories((previous) => [
      ...previous,
      trimmedCategory,
    ]);

    setNewCategory('');
    setCategoryError('');
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    const categoryInUse = medicines.some(
      (medicine) =>
        medicine.category ===
        categoryToDelete
    );

    if (categoryInUse) {
      setCategoryError(
        `Cannot delete "${categoryToDelete}" because medicines are using this category.`
      );

      setCategoryToDelete(null);
      return;
    }

    setCategories((previous) =>
      previous.filter(
        (category) =>
          category !== categoryToDelete
      )
    );

    if (
      categoryFilter === categoryToDelete
    ) {
      setCategoryFilter('All Categories');
    }

    setCategoryToDelete(null);
    setCategoryError('');
  };

// =========================================================
// EXPORT + PRINT
// =========================================================

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? '');

  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const exportMedicinesToCSV = () => {
  if (filteredAndSortedMedicines.length === 0) {
    return;
  }

  const headers = [
    'Medicine Name',
    'Generic Name',
    'Category',
    'Manufacturer',
    'Batch Number',
    'Barcode',
    'Purchase Price',
    'Selling Price',
    'Stock',
    'Minimum Stock',
    'Unit',
    'Expiry Date',
    'Supplier',
    'Prescription Required',
    'Status',
  ];

  const rows = filteredAndSortedMedicines.map(
    (medicine) => [
      medicine.name,
      medicine.genericName,
      medicine.category,
      medicine.manufacturer,
      medicine.batchNumber,
      medicine.barcode || '',
      medicine.purchasePrice,
      medicine.sellingPrice,
      medicine.stock,
      medicine.minimumStock,
      medicine.unit,
      medicine.expiryDate,
      medicine.supplier,
      medicine.prescriptionRequired
        ? 'Yes'
        : 'No',
      getMedicineStatus(
        medicine.stock,
        medicine.minimumStock
      ),
    ]
  );

  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) =>
      row.map(escapeCsvValue).join(',')
    ),
  ].join('\n');

  const blob = new Blob(
    [csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;

  const date = new Date()
    .toISOString()
    .split('T')[0];

  link.download = `medicines-${date}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const printMedicines = () => {
  window.print();
};


  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All Categories');
    setStatusFilter('All Status');
    setSortBy('name-asc');
    setCurrentPage(1);
  };

  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="medicines-page">
      <PageHeader
        title="Medicine Management"
        description="Manage medicines, categories, stock information, pricing and expiry dates."
        action={
          <div className="page-header-actions">
            <button
              className="secondary-button"
              onClick={openCategoryManager}
            >
              <FolderPlus size={17} />
              Manage Categories
            </button>

            <button
              className="primary-button"
              onClick={openAddMedicine}
            >
              <Plus size={18} />
              Add Medicine
            </button>
          </div>
        }
      />

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="medicine-summary-grid">
        <div className="medicine-summary-card">
          <div className="medicine-summary-icon blue">
            <Pill size={22} />
          </div>

          <div>
            <span>Total Medicines</span>
            <strong>{totalMedicines}</strong>
          </div>
        </div>

        <div className="medicine-summary-card">
          <div className="medicine-summary-icon green">
            <Package size={22} />
          </div>

          <div>
            <span>In Stock</span>
            <strong>{inStockCount}</strong>
          </div>
        </div>

        <div className="medicine-summary-card">
          <div className="medicine-summary-icon orange">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStockCount}</strong>
          </div>
        </div>

        <div className="medicine-summary-card">
          <div className="medicine-summary-icon red">
            <Package size={22} />
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{outOfStockCount}</strong>
          </div>
        </div>
      </div>

     {/* =====================================================
    TOOLBAR
===================================================== */}

<div className="medicine-toolbar">
  <div className="medicine-search">
    <Search size={18} />

    <input
      type="text"
      placeholder="Search medicine, generic name, batch or barcode..."
      value={searchTerm}
      onChange={(event) =>
        setSearchTerm(event.target.value)
      }
    />

    {searchTerm && (
      <button
        className="search-clear"
        onClick={() =>
          setSearchTerm('')
        }
      >
        <X size={16} />
      </button>
    )}
  </div>

  <div className="medicine-toolbar-actions">
    <button
      className="toolbar-action-button export-button"
      onClick={exportMedicinesToCSV}
      disabled={
        filteredAndSortedMedicines.length === 0
      }
      title="Export medicine list to CSV"
    >
      <FileSpreadsheet size={17} />
      Export CSV
    </button>

    <button
      className="toolbar-action-button print-button"
      onClick={printMedicines}
      disabled={
        filteredAndSortedMedicines.length === 0
      }
      title="Print medicine list"
    >
      <Printer size={17} />
      Print
    </button>

    <button
      className={`filter-button ${
        showFilters ? 'active' : ''
      }`}
      onClick={() =>
        setShowFilters(
          (previous) => !previous
        )
      }
    >
      <SlidersHorizontal size={17} />

      Filters

      <ChevronDown
        size={16}
        className={
          showFilters
            ? 'rotate-icon'
            : ''
        }
      />
    </button>
  </div>
</div>

      {/* =====================================================
          ADVANCED FILTERS
      ===================================================== */}

      {showFilters && (
        <div className="advanced-medicine-filters">
          <div className="filter-group">
            <label>
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
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
          </div>

          <div className="filter-group">
            <label>
              Stock Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option>
                All Status
              </option>

              {medicineStatuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="filter-group">
            <label>
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="name-asc">
                Name: A → Z
              </option>

              <option value="name-desc">
                Name: Z → A
              </option>

              <option value="price-low">
                Price: Low → High
              </option>

              <option value="price-high">
                Price: High → Low
              </option>

              <option value="stock-low">
                Stock: Low → High
              </option>

              <option value="stock-high">
                Stock: High → Low
              </option>

              <option value="expiry-soon">
                Expiry: Soonest
              </option>

              <option value="expiry-latest">
                Expiry: Latest
              </option>
            </select>
          </div>

          <button
            className="reset-filters-button"
            onClick={resetFilters}
          >
            <Filter size={15} />
            Reset All
          </button>
        </div>
      )}

      {/* =====================================================
          BULK ACTION BAR
      ===================================================== */}

      {selectedIds.length > 0 && (
        <div className="bulk-action-bar">
          <div className="bulk-selection-info">
            <div className="bulk-selection-icon">
              <Users size={17} />
            </div>

            <div>
              <strong>
                {selectedIds.length} medicine
                {selectedIds.length !== 1
                  ? 's'
                  : ''}{' '}
                selected
              </strong>

              <span>
                Choose an action to continue.
              </span>
            </div>
          </div>

          <div className="bulk-actions">
            <button
              className="bulk-cancel-button"
              onClick={clearSelection}
            >
              Clear Selection
            </button>

            <button
              className="bulk-delete-button"
              onClick={() =>
                setShowBulkDeleteModal(true)
              }
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          RESULTS BAR
      ===================================================== */}

      <div className="medicine-results-bar">
        <div>
          Showing{' '}
          <strong>
            {filteredAndSortedMedicines.length}
          </strong>{' '}
          medicine
          {filteredAndSortedMedicines.length !==
          1
            ? 's'
            : ''}
        </div>

        {(searchTerm ||
          categoryFilter !==
            'All Categories' ||
          statusFilter !== 'All Status') && (
          <button
            className="clear-results-button"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="dashboard-card medicine-table-card">
        <div className="medicine-print-header">
  <div>
    <h1>MediCore Pharmacy</h1>
    <h2>Medicine Inventory Report</h2>
    <p>
      Generated on{' '}
      {new Date().toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )}
    </p>
  </div>

  <div className="medicine-print-summary">
    <span>
      Total: <strong>{filteredAndSortedMedicines.length}</strong>
    </span>

    <span>
      In Stock:{' '}
      <strong>
        {
          filteredAndSortedMedicines.filter(
            (medicine) =>
              getMedicineStatus(
                medicine.stock,
                medicine.minimumStock
              ) === 'In Stock'
          ).length
        }
      </strong>
    </span>

    <span>
      Low Stock:{' '}
      <strong>
        {
          filteredAndSortedMedicines.filter(
            (medicine) =>
              getMedicineStatus(
                medicine.stock,
                medicine.minimumStock
              ) === 'Low Stock'
          ).length
        }
      </strong>
    </span>

    <span>
      Out of Stock:{' '}
      <strong>
        {
          filteredAndSortedMedicines.filter(
            (medicine) =>
              getMedicineStatus(
                medicine.stock,
                medicine.minimumStock
              ) === 'Out of Stock'
          ).length
        }
      </strong>
    </span>
  </div>
</div>



        <div className="table-container">
          <table className="medicine-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={
                      allVisibleSelected
                    }
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          !allVisibleSelected &&
                          someVisibleSelected;
                      }
                    }}
                    onChange={
                      toggleSelectAllVisible
                    }
                    aria-label="Select all visible medicines"
                  />
                </th>

                <th>Medicine</th>
                <th>Category</th>
                <th>Batch</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Status</th>
                <th className="actions-column">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedMedicines.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="medicine-empty-cell"
                  >
                    <div className="medicine-empty-state">
                      <div className="medicine-empty-icon">
                        <Pill size={28} />
                      </div>

                      <h3>
                        No medicines found
                      </h3>

                      <p>
                        Try changing your
                        search or filters.
                      </p>

                      <button
                        className="secondary-button"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map(
                  (medicine) => {
                    const status =
                      getMedicineStatus(
                        medicine.stock,
                        medicine.minimumStock
                      );

                    return (
                      <tr key={medicine.id}>
                        <td className="checkbox-column">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              medicine.id
                            )}
                            onChange={() =>
                              toggleMedicineSelection(
                                medicine.id
                              )
                            }
                            aria-label={`Select ${medicine.name}`}
                          />
                        </td>

                        <td>
                          <div className="medicine-name-cell">
                            <div className="medicine-icon">
                              <Pill size={18} />
                            </div>

                            <div>
                              <strong>
                                {medicine.name}
                              </strong>

                              <span>
                                {
                                  medicine.genericName
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="category-text">
                            {medicine.category}
                          </span>
                        </td>

                        <td>
                          <span className="batch-number">
                            {medicine.batchNumber}
                          </span>
                        </td>

                        <td>
                          <div className="price-cell">
                            <strong>
                              {formatCurrency(
                                medicine.sellingPrice
                              )}
                            </strong>

                            <span>
                              Buy:{' '}
                              {formatCurrency(
                                medicine.purchasePrice
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="stock-cell">
                            <strong>
                              {medicine.stock}
                            </strong>

                            <span>
                              {medicine.unit}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="expiry-date">
                            {formatDate(
                              medicine.expiryDate
                            )}
                          </span>
                        </td>

                        <td>
                          <StatusBadge
                            status={status}
                          />
                        </td>

                        <td>
                          <div className="medicine-actions">
                            <button
                              className="icon-action view"
                              title="View Details"
                              onClick={() =>
                                setSelectedMedicine(
                                  medicine
                                )
                              }
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className="icon-action edit"
                              title="Edit Medicine"
                              onClick={() =>
                                openEditMedicine(
                                  medicine
                                )
                              }
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              className="icon-action delete"
                              title="Delete Medicine"
                              onClick={() =>
                                setMedicineToDelete(
                                  medicine
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        {filteredAndSortedMedicines.length >
          0 && (
          <div className="medicine-pagination">
            <div className="pagination-info">
              Showing{' '}
              <strong>
                {Math.min(
                  (currentPage - 1) *
                    itemsPerPage +
                    1,
                  filteredAndSortedMedicines.length
                )}
              </strong>{' '}
              to{' '}
              <strong>
                {Math.min(
                  currentPage *
                    itemsPerPage,
                  filteredAndSortedMedicines.length
                )}
              </strong>{' '}
              of{' '}
              <strong>
                {filteredAndSortedMedicines.length}
              </strong>
            </div>

            <div className="pagination-controls">
              <div className="items-per-page">
                <span>Rows:</span>

                <select
                  value={itemsPerPage}
                  onChange={(event) =>
                    setItemsPerPage(
                      Number(event.target.value)
                    )
                  }
                >
                  <option value="5">
                    5
                  </option>

                  <option value="10">
                    10
                  </option>

                  <option value="20">
                    20
                  </option>
                </select>
              </div>

              <button
                className="pagination-arrow"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.max(
                        previous - 1,
                        1
                      )
                  )
                }
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="pagination-pages">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    className={
                      page === currentPage
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-arrow"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.min(
                        previous + 1,
                        totalPages
                      )
                  )
                }
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT MEDICINE MODAL
      ===================================================== */}

      {showMedicineForm && (
        <div className="modal-overlay">
          <div className="medicine-form-modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingMedicine
                    ? 'Edit Medicine'
                    : 'Add New Medicine'}
                </h2>

                <p>
                  {editingMedicine
                    ? 'Update medicine information.'
                    : 'Enter the medicine details below.'}
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={closeMedicineForm}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="medicine-form"
              onSubmit={handleSaveMedicine}
            >
              <div className="form-section">
                <h3>
                  Basic Information
                </h3>

                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      Medicine Name *
                    </label>

                    <input
                      name="name"
                      value={formData.name}
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Amoxicillin 500mg"
                    />

                    {formErrors.name && (
                      <span className="form-error">
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Generic Name *
                    </label>

                    <input
                      name="genericName"
                      value={
                        formData.genericName
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Amoxicillin"
                    />

                    {formErrors.genericName && (
                      <span className="form-error">
                        {
                          formErrors.genericName
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Category *
                    </label>

                    <select
                      name="category"
                      value={
                        formData.category
                      }
                      onChange={
                        handleFormChange
                      }
                    >
                      <option value="">
                        Select category
                      </option>

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

                    {formErrors.category && (
                      <span className="form-error">
                        {
                          formErrors.category
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Manufacturer *
                    </label>

                    <input
                      name="manufacturer"
                      value={
                        formData.manufacturer
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Pfizer"
                    />

                    {formErrors.manufacturer && (
                      <span className="form-error">
                        {
                          formErrors.manufacturer
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Batch Number *
                    </label>

                    <input
                      name="batchNumber"
                      value={
                        formData.batchNumber
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. AMX-2026-01"
                    />

                    {formErrors.batchNumber && (
                      <span className="form-error">
                        {
                          formErrors.batchNumber
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Barcode
                    </label>

                    <input
                      name="barcode"
                      value={
                        formData.barcode
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>
                  Pricing & Inventory
                </h3>

                <div className="form-grid">
                  <div className="form-field">
                    <label>
                      Purchase Price *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="purchasePrice"
                      value={
                        formData.purchasePrice
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0.00"
                    />

                    {formErrors.purchasePrice && (
                      <span className="form-error">
                        {
                          formErrors.purchasePrice
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Selling Price *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="sellingPrice"
                      value={
                        formData.sellingPrice
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0.00"
                    />

                    {formErrors.sellingPrice && (
                      <span className="form-error">
                        {
                          formErrors.sellingPrice
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Stock Quantity *
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={
                        formData.stock
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                    />

                    {formErrors.stock && (
                      <span className="form-error">
                        {formErrors.stock}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Minimum Stock *
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="minimumStock"
                      value={
                        formData.minimumStock
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                    />

                    {formErrors.minimumStock && (
                      <span className="form-error">
                        {
                          formErrors.minimumStock
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label>
                      Unit
                    </label>

                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={
                        handleFormChange
                      }
                    >
                      <option>
                        Boxes
                      </option>
                      <option>
                        Bottles
                      </option>
                      <option>
                        Strips
                      </option>
                      <option>
                        Tablets
                      </option>
                      <option>
                        Capsules
                      </option>
                      <option>
                        Pieces
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>
                      Expiry Date *
                    </label>

                    <input
                      type="date"
                      name="expiryDate"
                      value={
                        formData.expiryDate
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                    {formErrors.expiryDate && (
                      <span className="form-error">
                        {
                          formErrors.expiryDate
                        }
                      </span>
                    )}
                  </div>

                  <div className="form-field full-width">
                    <label>
                      Supplier *
                    </label>

                    <input
                      name="supplier"
                      value={
                        formData.supplier
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter supplier name"
                    />

                    {formErrors.supplier && (
                      <span className="form-error">
                        {
                          formErrors.supplier
                        }
                      </span>
                    )}
                  </div>
                </div>

                <label className="checkbox-form-field">
                  <input
                    type="checkbox"
                    name="prescriptionRequired"
                    checked={
                      formData.prescriptionRequired
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                  <span>
                    Prescription required
                  </span>
                </label>
              </div>

              <div className="medicine-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeMedicineForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingMedicine
                    ? 'Update Medicine'
                    : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VIEW MEDICINE MODAL
      ===================================================== */}

      {selectedMedicine && (
        <div className="modal-overlay">
          <div className="medicine-details-modal">
            <div className="modal-header">
              <div>
                <h2>
                  Medicine Details
                </h2>

                <p>
                  Complete information about
                  this medicine.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={() =>
                  setSelectedMedicine(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="medicine-details-content">
              <div className="medicine-details-title">
                <div className="medicine-details-icon">
                  <Pill size={25} />
                </div>

                <div>
                  <h3>
                    {selectedMedicine.name}
                  </h3>

                  <p>
                    {
                      selectedMedicine.genericName
                    }
                  </p>
                </div>
              </div>

              <div className="medicine-detail-grid">
                <div>
                  <span>Category</span>
                  <strong>
                    {
                      selectedMedicine.category
                    }
                  </strong>
                </div>

                <div>
                  <span>Manufacturer</span>
                  <strong>
                    {
                      selectedMedicine.manufacturer
                    }
                  </strong>
                </div>

                <div>
                  <span>Batch Number</span>
                  <strong>
                    {
                      selectedMedicine.batchNumber
                    }
                  </strong>
                </div>

                <div>
                  <span>Barcode</span>
                  <strong>
                    {
                      selectedMedicine.barcode ||
                      '-'
                    }
                  </strong>
                </div>

                <div>
                  <span>Purchase Price</span>
                  <strong>
                    {formatCurrency(
                      selectedMedicine.purchasePrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>Selling Price</span>
                  <strong>
                    {formatCurrency(
                      selectedMedicine.sellingPrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current Stock</span>
                  <strong>
                    {selectedMedicine.stock}{' '}
                    {selectedMedicine.unit}
                  </strong>
                </div>

                <div>
                  <span>Minimum Stock</span>
                  <strong>
                    {
                      selectedMedicine.minimumStock
                    }{' '}
                    {selectedMedicine.unit}
                  </strong>
                </div>

                <div>
                  <span>Expiry Date</span>
                  <strong>
                    {formatDate(
                      selectedMedicine.expiryDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Supplier</span>
                  <strong>
                    {
                      selectedMedicine.supplier
                    }
                  </strong>
                </div>

                <div>
                  <span>Prescription</span>
                  <strong>
                    {selectedMedicine.prescriptionRequired
                      ? 'Required'
                      : 'Not Required'}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <StatusBadge
                      status={getMedicineStatus(
                        selectedMedicine.stock,
                        selectedMedicine.minimumStock
                      )}
                    />
                  </strong>
                </div>
              </div>
            </div>

            <div className="medicine-details-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedMedicine(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  openEditMedicine(
                    selectedMedicine
                  );
                  setSelectedMedicine(null);
                }}
              >
                <Edit size={16} />
                Edit Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MEDICINE MODAL
      ===================================================== */}

      {medicineToDelete && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-icon danger">
              <Trash2 size={25} />
            </div>

            <h2>
              Delete Medicine?
            </h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>
                {medicineToDelete.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="confirmation-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setMedicineToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={
                  handleDeleteMedicine
                }
              >
                <Trash2 size={16} />
                Delete Medicine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CATEGORY MANAGER MODAL
      ===================================================== */}

      {showCategoryManager && (
        <div className="modal-overlay">
          <div className="category-manager-modal">
            <div className="modal-header">
              <div>
                <h2>
                  Medicine Categories
                </h2>

                <p>
                  Add and manage medicine
                  categories.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={() =>
                  setShowCategoryManager(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="category-add-form"
              onSubmit={handleAddCategory}
            >
              <div className="category-input-wrapper">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) => {
                    setNewCategory(
                      event.target.value
                    );
                    setCategoryError('');
                  }}
                  placeholder="Enter new category"
                />
              </div>

              <button
                type="submit"
                className="primary-button"
              >
                <Plus size={17} />
                Add Category
              </button>
            </form>

            {categoryError && (
              <div className="category-error">
                <AlertTriangle size={16} />
                {categoryError}
              </div>
            )}

            <div className="category-list">
              <div className="category-list-header">
                <span>
                  Categories
                </span>

                <strong>
                  {categories.length}
                </strong>
              </div>

              {categories.map((category) => {
                const medicineCount =
                  medicines.filter(
                    (medicine) =>
                      medicine.category ===
                      category
                  ).length;

                return (
                  <div
                    className="category-list-item"
                    key={category}
                  >
                    <div className="category-list-name">
                      <div className="category-small-icon">
                        <Pill size={15} />
                      </div>

                      <div>
                        <strong>
                          {category}
                        </strong>

                        <span>
                          {medicineCount}{' '}
                          medicine
                          {medicineCount !== 1
                            ? 's'
                            : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      className="category-delete-button"
                      title={
                        medicineCount > 0
                          ? 'Category is in use'
                          : 'Delete category'
                      }
                      disabled={
                        medicineCount > 0
                      }
                      onClick={() =>
                        setCategoryToDelete(
                          category
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="category-manager-footer">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowCategoryManager(false)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CATEGORY MODAL
      ===================================================== */}

      {categoryToDelete && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-icon danger">
              <Trash2 size={25} />
            </div>

            <h2>
              Delete Category?
            </h2>

            <p>
              Are you sure you want to delete
              the category{' '}
              <strong>
                {categoryToDelete}
              </strong>
              ?
            </p>

            <div className="confirmation-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setCategoryToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={
                  handleDeleteCategory
                }
              >
                <Trash2 size={16} />
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BULK DELETE MODAL
      ===================================================== */}

      {showBulkDeleteModal && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-icon danger">
              <Trash2 size={25} />
            </div>

            <h2>
              Delete Selected Medicines?
            </h2>

            <p>
              You selected{' '}
              <strong>
                {selectedIds.length}
              </strong>{' '}
              medicine
              {selectedIds.length !== 1
                ? 's'
                : ''}.
              <br />
              This action cannot be undone.
            </p>

            <div className="confirmation-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowBulkDeleteModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Medicines;