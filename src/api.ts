import { createClient } from "@supabase/supabase-js";
import { Personnel, YearPlan, BookingLog, DutyRoster } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");

export const api = {
  getPersonnel: async (): Promise<Personnel[]> => {
    const { data, error } = await supabase.from("personnel").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  getYearPlan: async (): Promise<YearPlan[]> => {
    const { data, error } = await supabase.from("year_plan").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  getBookingLog: async (): Promise<BookingLog[]> => {
    const { data, error } = await supabase.from("BookingLog").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  getDutyRoster: async (): Promise<DutyRoster[]> => {
    const { data, error } = await supabase.from("DutyRoster").select("*");
    if (error) throw new Error(error.message);
    return data || [];
  },

  addYearPlan: async (data: Partial<YearPlan>): Promise<YearPlan> => {
    const { data: inserted, error } = await supabase.from("year_plan").insert([data]).select();
    if (error) throw new Error(error.message);
    return inserted[0];
  },

  updateYearPlan: async (id: string, data: Partial<YearPlan>): Promise<YearPlan> => {
    const { data: updated, error } = await supabase.from("year_plan").update(data).eq("id", id).select();
    if (error) throw new Error(error.message);
    return updated[0];
  },

  deleteYearPlan: async (id: string): Promise<any> => {
    // Delete related bookings first
    await supabase.from("BookingLog").delete().eq("eventId", id);
    
    const { data, error } = await supabase.from("year_plan").delete().eq("id", id).select();
    if (error) throw new Error(error.message);
    return data;
  },

  addBooking: async (data: { monthYear: string; eventId: string; personnelId: string }): Promise<BookingLog> => {
    const { data: inserted, error } = await supabase.from("BookingLog").insert([data]).select();
    if (error) throw new Error(error.message);
    return inserted[0];
  },

  deleteBooking: async (id: string): Promise<any> => {
    const { data, error } = await supabase.from("BookingLog").delete().eq("id", id).select();
    if (error) throw new Error(error.message);
    return data;
  },
  
  addDutyRoster: async (data: { personnelId: string; monthYear: string; status: string }): Promise<DutyRoster> => {
    const { data: inserted, error } = await supabase.from("DutyRoster").insert([data]).select();
    if (error) throw new Error(error.message);
    return inserted[0];
  },

  deleteDutyRoster: async (id: string): Promise<any> => {
    const { data, error } = await supabase.from("DutyRoster").delete().eq("id", id).select();
    if (error) throw new Error(error.message);
    return data;
  },
  
  deletePersonnel: async (id: string): Promise<any> => {
    // Cascade delete manually (Supabase could do this if configured, but we keep it safe)
    await supabase.from("BookingLog").delete().eq("personnelId", id);
    await supabase.from("DutyRoster").delete().eq("personnelId", id);
    
    const { data, error } = await supabase.from("personnel").delete().eq("id", id).select();
    if (error) throw new Error(error.message);
    return data;
  },
};
