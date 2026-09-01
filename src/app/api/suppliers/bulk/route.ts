import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const runtime = "nodejs";
function getDb() { return neon(process.env.DATABASE_URL!); }

export async function DELETE(req: NextRequest) {
  try {
    const sql = getDb();
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ error: "No ids provided" }, { status: 400 });
    await sql`DELETE FROM suppliers WHERE id = ANY(${ids}::uuid[])`;
    return NextResponse.json({ deleted: ids.length });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const sql = getDb();
    const { ids, score } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ error: "Missing ids" }, { status: 400 });
    const rows = await sql`UPDATE suppliers SET reliability_score=${score||80}, updated_at=NOW() WHERE id = ANY(${ids}::uuid[]) RETURNING *`;
    return NextResponse.json({ updated: rows.length, rows });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
