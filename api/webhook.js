import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { type, answers, user } = req.body;
  let webhookUrl;

  switch (type) {
    case "ban_appeal": webhookUrl = process.env.BAN_APPEAL; break;
    case "custom_channel": webhookUrl = process.env.CUSTOM_CHANNEL; break;
    case "mod_app": webhookUrl = process.env.MOD_APPLICATION; break;
    default: return res.status(400).json({ error: "Invalid type" });
  }

  const embed = {
    title: `${type.replace("_", " ").toUpperCase()} Submission`,
    fields: Object.entries(answers).map(([k, v]) => ({ name: k, value: String(v).slice(0, 1024) })),
    timestamp: new Date().toISOString(),
    author: {
      name: user.global_name || user.username,
      icon_url: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined
    },
    footer: { text: `User ID: ${user.id}` }
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] })
  });

  res.json({ ok: true });
}
