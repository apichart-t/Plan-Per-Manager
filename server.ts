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
  const PORT = Number(process.env.PORT) || 3000;

  // ── CORS ─────────────────────────────────────────────────────
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.use(express.json());

  // ── Supabase Configuration ────────────────────────────────────
  // ⚠️  ห้าม hardcode credential ใน source code — ใช้ .env เท่านั้น
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY in your .env file."
    );
  }

  // Normalize URL: strip trailing slash and /rest/v1 suffix if accidentally included
  const normalizedUrl = SUPABASE_URL.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
  const supabase = createClient(normalizedUrl, SUPABASE_KEY);

  // ── API Routes ──────────────────────────────────────────────

  // Personnel
  app.get("/api/personnel", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("personnel").select("*").order("name");
      if (error) throw error;
      res.json(data ?? []);
    } catch (err: any) {
      console.error("[Supabase Error] personnel:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลกำลังพลจาก Database ได้" });
    }
  });

  app.delete("/api/personnel/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Cascade delete: bookings → duties → personnel
      await supabase.from("BookingLog").delete().eq("personnelId", id);
      await supabase.from("DutyRoster").delete().eq("personnelId", id);
      const { error } = await supabase.from("personnel").delete().eq("id", id);
      if (error) throw error;
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Delete personnel:", err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถลบข้อมูลกำลังพลได้" });
    }
  });

  // Year Plan
  app.get("/api/year-plan", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("year_plan").select("*").order("startDate");
      if (error) throw error;
      res.json(data ?? []);
    } catch (err: any) {
      console.error("[Supabase Error] year_plan:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลแผนวาระงานจาก Database ได้" });
    }
  });

  app.post("/api/year-plan", async (req, res) => {
    try {
      const { data, error } = await supabase.from("year_plan").insert([req.body]).select();
      if (error) throw error;
      res.status(201).json(data?.[0] ?? { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Add year_plan:", err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถบันทึกแผนวาระงานลง Database ได้" });
    }
  });

  app.put("/api/year-plan/:id", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("year_plan")
        .update(req.body)
        .eq("id", req.params.id)
        .select();
      if (error) throw error;
      res.json(data?.[0] ?? { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Update year_plan:", err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถแก้ไขแผนงานได้" });
    }
  });

  app.delete("/api/year-plan/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[API] Deleting YearPlan: ${id}`);
    try {
      // 1. Clean up related bookings first
      const { data: bData, error: bError } = await supabase
        .from("BookingLog")
        .delete()
        .eq("eventId", id)
        .select();
      if (bError) {
        console.warn(`[Supabase Warning] Could not clean BookingLog for event ${id}:`, bError.message);
      } else {
        console.log(`[API] Cleaned up ${bData?.length ?? 0} related bookings`);
      }

      // 2. Delete the event itself
      const { data, error } = await supabase
        .from("year_plan")
        .delete()
        .eq("id", id)
        .select();

      if (error) throw error;
      console.log(`[API] Deleted YearPlan: ${id}`);
      res.json({ status: "success", deleted: data });
    } catch (err: any) {
      console.error(`[Server Error] Delete year_plan ${id}:`, err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถลบแผนงานใน Database ได้" });
    }
  });

  // Booking Log
  app.get("/api/booking-log", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("BookingLog").select("*").order("timestamp", { ascending: false });
      if (error) throw error;
      res.json(data ?? []);
    } catch (err: any) {
      console.error("[Supabase Error] BookingLog:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลประวัติการจัดสรรจาก Database ได้" });
    }
  });

  app.post("/api/booking", async (req, res) => {
    try {
      // Ensure timestamp is always set
      const payload = {
        ...req.body,
        timestamp: req.body.timestamp ?? new Date().toISOString(),
      };
      const { data, error } = await supabase.from("BookingLog").insert([payload]).select();
      if (error) throw error;
      res.status(201).json(data?.[0] ?? { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Add BookingLog:", err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถเพิ่มข้อมูลการจัดสรรลง Database ได้" });
    }
  });

  app.delete("/api/booking/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[API] Deleting Booking: ${id}`);
    try {
      const { data, error } = await supabase.from("BookingLog").delete().eq("id", id).select();
      if (error) throw error;
      console.log(`[API] Deleted Booking: ${id}`);
      res.json({ status: "success", deleted: data });
    } catch (err: any) {
      console.error(`[Server Error] Delete Booking ${id}:`, err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถยกเลิกการจองได้" });
    }
  });

  // Duty Roster
  app.get("/api/duty-roster", async (_req, res) => {
    try {
      const { data, error } = await supabase.from("DutyRoster").select("*");
      if (error) throw error;
      res.json(data ?? []);
    } catch (err: any) {
      console.error("[Supabase Error] DutyRoster:", err.message);
      res.status(500).json({ error: "ไม่สามารถดึงข้อมูลเวรประจำเดือนจาก Database ได้" });
    }
  });

  app.post("/api/duty-roster", async (req, res) => {
    try {
      const { data, error } = await supabase.from("DutyRoster").insert([req.body]).select();
      if (error) throw error;
      res.status(201).json(data?.[0] ?? { status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Add DutyRoster:", err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถบันทึกข้อมูลเวรลง Database ได้" });
    }
  });

  app.delete("/api/duty-roster/:id", async (req, res) => {
    try {
      const { error } = await supabase.from("DutyRoster").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ status: "success" });
    } catch (err: any) {
      console.error("[Supabase Error] Delete DutyRoster:", err.message);
      res.status(500).json({ error: err.message ?? "ไม่สามารถลบข้อมูลเวรได้" });
    }
  });

  // ── Vite / Static ────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
