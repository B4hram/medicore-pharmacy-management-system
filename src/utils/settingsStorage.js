const SETTINGS_KEY = 'medicore_settings';

export const defaultSettings = {
  pharmacyName: 'MediCore Pharmacy',
  pharmacyPhone: '+93 700 000 000',
  pharmacyEmail: 'info@medicore.com',
  pharmacyAddress: 'Kabul, Afghanistan',

  currency: 'USD',
  taxRate: 0,

  lowStockThreshold: 10,
  expiryAlertDays: 90,

  emailNotifications: true,
  lowStockNotifications: true,
  expiryNotifications: true,

  theme: 'light',
};

export const getSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(defaultSettings)
      );

      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...JSON.parse(saved),
    };
  } catch (error) {
    console.error('Failed to load settings:', error);

    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);

    return false;
  }
};

export const resetSettings = () => {
  try {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(defaultSettings)
    );

    return defaultSettings;
  } catch (error) {
    console.error('Failed to reset settings:', error);

    return defaultSettings;
  }
};