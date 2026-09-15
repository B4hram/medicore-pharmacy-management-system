import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';

import { getAuthSession, logoutUser } from '../../utils/authStorage';
import {
  getSettings,
  saveSettings,
} from '../../utils/settingsStorage';

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showMenu, setShowMenu] = useState(false);

  const session = getAuthSession();
  const settings = getSettings();

  const handleLogout = () => {
    logoutUser();

    navigate('/login', {
      replace: true,
    });
  };

  const toggleTheme = () => {
    const newTheme =
      settings.theme === 'dark' ? 'light' : 'dark';

    const updatedSettings = {
      ...settings,
      theme: newTheme,
    };

    saveSettings(updatedSettings);

    document.documentElement.setAttribute(
      'data-theme',
      newTheme
    );

    window.location.reload();
  };

  const pageTitles = {
    '/': 'Dashboard',
    '/medicines': 'Medicines',
    '/inventory': 'Inventory',
    '/sales': 'Sales & POS',
    '/customers': 'Customers',
    '/suppliers': 'Suppliers',
    '/purchases': 'Purchases',
    '/expiry': 'Expiry Tracking',
    '/reports': 'Reports & Analytics',
    '/employees': 'Employees',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>
          {pageTitles[location.pathname] || 'MediCore'}
        </h1>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-icon-button"
          title="Toggle Theme"
          onClick={toggleTheme}
        >
          {settings.theme === 'dark' ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        <button
          className="topbar-icon-button"
          title="Notifications"
          onClick={() =>
            navigate('/notifications')
          }
        >
          <Bell size={19} />
        </button>

        <div className="topbar-user">
          <div className="topbar-user-avatar">
            <UserCircle size={30} />
          </div>

          <div className="topbar-user-info">
            <strong>
              {session?.name || 'MediCore Pharmacist'}
            </strong>

            <span>
              {session?.email || 'staff@medicore.com'}
            </span>
          </div>

          <button
            className="topbar-user-menu-button"
            onClick={() =>
              setShowMenu((previous) => !previous)
            }
          >
            <ChevronDown size={16} />
          </button>

          {showMenu && (
            <div className="topbar-user-menu">
              <button onClick={() => navigate('/settings')}>
                <UserCircle size={16} />
                Settings
              </button>

              <button onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;