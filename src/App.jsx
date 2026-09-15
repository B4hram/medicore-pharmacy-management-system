import React from 'react';
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';

import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Expiry from './pages/Expiry';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Login from './pages/Login';

import { getAuthSession } from './utils/authStorage';

const ProtectedRoute = ({ children }) => {
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="medicines"
          element={<Medicines />}
        />

        <Route
          path="inventory"
          element={<Inventory />}
        />

        <Route
          path="sales"
          element={<Sales />}
        />

        <Route
          path="customers"
          element={<Customers />}
        />

        <Route
          path="suppliers"
          element={<Suppliers />}
        />

        <Route
          path="purchases"
          element={<Purchases />}
        />

        <Route
          path="expiry"
          element={<Expiry />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="employees"
          element={<Employees />}
        />

        <Route
          path="notifications"
          element={<Notifications />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Route>
    </Routes>
  );
};

export default App;