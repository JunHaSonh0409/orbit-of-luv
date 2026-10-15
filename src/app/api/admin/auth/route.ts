import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminPasscode } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode || !verifyAdminPasscode(passcode)) {
      return NextResponse.json(
        { success: false, message: "관리자 인증 패스코드가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // Generate authenticated session token
    const token = `admin_auth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const response = NextResponse.json({
      success: true,
      message: "관리자 인증에 성공했습니다.",
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { success: false, message: "인증 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "관리자 세션이 종료되었습니다.",
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const isValid = Boolean(sessionCookie?.value && sessionCookie.value.startsWith("admin_auth_"));
  return NextResponse.json({ isAuthenticated: isValid });
}
