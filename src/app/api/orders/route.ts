import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function GET() {
  try { const sql = getDb(); const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`; return NextResponse.json(rows); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const sql = getDb(); const b = await req.json();
    const rows = await sql`INSERT INTO orders (order_number,client,supplier,product,quantity,unit,order_value,currency,status) VALUES (${b.order_number},${b.client},${b.supplier||null},${b.product},${b.quantity},${b.unit||'pcs'},${b.order_value},${b.currency||'USD'},${b.status||'Confirmed'}) RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
