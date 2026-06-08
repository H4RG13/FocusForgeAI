import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusApi, analyticsApi } from '@/lib/api/focus';
import { useUIStore } from '@/store/ui.store';
import { useFocusStore } from '@/store/focus.store';

export const FOCUS_KEY = 'focus-sessions';
export const ANALYTICS_KEY = 'analytics';

export function useFocusSessions(page = 1) {
  return useQuery({
    queryKey: [FOCUS_KEY, page],
    queryFn: () => focusApi.getSessions(page),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const startTimer = useFocusStore((s) => s.startSession);

  return useMutation({
    mutationFn: (data: Parameters<typeof focusApi.startSession>[0]) =>
      focusApi.startSession(data),
    onSuccess: (session) => {
      startTimer(session.id, session.duration_minutes ?? 25);
      qc.invalidateQueries({ queryKey: [FOCUS_KEY] });
      addToast({ type: 'success', message: 'Focus session started!' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to start session.' }),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const endTimer = useFocusStore((s) => s.endSession);

  return useMutation({
    mutationFn: (id: number) => focusApi.complete(id),
    onSuccess: () => {
      endTimer();
      qc.invalidateQueries({ queryKey: [FOCUS_KEY] });
      qc.invalidateQueries({ queryKey: [ANALYTICS_KEY] });
      addToast({ type: 'success', message: 'Session completed!' });
    },
    onError: () => addToast({ type: 'error', message: 'Failed to complete session.' }),
  });
}

export function useAbandonSession() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();
  const endTimer = useFocusStore((s) => s.endSession);

  return useMutation({
    mutationFn: (id: number) => focusApi.abandon(id),
    onSuccess: () => {
      endTimer();
      qc.invalidateQueries({ queryKey: [FOCUS_KEY] });
      addToast({ type: 'info', message: 'Session abandoned.' });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: number) => focusApi.deleteSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FOCUS_KEY] });
      addToast({ type: 'success', message: 'Session deleted.' });
    },
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'overview'],
    queryFn: () => analyticsApi.overview(),
  });
}

export function useFocusByDay(days = 30) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'focus', days],
    queryFn: () => analyticsApi.focusByDay(days),
  });
}

export function useTasksByDay(days = 30) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'tasks', days],
    queryFn: () => analyticsApi.tasksByDay(days),
  });
}

export function useHeatmap(weeks = 52) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'heatmap', weeks],
    queryFn: () => analyticsApi.heatmap(weeks),
  });
}
