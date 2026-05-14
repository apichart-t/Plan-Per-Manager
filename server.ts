import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Configuration — ค่าทั้งหมดมาจาก .env เท่านั้น
  const SUPABASE_URL = (process.env.SUPABASE_URL || "https://vrerzcqbydkahojwzfjf.supabase.co/rest/v1/").replace(/\/$/, "").replace(/\/rest\/v1$/, "");
  const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZXJ6Y3FieWRrYWhvand6ZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTI4NjEsImV4cCI6MjA5NDE2ODg2MX0.DYM3WCDFsdi4JK6pHTZQKp-s8sk7musAMQk1NgVKxxU";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY in your .env file.");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // ── API Routes ──────────────────────────────────────────────

  app.get("/api/personnel", async (req, res) => {
    try {
      const { data, error } = await supabase.from("personnel").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      console.error("[Supabase Error] personnel:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลกำลังพลจาก Database ได้" });
    }
  });

  app.get("/api/year-plan", async (req, res) => {
    try {
      const { data, error } = await supabase.from("year_plan").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      console.error("[Supabase Error] year_plan:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลแผนวาระงานจาก Database ได้" });
    }
  });

  app.post("/api/year-plan", async (req, res) => {
    try {
      const { data, error } = await supabase.from("year_plan").insert([req.body]).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Add year_plan:", err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถบันทึกแผนวาระงานลง Database ได้" });
    }
  });

  app.put("/api/year-plan/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from("year_plan").update(req.body).eq("id", req.params.id).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Update year_plan:", err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถแก้ไขแผนงานได้" });
    }
  });

  app.delete("/api/year-plan/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[API] Attempting to delete YearPlan: ${id}`);
    try {
      // Clean up related bookings first to avoid foreign key constraints
      const { data: bData, error: bError } = await supabase.from("BookingLog").delete().eq("eventId", id).select();
      if (bError) console.warn(`[Supabase Warning] Delete related BookingLog for event ${id}:`, bError.message);
      else console.log(`[API] Cleaned up ${bData?.length || 0} related bookings for event ${id}`);
      
      const { data, error, count } = await supabase.from("year_plan").delete().eq("id", id).select();
      
      if (error) {
        console.error(`[Supabase Error] Delete year_plan ${id}:`, error.message);
        throw error;
      }
      
      console.log(`[API] Successfully deleted YearPlan: ${id}`, data);
      res.json({ status: "success", deleted: data });
    } catch (err: any) {
      console.error(`[Server Error] Delete year_plan ${id}:`, err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถลบแผนงานใน Database ได้" });
    }
  });

  app.get("/api/booking-log", async (req, res) => {
    try {
      const { data, error } = await supabase.from("BookingLog").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      console.error("[Supabase Error] BookingLog:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลประวัติการจัดสรรจาก Database ได้" });
    }
  });

  app.get("/api/duty-roster", async (req, res) => {
    try {
      const { data, error } = await supabase.from("DutyRoster").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      console.error("[Supabase Error] DutyRoster:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเวรประจำเดือนจาก Database ได้" });
    }
  });

  app.post("/api/booking", async (req, res) => {
    try {
      const { data, error } = await supabase.from("BookingLog").insert([req.body]).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Add BookingLog:", err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถเพิ่มข้อมูลการจัดสรรลง Database ได้" });
    }
  });

  app.delete("/api/booking/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[API] Attempting to delete Booking: ${id}`);
    try {
      const { data, error } = await supabase.from("BookingLog").delete().eq("id", id).select();
      if (error) {
        console.error(`[Supabase Error] Delete Booking ${id}:`, error.message);
        throw error;
      }
      console.log(`[API] Successfully deleted Booking: ${id}`, data);
      res.json({ status: "success", deleted: data });
    } catch (err: any) {
      console.error(`[Server Error] Delete Booking ${id}:`, err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถยกเลิกการจองได้" });
    }
  });

  app.post("/api/duty-roster", async (req, res) => {
    try {
      const { data, error } = await supabase.from("DutyRoster").insert([req.body]).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Add DutyRoster:", err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถบันทึกข้อมูลเวรลง Database ได้" });
    }
  });

  app.delete("/api/duty-roster/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("DutyRoster").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Delete DutyRoster:", err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถลบข้อมูลเวรได้" });
    }
  });

  app.delete("/api/personnel/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Cascade delete bookings and duties for this person
      await supabase.from("BookingLog").delete().eq("personnelId", id);
      await supabase.from("DutyRoster").delete().eq("personnelId", id);
      
      const { error } = await supabase.from("personnel").delete().eq("id", id);
      if (error) throw error;
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Delete personnel:", err.message);
      res.status(500).json({ error: err.message || "ไม่สามารถลบข้อมูลกำลังพลได้" });
    }
  });

  // ── Vite / Static ───────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

startServer();