import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const hasSession = Boolean(data?.claims);
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = pathname === "/login" || pathname === "/activate-account";

  if (pathname === "/login" && hasSession) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));
    const setCookie = supabaseResponse.headers.get("set-cookie");
    if (setCookie) redirectResponse.headers.set("set-cookie", setCookie);
    return redirectResponse;
  }

  if (!isPublicRoute && !hasSession) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    const setCookie = supabaseResponse.headers.get("set-cookie");
    if (setCookie) redirectResponse.headers.set("set-cookie", setCookie);
    return redirectResponse;
  }

  return supabaseResponse;
};
