// types.ts

export interface Personnel {
  id: string;
  name: string;
  rank?: string;
  division: string;
  affiliation: string;
}

export interface YearPlan {
  id: string;
  title: string;
  division: string;
  startDate: string;   // ISO date string "YYYY-MM-DD"
  endDate: string;     // ISO date string "YYYY-MM-DD"
  location: string;
  type: "จัดจริง" | "บริหาร";
}

export interface BookingLog {
  id: string;
  personnelId: string;
  eventId: string;
  monthYear: string;   // "YYYY-MM"
  timestamp: string;   // ISO datetime — always set on creation
}

export interface DutyRoster {
  id: string;
  personnelId: string;
  monthYear: string;   // "YYYY-MM"
  status: string;
  date?: string;       // "YYYY-MM-DD" — specific date if applicable
}

// ── Division Registry ────────────────────────────────────────

export interface DivisionInfo {
  name: string;
  code: string;
}

export const DIVISIONS: DivisionInfo[] = [
  { name: "สำนักผู้บังคับบัญชา",     code: "X7mP29Qa" },
  { name: "กกล.กพ.ทหาร",             code: "N4vK81Zt" },
  { name: "กบพ.กพ.ทหาร",             code: "R8cJ52Wx" },
  { name: "กปค.กพ.ทหาร",             code: "T1qL96Hp" },
  { name: "กจก.กพ.ทหาร",             code: "B5yD73Mn" },
  { name: "กพบท.กพ.ทหาร",            code: "F2uR48Ks" },
  { name: "กพพ.กพ.ทหาร",             code: "G9hV15Cx" },
  { name: "กนผ.สนผพ.กพ.ทหาร",        code: "J6nT84Pb" },
  { name: "กทด.สนผพ.กพ.ทหาร",        code: "Q3wE27Lf" },
  { name: "กคง.สนผพ.กพ.ทหาร",        code: "Z8xM61Yr" },
  { name: "ฝกพ.ศบท.",                 code: "H4kS92Vu" },
];

// ── Utility: lookup division name by code ────────────────────

export function getDivisionName(code: string): string {
  return DIVISIONS.find((d) => d.code === code)?.name ?? code;
}
