import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function GET() {
  try { const sql = getDb(); const rows = await sql`SELECT * FROM quotations ORDER BY created_at DESC`; return NextResponse.json(rows); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const sql = getDb(); const b = await req.json();
    const rows = await sql`INSERT INTO quotations (quotation_number,buyer,supplier,product,quantity,unit,cost_price,selling_price,status,rfq_id) VALUES (${b.quotation_number},${b.buyer},${b.supplier||null},${b.product},${b.quantity},${b.unit||'pcs'},${b.cost_price},${b.selling_price},${b.status||'Draft'},${b.rfq_id||null}) RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
