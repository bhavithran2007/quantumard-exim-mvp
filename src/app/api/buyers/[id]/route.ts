import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb(); const { id } = await params; const b = await req.json();
    const rows = await sql`UPDATE buyers SET company_name=${b.company_name},country=${b.country},contact_person=${b.contact_person},email=${b.email},phone=${b.phone},website=${b.website||null},linkedin=${b.linkedin||null},category=${b.category},status=${b.status},notes=${b.notes||null},updated_at=NOW() WHERE id=${id} RETURNING *`;
    return NextResponse.json(rows[0]);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const sql = getDb(); const { id } = await params; await sql`DELETE FROM buyers WHERE id=${id}`; return NextResponse.json({ success: true }); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
