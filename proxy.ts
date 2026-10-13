import { NextResponse, type NextRequest } from "next/server";
import { canonicalPath } from "@/lib/pinnedRoutes";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const canonical = canonicalPath(pathname);
  if (canonical === pathname) return NextResponse.next();
  return NextResponse.redirect(new URL(`${canonical}${search}`, request.url), 308);
}

export const config = {
  matcher: ["/((?!_next/|api/)(?=.*[A-Z]|.+/$).*)"],
};
