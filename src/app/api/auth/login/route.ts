import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

const DEMO_ACCOUNTS: Record<string, { name: string; role: string }> = {
  "admin@quantumard.com": { name: "Admin User", role: "CEO" },
  "sales@quantumard.com": { name: "Sales User", role: "Sales" },
  "finance@quantumard.com": { name: "Finance User", role: "Finance" },
  "ops@quantumard.com": { name: "Operations User", role: "Operations" },
  "procurement@quantumard.com": { name: "Procurement User", role: "Procurement" },
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Try DB first if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);
        const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        if (users.length > 0) {
          const user = users[0];
          const valid = await bcrypt.compare(password, user.password_hash as string);
          if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
          const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
          const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
          response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60*60*24*7, path: "/" });
          return response;
        }
      } catch {}
    }

    // Demo fallback
    const demoUser = DEMO_ACCOUNTS[email];
    if (demoUser && password === "demo123") {
      const token = jwt.sign({ id: "demo", email, name: demoUser.name, role: demoUser.role }, JWT_SECRET, { expiresIn: "7d" });
      const response = NextResponse.json({ success: true, user: { email, ...demoUser } });
      response.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60*60*24*7, path: "/" });
      return response;
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
