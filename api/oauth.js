import fetch from "node-fetch";

export default async function handler(req, res) {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;
  const redirectUri = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/oauth`;

  if (req.query.code) {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.query.code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const token = await tokenRes.json();

    if (!token.access_token) return res.status(400).send("OAuth Failed");

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const user = await userRes.json();

    return res.redirect(`/?token=${Buffer.from(JSON.stringify(user)).toString("base64")}`);
  } else {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify",
    });
    return res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  }
}
