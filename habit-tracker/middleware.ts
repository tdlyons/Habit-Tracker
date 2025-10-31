import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { USER_COOKIE_MAX_AGE_SECONDS, USER_COOKIE_NAME } from "./src/lib/user-cookie";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const sessionCookie = request.cookies.get(USER_COOKIE_NAME);
  if (!sessionCookie) {
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: crypto.randomUUID(),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: USER_COOKIE_MAX_AGE_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
