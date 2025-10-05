import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // evita erro de Buffer no Edge

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const realmId = url.searchParams.get("realmId");
  // const state = url.searchParams.get("state"); // TODO: validar CSRF se você salvou em cookie/sessão

  if (!code || !realmId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // 🔐 Se você iniciou com PKCE na /auth, recupere o verifier salvo em cookie:
  const verifier = request.cookies.get("qbo_pkce_verifier")?.value;
  if (!verifier) {
    // Se NÃO estiver usando PKCE, você pode remover este bloco e o campo code_verifier do body
    return NextResponse.json({ error: "Missing PKCE verifier" }, { status: 400 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const redirectUri =
    process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3000/api/quickbooks/callback";

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    // Troca do authorization code por tokens
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,   // deve ser idêntico ao cadastrado na Intuit
      code_verifier: verifier,     // OBRIGATÓRIO se usou PKCE
    });

    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body,
    });

    const raw = await tokenResponse.text();
    if (!tokenResponse.ok) {
      console.error("QB token error:", tokenResponse.status, raw);
      return NextResponse.redirect(new URL("/configuracoes/quickbooks?error=true", request.url));
    }

    const tokens = JSON.parse(raw) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      x_refresh_token_expires_in: number;
      token_type: string;
    };

    // TODO: salve tokens + realmId no seu DB
    // await prisma.quickBooksConnection.upsert({ where:{realmId}, update:{...}, create:{ realmId, ...tokens, ... } })

    const res = NextResponse.redirect(
      new URL("/configuracoes/quickbooks?success=true", request.url)
    );
    // Limpa o cookie do PKCE (se usou)
    res.cookies.delete("qbo_pkce_verifier");
    return res;
  } catch (err) {
    console.error("QuickBooks auth error:", err);
    return NextResponse.redirect(new URL("/configuracoes/quickbooks?error=true", request.url));
  }
}