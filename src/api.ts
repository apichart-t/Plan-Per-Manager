import { Personnel, YearPlan, BookingLog, DutyRoster } from "./types";

const BASE_URL = "/api";

export const api = {
  getPersonnel: async (): Promise<Personnel[]> => {
    const res = await fetch(`${BASE_URL}/personnel`);
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลกำลังพลได้");
    return res.json();
  },

  getYearPlan: async (): Promise<YearPlan[]> => {
    const res = await fetch(`${BASE_URL}/year-plan`);
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลแผนวาระงานได้");
    return res.json();
  },

  getBookingLog: async (): Promise<BookingLog[]> => {
    const res = await fetch(`${BASE_URL}/booking-log`);
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลประวัติการจัดสรรได้");
    return res.json();
  },

  getDutyRoster: async (): Promise<DutyRoster[]> => {
    const res = await fetch(`${BASE_URL}/duty-roster`);
    if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลเวรประจำเดือนได้");
    return res.json();
  },

  addYearPlan: async (data: Partial<YearPlan>): Promise<YearPlan> => {
    const res = await fetch(`${BASE_URL}/year-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถบันทึกแผนวาระงานได้");
    }
    return res.json();
  },

  updateYearPlan: async (id: string, data: Partial<YearPlan>): Promise<YearPlan> => {
    const res = await fetch(`${BASE_URL}/year-plan/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถแก้ไขแผนงานได้");
    }
    return res.json();
  },

  deleteYearPlan: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/year-plan/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถลบแผนงานได้");
    }
    return res.json();
  },

  addBooking: async (data: { monthYear: string; eventId: string; personnelId: string }): Promise<BookingLog> => {
    const res = await fetch(`${BASE_URL}/booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถจัดสรรรายชื่อได้");
    }
    return res.json();
  },

  deleteBooking: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/booking/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถยกเลิกการจองได้");
    }
    return res.json();
  },
  
  addDutyRoster: async (data: { personnelId: string; monthYear: string; status: string }): Promise<DutyRoster> => {
    const res = await fetch(`${BASE_URL}/duty-roster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถบันทึกข้อมูลเวรได้");
    }
    return res.json();
  },

  deleteDutyRoster: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/duty-roster/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถลบข้อมูลเวรได้");
    }
    return res.json();
  },
  
  deletePersonnel: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/personnel/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "ไม่สามารถลบข้อมูลกำลังพลได้");
    }
    return res.json();
  },
};
