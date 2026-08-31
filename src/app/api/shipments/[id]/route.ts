import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb(); const { id } = await params; const b = await req.json();
    const rows = await sql`UPDATE shipments SET order_number=${b.order_number||null},freight_type=${b.freight_type},forwarder=${b.forwarder},tracking_number=${b.tracking_number||null},etd=${b.etd||null},eta=${b.eta||null},status=${b.status},origin=${b.origin||null},destination=${b.destination||null} WHERE id=${id} RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const sql = getDb(); const { id } = await params; await sql`DELETE FROM shipments WHERE id=${id}`; return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
