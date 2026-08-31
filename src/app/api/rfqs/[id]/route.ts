import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb(); const { id } = await params; const b = await req.json();
    const rows = await sql`UPDATE rfqs SET buyer=${b.buyer},product=${b.product},quantity=${b.quantity},unit=${b.unit},specifications=${b.specifications||null},deadline=${b.deadline||null},status=${b.status},assigned_to=${b.assigned_to||null} WHERE id=${id} RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const sql = getDb(); const { id } = await params; await sql`DELETE FROM rfqs WHERE id=${id}`; return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
