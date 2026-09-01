import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const { rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });

    const results = [];
    let skipped = 0;
    for (const s of rows) {
      if (!s.company_name) { skipped++; continue; }
      const supplierId = s.supplier_id || `SUP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const cats = Array.isArray(s.categories) ? s.categories : (s.categories ? s.categories.split(",").map((x: string) => x.trim()) : []);
      try {
        const r = await sql`
          INSERT INTO suppliers (supplier_id,company_name,location,contact_person,email,phone,moq,lead_time,categories,reliability_score)
          VALUES (${supplierId},${s.company_name},${s.location||null},${s.contact_person||null},${s.email||null},${s.phone||null},${s.moq||null},${s.lead_time||null},${cats},${Number(s.reliability_score)||80})
          ON CONFLICT (supplier_id) DO UPDATE SET company_name=EXCLUDED.company_name, location=EXCLUDED.location, contact_person=EXCLUDED.contact_person, email=EXCLUDED.email, phone=EXCLUDED.phone, moq=EXCLUDED.moq, lead_time=EXCLUDED.lead_time, categories=EXCLUDED.categories, reliability_score=EXCLUDED.reliability_score
          RETURNING *`;
        results.push(r[0]);
      } catch { skipped++; }
    }
    return NextResponse.json({ imported: results.length, skipped, rows: results }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
