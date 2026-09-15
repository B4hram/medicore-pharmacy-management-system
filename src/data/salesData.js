export const paymentMethods = [
  {
    id: 'cash',
    label: 'Cash',
    description: 'Customer pays with cash',
  },
  {
    id: 'card',
    label: 'Card',
    description: 'Debit or credit card',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other payment method',
  },
];

export const demoCustomers = [
  {
    id: 'customer-001',
    name: 'Ahmad Rahimi',
    phone: '+93 700 123 456',
    email: 'ahmad@example.com',
  },
  {
    id: 'customer-002',
    name: 'Fatima Ahmadi',
    phone: '+93 701 234 567',
    email: 'fatima@example.com',
  },
  {
    id: 'customer-003',
    name: 'Mohammad Khan',
    phone: '+93 702 345 678',
    email: 'mohammad@example.com',
  },
  {
    id: 'customer-004',
    name: 'Sara Noori',
    phone: '+93 703 456 789',
    email: 'sara@example.com',
  },
];

export const defaultSalesSettings = {
  taxRate: 5,
  currency: '$',
  pharmacyName: 'MediCore Pharmacy',
  pharmacyAddress: 'Main Street, Kabul, Afghanistan',
  pharmacyPhone: '+93 700 000 000',
};

export const getNextInvoiceNumber = () => {
  const current = localStorage.getItem('medicore_invoice_number');

  const nextNumber = current
    ? Number(current) + 1
    : 10483;

  localStorage.setItem(
    'medicore_invoice_number',
    String(nextNumber)
  );

  return `INV-${nextNumber}`;
};