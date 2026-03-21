import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AssignmentRecord } from '../api';
import {
  type AssignmentFilter,
  fetchAssignments,
  filterAssignments,
  groupAssignments,
} from '../services/assignment-service';

export function useAssignments() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<AssignmentFilter>('all');

  const loadAssignments = useCallback(async () => {
    const records = await fetchAssignments();
    setAssignments(records);
  }, []);

  useEffect(() => {
    loadAssignments()
      .catch(() => {
        // Screen surfaces explicit fetch errors when refreshed or acted on.
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadAssignments]);

  const refreshAssignments = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAssignments();
    } finally {
      setRefreshing(false);
    }
  }, [loadAssignments]);

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
