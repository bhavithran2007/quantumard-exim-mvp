import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function GET() {
  try { const sql = getDb(); const rows = await sql`SELECT * FROM shipments ORDER BY created_at DESC`; return NextResponse.json(rows); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const sql = getDb(); const b = await req.json();
    const rows = await sql`INSERT INTO shipments (shipment_number,order_number,freight_type,forwarder,tracking_number,etd,eta,status,origin,destination) VALUES (${b.shipment_number},${b.order_number||null},${b.freight_type||'Sea'},${b.forwarder},${b.tracking_number||null},${b.etd||null},${b.eta||null},${b.status||'Booked'},${b.origin||null},${b.destination||null}) RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
