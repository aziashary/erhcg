import React, { createContext, useState, useEffect, useContext } from 'react';

export const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    whatsapp_number: '6281234567890',
    bank_name: 'Bank BCA',
    bank_account: '7361558573',
    bank_holder: 'A.n. Mochamad Azi Ashary'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err);
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
