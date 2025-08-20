export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed")

  const code = req.query.code
  if (!code) return res.status(400).send("Missing code")

  const redirectUri = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/oauth`

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) throw new Error(tokenData.error)

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })

    const user = await userResponse.json()
    if (!userResponse.ok) throw new Error("Failed to get user data")

    const cookieOptions = [
      `user=${encodeURIComponent(JSON.stringify(user))}`,
      'Path=/',
      'Max-Age=604800',
      'SameSite=Lax',
      'Secure'
    ].join('; ')

    res.setHeader('Set-Cookie', cookieOptions)
    res.redirect('/')
  } catch (err) {
    console.error('OAuth Error:', err)
    res.redirect('/?error=auth_failed')
  }
}
