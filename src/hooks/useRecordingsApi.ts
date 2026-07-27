import { useCallback, useEffect, useState } from 'react';
import { api, type RecordingRow } from '../lib/api';
import { useAuth } from './useAuth';

export function useRecordingsApi() {
  const { isSignedIn } = useAuth();
  const [recordings, setRecordings] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setRecordings([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.listRecordings({ limit: 50 });
      setRecordings(res.recordings || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load recordings.');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { recordings, loading, error, refresh, isSignedIn };
}
