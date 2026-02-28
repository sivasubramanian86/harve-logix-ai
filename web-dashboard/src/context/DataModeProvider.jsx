import React, { createContext, useContext, useState, useEffect } from 'react';

const DataModeContext = createContext();

export const DataModeProvider = ({ children }) => {
  const [dataMode, setDataMode] = useState('live');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    // Check environment variable
    const useDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true';
    setDataMode(useDemo ? 'demo' : 'live');
  }, []);

  const updateDataMode = (mode) => {
    setDataMode(mode);
    setLastUpdated(new Date());
  };

  const value = {
    dataMode,
    updateDataMode,
    lastUpdated,
  };

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within DataModeProvider');
  }
  return context;
};
