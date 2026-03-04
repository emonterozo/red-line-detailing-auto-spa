import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;

  // No auth header or invalid format → prompt
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
    });
  }

  const base64 = authHeader.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64").toString().split(":");

  // Wrong credentials → prompt again
  if (user !== username || pass !== password) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
    });
  }

  return NextResponse.next();
}

// Apply to all /admin routes
export const config = {
  matcher: "/admin/:path*",
};