import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ maintenance: false });
    }

    return NextResponse.json({ maintenance: settings.maintenance_mode });
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}

export async function POST(request: Request) {
  try {
    const { maintenance } = await request.json();
    
    let settings = await prisma.globalSettings.findFirst();
    if (settings) {
      await prisma.globalSettings.update({
        where: { id: settings.id },
        data: { maintenance_mode: maintenance }
      });
    } else {
      await prisma.globalSettings.create({
        data: { maintenance_mode: maintenance }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
