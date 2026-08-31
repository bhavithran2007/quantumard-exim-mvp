import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function GET() {
  try { const sql = getDb(); const rows = await sql`SELECT * FROM suppliers ORDER BY created_at DESC`; return NextResponse.json(rows); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const sql = getDb(); const b = await req.json();
    const rows = await sql`INSERT INTO suppliers (supplier_id,company_name,location,contact_person,email,phone,moq,lead_time,categories,reliability_score) VALUES (${b.supplier_id},${b.company_name},${b.location||null},${b.contact_person||null},${b.email||null},${b.phone||null},${b.moq||null},${b.lead_time||null},${b.categories||[]},${b.reliability_score||80}) RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
