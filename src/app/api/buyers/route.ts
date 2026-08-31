import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function GET() {
  try { const sql = getDb(); const rows = await sql`SELECT * FROM buyers ORDER BY created_at DESC`; return NextResponse.json(rows); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const sql = getDb(); const b = await req.json();
    const rows = await sql`INSERT INTO buyers (buyer_id,company_name,country,contact_person,email,phone,website,linkedin,category,status,notes) VALUES (${b.buyer_id},${b.company_name},${b.country},${b.contact_person},${b.email},${b.phone},${b.website||null},${b.linkedin||null},${b.category},${b.status||'Active'},${b.notes||null}) RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
