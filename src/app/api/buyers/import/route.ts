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
    for (const b of rows) {
      if (!b.company_name) { skipped++; continue; }
      const buyerId = b.buyer_id || `BUY-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      try {
        const r = await sql`
          INSERT INTO buyers (buyer_id,company_name,country,contact_person,email,phone,website,linkedin,category,status,notes)
          VALUES (${buyerId},${b.company_name},${b.country||null},${b.contact_person||null},${b.email||null},${b.phone||null},${b.website||null},${b.linkedin||null},${b.category||null},${b.status||'Active'},${b.notes||null})
          ON CONFLICT (buyer_id) DO UPDATE SET company_name=EXCLUDED.company_name, country=EXCLUDED.country, contact_person=EXCLUDED.contact_person, email=EXCLUDED.email, phone=EXCLUDED.phone, category=EXCLUDED.category, status=EXCLUDED.status
          RETURNING *`;
        results.push(r[0]);
      } catch { skipped++; }
    }
    return NextResponse.json({ imported: results.length, skipped, rows: results }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
