/**
 * api.ts — Frontend API layer (calls /api/* routes on Express server)
 *
 * ⚠️  ไฟล์นี้เรียก backend Express routes ที่ server.ts สร้างไว้
 *      ไม่ได้เรียก Supabase โดยตรง เพื่อป้องกัน credential รั่วไหล
 */

import { Personnel, YearPlan, BookingLog, DutyRoster } from "./types";

// ── Helper ──────────────────────────────────────────────────────

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error ?? `HTTP ${res.status}: ${res.statusText}`);
  }

  return json as T;
}

// ── API ─────────────────────────────────────────────────────────

export const api = {
  // Personnel
  getPersonnel: (): Promise<Personnel[]> =>
    apiFetch("/api/personnel"),

  deletePersonnel: (id: string): Promise<{ status: string }> =>
    apiFetch(`/api/personnel/${id}`, { method: "DELETE" }),

  // Year Plan
  getYearPlan: (): Promise<YearPlan[]> =>
    apiFetch("/api/year-plan"),

  addYearPlan: (data: Omit<YearPlan, "id">): Promise<YearPlan> =>
    apiFetch("/api/year-plan", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateYearPlan: (id: string, data: Partial<Omit<YearPlan, "id">>): Promise<YearPlan> =>
    apiFetch(`/api/year-plan/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteYearPlan: (id: string): Promise<{ status: string }> =>
    apiFetch(`/api/year-plan/${id}`, { method: "DELETE" }),

  // Booking Log
  getBookingLog: (): Promise<BookingLog[]> =>
    apiFetch("/api/booking-log"),

  addBooking: (data: {
    monthYear: string;
    eventId: string;
    personnelId: string;
  }): Promise<BookingLog> =>
    apiFetch("/api/booking", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(), // ✅ always include timestamp
      }),
    }),

  deleteBooking: (id: string): Promise<{ status: string }> =>
    apiFetch(`/api/booking/${id}`, { method: "DELETE" }),

  // Duty Roster
  getDutyRoster: (): Promise<DutyRoster[]> =>
    apiFetch("/api/duty-roster"),

  addDutyRoster: (data: {
    personnelId: string;
    monthYear: string;
    status: string;
    date?: string;
  }): Promise<DutyRoster> =>
    apiFetch("/api/duty-roster", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteDutyRoster: (id: string): Promise<{ status: string }> =>
    apiFetch(`/api/duty-roster/${id}`, { method: "DELETE" }),
};
