import { NextRequest, NextResponse } from "next/server";

const FALLBACK_TITLE = "VIDEO PROJECT";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("id");

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ title: FALLBACK_TITLE }, { status: 400 });
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const response = await fetch(endpoint, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json({ title: FALLBACK_TITLE });
    }

    const data = (await response.json()) as { title?: unknown };
    const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : FALLBACK_TITLE;
    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: FALLBACK_TITLE });
  }
}
