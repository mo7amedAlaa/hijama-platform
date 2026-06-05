// ─────────────────────────────────────────────────────────────
// src/hooks/useSchedule.ts
// Custom hooks لاستخدام scheduleService في الـ Components
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from "react";
import { scheduleService } from "../services/scheduleService";
import { extractError }    from "../api/axios";
import type {
  WorkSchedule, BlockedSlot, SlotStats, BlockSlotPayload,
} from "../services/scheduleService";

// ── shared async state ─────────────────────────────────────
interface Async<T> { data: T; loading: boolean; error: string | null }

// ──────────────────────────────────────────────────────────
// useWorkSchedule
// يجلب ويحدّث جدول العمل
// ──────────────────────────────────────────────────────────
export function useWorkSchedule() {
  const [state, setState] = useState<Async<WorkSchedule[]>>({
    data: [], loading: false, error: null,
  });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await scheduleService.getWorkSchedule();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: extractError(err) }));
    }
  }, []);

  const save = useCallback(async (schedules: WorkSchedule[]): Promise<boolean> => {
    setSaving(true);
    try {
      const { data } = await scheduleService.updateWorkSchedule(schedules);
      setState(s => ({ ...s, data: data.schedules }));
      return true;
    } catch (err) {
      setState(s => ({ ...s, error: extractError(err) }));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // جلب عند mount
  useEffect(() => { fetch(); }, [fetch]);

  return {
    schedule: state.data,
    loading:  state.loading,
    error:    state.error,
    saving,
    fetch,
    save,
  };
}

// ──────────────────────────────────────────────────────────
// useBlockedSlots
// يجلب + يضيف + يحذف الأوقات المعطلة
// ──────────────────────────────────────────────────────────
export function useBlockedSlots() {
  const [state, setState] = useState<Async<BlockedSlot[]>>({
    data: [], loading: false, error: null,
  });
  const [blocking,   setBlocking]   = useState(false);
  const [unblocking, setUnblocking] = useState<number | null>(null);

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await scheduleService.getBlockedSlots();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: extractError(err) }));
    }
  }, []);

  const block = useCallback(async (payload: BlockSlotPayload): Promise<BlockedSlot | null> => {
    setBlocking(true);
    try {
      const { data } = await scheduleService.blockSlot(payload);
      // أضف للقائمة مباشرة بدون re-fetch
      setState(s => ({ ...s, data: [...s.data, data] }));
      return data;
    } catch (err) {
      setState(s => ({ ...s, error: extractError(err) }));
      return null;
    } finally {
      setBlocking(false);
    }
  }, []);

  const unblock = useCallback(async (id: number): Promise<boolean> => {
    setUnblocking(id);
    try {
      await scheduleService.unblockSlot(id);
      setState(s => ({ ...s, data: s.data.filter(b => b.id !== id) }));
      return true;
    } catch (err) {
      setState(s => ({ ...s, error: extractError(err) }));
      return false;
    } finally {
      setUnblocking(null);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    blocked:    state.data,
    loading:    state.loading,
    error:      state.error,
    blocking,
    unblocking,
    fetch,
    block,
    unblock,
  };
}

// ──────────────────────────────────────────────────────────
// useSlotStats
// إحصائيات سريعة للداشبورد
// ──────────────────────────────────────────────────────────
export function useSlotStats() {
  const [state, setState] = useState<Async<SlotStats | null>>({
    data: null, loading: false, error: null,
  });

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await scheduleService.getStats();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: extractError(err) }));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats: state.data, loading: state.loading, error: state.error, fetch };
}