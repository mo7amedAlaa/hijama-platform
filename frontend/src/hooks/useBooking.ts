// src/hooks/useBooking.ts
import { useState, useCallback } from "react";
import { sessionService, slotService, bookingService } from "../services/api";
import { extractError } from "../api/axios";
import type { TherapySession, Slot, Booking, CreateBookingPayload, GeneratedSlot } from "../types";

// ─── shared state shape ──────────────────────────────────────
interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// ────────────────────────────────────────────────────────────
// useSessions
// ────────────────────────────────────────────────────────────
export function useSessions() {
  const [state, setState] = useState<AsyncState<TherapySession[]>>({
    data: [], loading: false, error: null,
  });

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await sessionService.getAll();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: extractError(err) }));
    }
  }, []);

  return { sessions: state.data, loading: state.loading, error: state.error, fetch };
}

// ────────────────────────────────────────────────────────────
// useSlots
// ────────────────────────────────────────────────────────────
export function useSlots() {
  const [state, setState] = useState<AsyncState<GeneratedSlot[]>>({
    data: [], loading: false, error: null,
  });

  const fetch = useCallback(async (date: string) => {
    if (!date) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await slotService.getByDate(date);
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: extractError(err) }));
    }
  }, []);

  return { slots: state.data, loading: state.loading, error: state.error, fetch };
}

// ────────────────────────────────────────────────────────────
// useCreateBooking
// ────────────────────────────────────────────────────────────
export function useCreateBooking() {
  const [state, setState] = useState<AsyncState<Booking | null>>({
    data: null, loading: false, error: null,
  });

  const create = useCallback(async (payload: CreateBookingPayload): Promise<Booking> => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await bookingService.create(payload);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const msg = extractError(err);
      setState(s => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  return { booking: state.data, loading: state.loading, error: state.error, create };
}

// ────────────────────────────────────────────────────────────
// useMyBookings
// ────────────────────────────────────────────────────────────
export function useMyBookings() {
  const [state, setState] = useState<AsyncState<Booking[]>>({
    data: [], loading: false, error: null,
  });

  const fetch = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await bookingService.getMine();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: extractError(err) }));
    }
  }, []);

  const cancel = useCallback(async (id: number) => {
    await bookingService.cancel(id);
    setState(s => ({ ...s, data: s.data.filter(b => b.id !== id) }));
  }, []);

  return { bookings: state.data, loading: state.loading, error: state.error, fetch, cancel };
}

// ────────────────────────────────────────────────────────────
// useShowBooking
// ────────────────────────────────────────────────────────────
export function useShowBooking() {
  const [state, setState] = useState<AsyncState<Booking | null>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetch = useCallback(async (id: number) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const { data } = await bookingService.getOne(id);

      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: extractError(err),
      }));
    }
  }, []);

  return {
    booking: state.data,
    loading: state.loading,
    error: state.error,
    fetch,
  };
}