// ============================================================
// MotionPrint — useIpc Hook
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import type { DayRecord, DayStats, RawSample, Settings, RecordingStatus } from '../../shared/types';

export function useIpc() {
  const api = window.motionPrint;

  const [settings, setSettings] = useState<Settings | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({ active: false, paused: false });
  const [todayData, setTodayData] = useState<DayRecord | null>(null);
  const [todayStats, setTodayStats] = useState<DayStats | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [screenDPI, setScreenDPI] = useState(96);

  // Load settings on mount
  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings(s);
      if (!s.firstRun) setPrivacyAccepted(true);
    });
    api.getRecordingStatus().then(setRecordingStatus);
    api.listAvailableDates().then(setAvailableDates);
    api.getScreenDPI().then(setScreenDPI).catch(() => setScreenDPI(96));
  }, []);

  // Subscribe to sample events
  useEffect(() => {
    const unsubSample = api.onNewSample((_sample: RawSample) => {
      // Refresh today's data periodically
    });

    const unsubStats = api.onStatsUpdate((stats: DayStats) => {
      setTodayStats(stats);
    });

    return () => {
      unsubSample();
      unsubStats();
    };
  }, []);

  const refreshToday = useCallback(async () => {
    const data = await api.getTodayData();
    setTodayData(data);
    if (data) setTodayStats(data.stats);
  }, []);

  const refreshDates = useCallback(async () => {
    const dates = await api.listAvailableDates();
    setAvailableDates(dates);
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    await api.updateSettings(partial);
    setSettings((prev) => prev ? { ...prev, ...partial } : prev);
  }, []);

  const acceptPrivacy = useCallback(async () => {
    await api.updateSettings({ firstRun: false });
    setPrivacyAccepted(true);
    await api.startRecording();
  }, []);

  const startRecording = useCallback(async () => {
    await api.startRecording();
    setRecordingStatus({ active: true, paused: false });
  }, []);

  const pauseRecording = useCallback(async () => {
    await api.pauseRecording();
    setRecordingStatus((prev) => ({ ...prev, paused: true }));
  }, []);

  const stopRecording = useCallback(async () => {
    await api.stopRecording();
    setRecordingStatus({ active: false, paused: false });
  }, []);

  const getDayData = useCallback(async (date: string): Promise<DayRecord | null> => {
    return api.getDayData(date);
  }, []);

  const deleteDay = useCallback(async (date: string) => {
    await api.deleteDay(date);
  }, []);

  const clearAll = useCallback(async () => {
    await api.clearAll();
  }, []);

  return {
    settings,
    recordingStatus,
    todayData,
    todayStats,
    availableDates,
    privacyAccepted,
    screenDPI,
    refreshToday,
    refreshDates,
    updateSettings,
    acceptPrivacy,
    startRecording,
    pauseRecording,
    stopRecording,
    getDayData,
    deleteDay,
    clearAll,
  };
}