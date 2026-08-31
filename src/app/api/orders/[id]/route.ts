import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb(); const { id } = await params; const b = await req.json();
    const rows = await sql`UPDATE orders SET client=${b.client},supplier=${b.supplier||null},product=${b.product},quantity=${b.quantity},unit=${b.unit},order_value=${b.order_value},currency=${b.currency},status=${b.status},updated_at=NOW() WHERE id=${id} RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const sql = getDb(); const { id } = await params; await sql`DELETE FROM orders WHERE id=${id}`; return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
