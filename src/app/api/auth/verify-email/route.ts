import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const verifyToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!verifyToken) {
    return new NextResponse("Verification token not found", { status: 400 });
  }

  if (verifyToken.expires < new Date()) {
    return new NextResponse("Verification token expired", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: verifyToken.identifier },
  });

  if (user?.emailVerified) {
    return new NextResponse("Email already verified", { status: 400 });
  }

  await prisma.user.update({
    where: {
      email: verifyToken.identifier,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  await prisma.verificationToken.delete({
    where: {
      identifier: verifyToken.identifier,
    },
  });

  // TODO handle redirect to login page
  redirect("/?verified=true");
}
