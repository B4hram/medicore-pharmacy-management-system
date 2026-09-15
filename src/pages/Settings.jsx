import { useState } from 'react';
import {
  Building2,
  Bell,
  Palette,
  Shield,
  Save,
  Moon,
  Sun,
  Check,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';

import '../styles/settings.css';

function Settings() {
  const [activeSection, setActiveSection] =
    useState('general');

  const [darkMode, setDarkMode] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [settings, setSettings] = useState({
    pharmacyName: 'MediCore Pharmacy',
    phone: '+93 700 000 000',
    email: 'info@medicore.com',
    address: 'Kabul, Afghanistan',
    currency: 'USD',
    tax: '0',
    lowStock: true,
    expiryAlerts: true,
    saleNotifications: true,
    emailNotifications: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setSettings((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      'medicore_settings',
      JSON.stringify(settings)
    );

    localStorage.setItem(
      'medicore_dark_mode',
      String(darkMode)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const sections = [
    {
      id: 'general',
      title: 'General',
      icon: Building2,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
    },
  ];

  return (
    <div className="settings-page">
      <PageHeader
        title="Settings"
        subtitle="Configure your pharmacy management system."
      />

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                className={
                  activeSection === section.id
                    ? 'settings-nav active'
                    : 'settings-nav'
                }
                onClick={() =>
                  setActiveSection(
                    section.id
                  )
                }
              >
                <Icon size={17} />
                {section.title}
              </button>
            );
          })}
        </aside>

        <main className="settings-content">
          {activeSection === 'general' && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>
                    Pharmacy Information
                  </h3>

                  <p>
                    Update your pharmacy's basic
                    information.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>
                    Pharmacy Name
                  </label>

                  <input
                    name="pharmacyName"
                    value={
                      settings.pharmacyName
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Phone Number
                  </label>

                  <input
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Currency
                  </label>

                  <select
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                  >
                    <option>
                      USD
                    </option>

                    <option>
                      AFN
                    </option>

                    <option>
                      EUR
                    </option>
                  </select>
                </div>

                <div className="settings-field full">
                  <label>
                    Pharmacy Address
                  </label>

                  <textarea
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="settings-field">
                  <label>
                    Default Tax (%)
                  </label>

                  <input
                    type="number"
                    name="tax"
                    value={settings.tax}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === 'notifications' && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>
                    Notification Settings
                  </h3>

                  <p>
                    Choose which notifications the
                    pharmacy system should display.
                  </p>
                </div>
              </div>

              <div className="settings-options">
                <label className="settings-toggle-row">
                  <div>
                    <strong>
                      Low Stock Alerts
                    </strong>

                    <span>
                      Notify when medicine stock
                      reaches the minimum level.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="lowStock"
                    checked={
                      settings.lowStock
                    }
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>
                      Expiry Alerts
                    </strong>

                    <span>
                      Notify when medicines are
                      approaching their expiry date.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="expiryAlerts"
                    checked={
                      settings.expiryAlerts
                    }
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>
                      Sales Notifications
                    </strong>

                    <span>
                      Display notifications for
                      completed sales.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="saleNotifications"
                    checked={
                      settings.saleNotifications
                    }
                    onChange={handleChange}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>
                      Email Notifications
                    </strong>

                    <span>
                      Enable email-based pharmacy
                      notifications.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={
                      settings.emailNotifications
                    }
                    onChange={handleChange}
                  />
                </label>
              </div>
            </section>
          )}

          {activeSection === 'appearance' && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>
                    Appearance
                  </h3>

                  <p>
                    Customize the visual appearance
                    of the system.
                  </p>
                </div>
              </div>

              <div className="appearance-options">
                <button
                  className={
                    !darkMode
                      ? 'theme-option active'
                      : 'theme-option'
                  }
                  onClick={() =>
                    setDarkMode(false)
                  }
                >
                  <Sun size={25} />

                  <strong>
                    Light Mode
                  </strong>

                  <span>
                    Clean and bright interface
                  </span>

                  {!darkMode && (
                    <Check size={18} />
                  )}
                </button>

                <button
                  className={
                    darkMode
                      ? 'theme-option active'
                      : 'theme-option'
                  }
                  onClick={() =>
                    setDarkMode(true)
                  }
                >
                  <Moon size={25} />

                  <strong>
                    Dark Mode
                  </strong>

                  <span>
                    Comfortable interface for
                    low-light environments
                  </span>

                  {darkMode && (
                    <Check size={18} />
                  )}
                </button>
              </div>

              <div className="settings-info">
                <Palette size={18} />

                <span>
                  Dark mode preference will be
                  saved locally on this device.
                </span>
              </div>
            </section>
          )}

          {activeSection === 'security' && (
            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h3>
                    Security
                  </h3>

                  <p>
                    Manage basic system security
                    settings.
                  </p>
                </div>
              </div>

              <div className="security-card">
                <Shield size={24} />

                <div>
                  <strong>
                    Application Security
                  </strong>

                  <span>
                    Your pharmacy management system
                    uses local session protection for
                    the current application.
                  </span>
                </div>
              </div>

              <div className="security-note">
                <strong>
                  Demo Authentication
                </strong>

                <p>
                  This university project currently
                  uses local demo authentication.
                  Production deployment should use
                  a secure backend authentication
                  service.
                </p>
              </div>
            </section>
          )}

          <div className="settings-save-area">
            {saved && (
              <span className="settings-saved">
                <Check size={15} />
                Settings saved
              </span>
            )}

            <button
              className="settings-save-button"
              onClick={saveSettings}
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;