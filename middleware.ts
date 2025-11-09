import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  '/',
];

const protectedRoutes = ['/dashboard', '/connect', '/settings', '/main'];
// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {



  const path = req.nextUrl.pathname;

  // Check if the current route is one of the protected routes
  const isProtectedRoute = protectedRoutes.some(prefix => path.startsWith(prefix));
  //get the token from the cookies
  const token = req.cookies.get('token')?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/signIn', req.nextUrl));
  }
  if (publicRoutes.includes(path) && token) {
    return NextResponse.redirect(new URL('/main/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}








