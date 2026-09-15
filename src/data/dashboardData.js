
export const dashboardStats = [
  {
    id: 1,
    title: 'Total Medicines',
    value: '1,248',
    change: '+8.2%',
    description: 'from last month',
    icon: 'pill',
    variant: 'blue',
  },
  {
    id: 2,
    title: 'Inventory Items',
    value: '8,642',
    change: '+5.4%',
    description: 'items currently in stock',
    icon: 'boxes',
    variant: 'green',
  },
  {
    id: 3,
    title: "Today's Sales",
    value: '$4,285',
    change: '+12.6%',
    description: 'from yesterday',
    icon: 'sales',
    variant: 'orange',
  },
  {
    id: 4,
    title: 'Total Customers',
    value: '2,486',
    change: '+7.8%',
    description: 'registered customers',
    icon: 'users',
    variant: 'blue',
  },
];

export const salesData = {
  week: [
    {
      day: 'Mon',
      sales: 2850,
    },
    {
      day: 'Tue',
      sales: 3420,
    },
    {
      day: 'Wed',
      sales: 2980,
    },
    {
      day: 'Thu',
      sales: 3860,
    },
    {
      day: 'Fri',
      sales: 4250,
    },
    {
      day: 'Sat',
      sales: 4820,
    },
    {
      day: 'Sun',
      sales: 4285,
    },
  ],

  month: [
    {
      day: 'Week 1',
      sales: 18450,
    },
    {
      day: 'Week 2',
      sales: 21680,
    },
    {
      day: 'Week 3',
      sales: 19820,
    },
    {
      day: 'Week 4',
      sales: 24680,
    },
  ],

  year: [
    {
      day: 'Jan',
      sales: 68200,
    },
    {
      day: 'Feb',
      sales: 72100,
    },
    {
      day: 'Mar',
      sales: 75800,
    },
    {
      day: 'Apr',
      sales: 81200,
    },
    {
      day: 'May',
      sales: 86400,
    },
    {
      day: 'Jun',
      sales: 92400,
    },
  ],
};

export const lowStockMedicines = [
  {
    id: 1,
    name: 'Amoxicillin 500mg',
    category: 'Antibiotic',
    stock: 8,
    minimumStock: 20,
    unit: 'boxes',
  },
  {
    id: 2,
    name: 'Metformin 500mg',
    category: 'Diabetes',
    stock: 6,
    minimumStock: 25,
    unit: 'boxes',
  },
  {
    id: 3,
    name: 'Omeprazole 20mg',
    category: 'Gastrointestinal',
    stock: 10,
    minimumStock: 30,
    unit: 'boxes',
  },
  {
    id: 4,
    name: 'Azithromycin 250mg',
    category: 'Antibiotic',
    stock: 14,
    minimumStock: 25,
    unit: 'boxes',
  },
  {
    id: 5,
    name: 'Ibuprofen 400mg',
    category: 'Pain Relief',
    stock: 17,
    minimumStock: 35,
    unit: 'boxes',
  },
];

export const expiringMedicines = [
  {
    id: 1,
    name: 'Amoxicillin 250mg',
    batch: 'AMX-2401',
    expiry: '2026-09-18',
    daysLeft: 13,
    quantity: 32,
  },
  {
    id: 2,
    name: 'Cefixime 200mg',
    batch: 'CFX-2405',
    expiry: '2026-09-24',
    daysLeft: 19,
    quantity: 18,
  },
  {
    id: 3,
    name: 'Loratadine 10mg',
    batch: 'LOR-2411',
    expiry: '2026-10-02',
    daysLeft: 27,
    quantity: 45,
  },
  {
    id: 4,
    name: 'Diclofenac 50mg',
    batch: 'DCF-2408',
    expiry: '2026-10-09',
    daysLeft: 34,
    quantity: 21,
  },
];

export const recentSales = [
  {
    id: 1,
    invoice: '#INV-10482',
    customer: 'Ahmad Rahimi',
    items: 4,
    total: '$86.50',
    payment: 'Cash',
    time: '10:42 AM',
    status: 'Completed',
  },
  {
    id: 2,
    invoice: '#INV-10481',
    customer: 'Fatima Ahmadi',
    items: 2,
    total: '$42.00',
    payment: 'Card',
    time: '10:18 AM',
    status: 'Completed',
  },
  {
    id: 3,
    invoice: '#INV-10480',
    customer: 'Mohammad Khan',
    items: 6,
    total: '$124.75',
    payment: 'Cash',
    time: '09:54 AM',
    status: 'Completed',
  },
  {
    id: 4,
    invoice: '#INV-10479',
    customer: 'Sara Noori',
    items: 3,
    total: '$57.25',
    payment: 'Card',
    time: '09:31 AM',
    status: 'Completed',
  },
  {
    id: 5,
    invoice: '#INV-10478',
    customer: 'Omid Ahmad',
    items: 5,
    total: '$98.40',
    payment: 'Cash',
    time: '09:05 AM',
    status: 'Completed',
  },
];

export const recentCustomers = [
  {
    id: 1,
    name: 'Ahmad Rahimi',
    phone: '+93 700 123 456',
    purchases: 18,
    spent: '$486.50',
    lastVisit: 'Today',
  },
  {
    id: 2,
    name: 'Fatima Ahmadi',
    phone: '+93 701 234 567',
    purchases: 12,
    spent: '$328.75',
    lastVisit: 'Today',
  },
  {
    id: 3,
    name: 'Mohammad Khan',
    phone: '+93 702 345 678',
    purchases: 25,
    spent: '$712.20',
    lastVisit: 'Yesterday',
  },
  {
    id: 4,
    name: 'Sara Noori',
    phone: '+93 703 456 789',
    purchases: 9,
    spent: '$218.40',
    lastVisit: 'Yesterday',
  },
];

export const dashboardAlerts = [
  {
    id: 1,
    type: 'danger',
    title: 'Critical Stock Level',
    message: 'Metformin 500mg has only 6 boxes remaining.',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Medicine Expiring Soon',
    message: 'Amoxicillin 250mg expires in 13 days.',
  },
  {
    id: 3,
    type: 'info',
    title: 'Purchase Order Pending',
    message: 'PO-2026-018 is waiting for supplier confirmation.',
  },
];

export const categorySales = [
  {
    category: 'Antibiotics',
    value: 32,
  },
  {
    category: 'Pain Relief',
    value: 24,
  },
  {
    category: 'Vitamins',
    value: 18,
  },
  {
    category: 'Diabetes',
    value: 14,
  },
  {
    category: 'Other',
    value: 12,
  },
];
