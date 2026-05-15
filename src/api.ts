/**
 * api.ts — Frontend API layer (เชื่อมต่อ Supabase โดยตรงสำหรับรันบน Netlify)
 */

import { createClient } from "@supabase/supabase-js";
import { Personnel, YearPlan, BookingLog, DutyRoster } from "./types";

// ── Supabase Configuration ────────────────────────────────────
// ดึงค่ามาจาก Environment Variables ของ Netlify หรือไฟล์ .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase env variables. Please check Netlify settings.");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// ── API ─────────────────────────────────────────────────────────

export const api = {
  // Personnel
  getPersonnel: async (): Promise<Personnel[]> => {
    const { data, error } = await supabase.from("personnel").select("*").order("name");
    if (error) throw error;
    return data || [];
  },

  deletePersonnel: async (id: string): Promise<{ status: string }> => {
    // ลบข้อมูลที่เกี่ยวข้องกันก่อน (Cascade delete)
    await supabase.from("BookingLog").delete().eq("personnelId", id);
    await supabase.from("DutyRoster").delete().eq("personnelId", id);
    const { error } = await supabase.from("personnel").delete().eq("id", id);
    if (error) throw error;
    return { status: "success" };
  },

  // Year Plan
  getYearPlan: async (): Promise<YearPlan[]> => {
    const { data, error } = await supabase.from("year_plan").select("*").order("startDate");
    if (error) throw error;
    return data || [];
  },

  addYearPlan: async (data: Omit<YearPlan, "id">): Promise<YearPlan> => {
    const { data: result, error } = await supabase.from("year_plan").insert([data]).select();
    if (error) throw error;
    return result?.[0] as YearPlan;
  },

  updateYearPlan: async (id: string, data: Partial<Omit<YearPlan, "id">>): Promise<YearPlan> => {
    const { data: result, error } = await supabase.from("year_plan").update(data).eq("id", id).select();
    if (error) throw error;
    return result?.[0] as YearPlan;
  },

  deleteYearPlan: async (id: string): Promise<{ status: string }> => {
    await supabase.from("BookingLog").delete().eq("eventId", id);
    const { error } = await supabase.from("year_plan").delete().eq("id", id);
    if (error) throw error;
    return { status: "success" };
  },

  // Booking Log
  getBookingLog: async (): Promise<BookingLog[]> => {
    const { data, error } = await supabase.from("BookingLog").select("*").order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  addBooking: async (data: { monthYear: string; eventId: string; personnelId: string }): Promise<BookingLog> => {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    const { data: result, error } = await supabase.from("BookingLog").insert([payload]).select();
    if (error) throw error;
    return result?.[0] as BookingLog;
  },

  deleteBooking: async (id: string): Promise<{ status: string }> => {
    const { error } = await supabase.from("BookingLog").delete().eq("id", id);
    if (error) throw error;
    return { status: "success" };
  },

  // Duty Roster
  getDutyRoster: async (): Promise<DutyRoster[]> => {
    const { data, error } = await supabase.from("DutyRoster").select("*");
    if (error) throw error;
    return data || [];
  },

  addDutyRoster: async (data: { personnelId: string; monthYear: string; status: string; date?: string }): Promise<DutyRoster> => {
    const { data: result, error } = await supabase.from("DutyRoster").insert([data]).select();
    if (error) throw error;
    return result?.[0] as DutyRoster;
  },

  deleteDutyRoster: async (id: string): Promise<{ status: string }> => {
    const { error } = await supabase.from("DutyRoster").delete().eq("id", id);
    if (error) throw error;
    return { status: "success" };
  },
};
