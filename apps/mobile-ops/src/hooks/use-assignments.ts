import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AssignmentRecord } from '../api';
import {
  type AssignmentFilter,
  fetchAssignments,
  filterAssignments,
  groupAssignments,
} from '../services/assignment-service';

export function useAssignments(enabled = true) {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<AssignmentFilter>('all');

  const loadAssignments = useCallback(async () => {
    if (!enabled) {
      setAssignments([]);
      return [];
    }

    const records = await fetchAssignments();
    setAssignments(records);
    return records;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    loadAssignments()
      .catch(() => {
        // Screen surfaces explicit fetch errors when refreshed or acted on.
      })
      .finally(() => {
        setLoading(false);
      });
  }, [enabled, loadAssignments]);

  const refreshAssignments = useCallback(async () => {
    if (!enabled) {
      setAssignments([]);
      return [];
    }

    setRefreshing(true);
    try {
      return await loadAssignments();
    } finally {
      setRefreshing(false);
    }
  }, [enabled, loadAssignments]);

  const visibleAssignments = useMemo(
    () => filterAssignments(assignments, filter, searchQuery),
    [assignments, filter, searchQuery],
  );

  const groupedAssignments = useMemo(
    () => groupAssignments(visibleAssignments),
    [visibleAssignments],
  );

  return {
    assignments,
    groupedAssignments,
    loading,
    refreshing,
    searchQuery,
    filter,
    setSearchQuery,
    setFilter,
    refreshAssignments,
    reloadAssignments: loadAssignments,
  };
}
