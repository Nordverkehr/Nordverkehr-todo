import { auth } from "@/auth";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isLandingPage = req.nextUrl.pathname === "/";

  if (isLoginPage || isLandingPage) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
