import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIDEO_ENV_KEYS = {
  "giveaway-animated": "CLOUDFLARE_STREAM_GIVEAWAY_ANIMATED_UID",
  skillset: "CLOUDFLARE_STREAM_SKILLSET_UID",
  sinners: "CLOUDFLARE_STREAM_SINNERS_UID",
  lamborghini: "CLOUDFLARE_STREAM_LAMBORGHINI_UID",
  travis: "CLOUDFLARE_STREAM_TRAVIS_UID",
  parallel: "CLOUDFLARE_STREAM_PARALLEL_UID",
} as const;

type VideoKey = keyof typeof VIDEO_ENV_KEYS;

type CloudflareTokenResponse = {
  success: boolean;
  result?: {
    token?: string;
  };
  errors?: Array<{
    message?: string;
  }>;
};

function isVideoKey(value: string): value is VideoKey {
  return Object.prototype.hasOwnProperty.call(VIDEO_ENV_KEYS, value);
}

function noStoreJson(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private, max-age=0",
      Pragma: "no-cache",
    },
  });
}

export async function GET(request: Request) {
  const videoKey = new URL(request.url).searchParams.get("video") ?? "";

  if (!isVideoKey(videoKey)) {
    return noStoreJson({ error: "Unknown video." }, 404);
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  const customerCode = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE;
  const videoUid = process.env[VIDEO_ENV_KEYS[videoKey]];

  if (!accountId || !apiToken || !customerCode || !videoUid) {
    return noStoreJson(
      { error: "Cloudflare Stream is not configured for this video." },
      503,
    );
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 20 * 60;

  try {
    const cloudflareResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/stream/${encodeURIComponent(videoUid)}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exp: expiresAt }),
        cache: "no-store",
      },
    );

    const payload = (await cloudflareResponse.json()) as CloudflareTokenResponse;
    const token = payload.result?.token;

    if (!cloudflareResponse.ok || !payload.success || !token) {
      const message = payload.errors?.[0]?.message ?? "Token creation failed.";
      return noStoreJson({ error: message }, 502);
    }

    const cleanCustomerCode = customerCode
      .replace(/^customer-/i, "")
      .replace(/\.cloudflarestream\.com$/i, "");

    if (!/^[a-zA-Z0-9]+$/.test(cleanCustomerCode)) {
      return noStoreJson({ error: "Invalid Stream customer code." }, 500);
    }

    const iframeUrl =
      `https://customer-${cleanCustomerCode}.cloudflarestream.com/` +
      `${encodeURIComponent(token)}/iframe?preload=metadata&autoplay=false`;

    return noStoreJson({ iframeUrl, expiresAt });
  } catch {
    return noStoreJson({ error: "Unable to create a playback token." }, 502);
  }
}
