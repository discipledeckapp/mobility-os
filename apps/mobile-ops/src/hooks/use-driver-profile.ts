import { useCallback, useEffect, useState } from 'react';
import { type DriverRecord, getDriverProfile } from '../api';

export function useDriverProfile(enabled = true) {
  const [driver, setDriver] = useState<DriverRecord | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);

  const loadDriver = useCallback(async () => {
    if (!enabled) {
      setDriver(null);
      return null;
    }

    const record = await getDriverProfile();
    setDriver(record);
    return record;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    loadDriver()
      .catch(() => {
        // Screen owns visible error handling.
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled, loadDriver]);

  const refreshDriver = useCallback(async () => {
    setRefreshing(true);
    try {
      return await loadDriver();
    } finally {
      setRefreshing(false);
    }
  }, [loadDriver]);

  return {
    driver,
    loading,
    refreshing,
    refreshDriver,
  };
}
