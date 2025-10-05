import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const realmId = searchParams.get("realmId");

  // TODO: valide 'state' com o valor salvo em cookie/session p/ evitar CSRF
  if (!code || !realmId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3000/api/quickbooks/auth";

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Troca do authorization code por tokens
    const tokenResponse = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri, // DEVE ser idêntico ao usado na autorização e ao cadastrado no portal
      }),
    });

    if (!tokenResponse.ok) {
      const txt = await tokenResponse.text();
      console.error("QB token error:", tokenResponse.status, txt);
      throw new Error("Failed to exchange authorization code");
    }

    const tokens = await tokenResponse.json();

    // Salve tokens no seu DB (não chame http para você mesmo se já está no server)
    // Exemplo:
    // await db.quickbooksConnection.upsert({ realmId, ...tokens });

    // Se quiser manter, prefira URL absoluta baseada no request
    return NextResponse.redirect(new URL("/configuracoes/quickbooks?success=true", request.url));
  } catch (err) {
    console.error("QuickBooks auth error:", err);
    return NextResponse.redirect(new URL("/configuracoes/quickbooks?error=true", request.url));
  }
}
