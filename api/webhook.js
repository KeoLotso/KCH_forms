import formidable from 'formidable';
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm({ multiples: true });
  
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Failed to parse form data" });

    const { type } = fields;
    const answers = JSON.parse(fields.answers);
    const images = files.images || [];

    let webhookUrl;
    switch (type) {
      case "custom_channel": webhookUrl = process.env.CUSTOM_CHANNEL; break;
      case "ban_appeal": webhookUrl = process.env.BAN_APPEAL; break;
      case "mod_app": webhookUrl = process.env.MOD_APPLICATION; break;
      default: return res.status(400).json({ error: "Invalid type" });
    }

    const formData = new FormData();
    const embed = {
      title: `${type.replace("_", " ").toUpperCase()} Submission`,
      fields: Object.entries(answers).map(([k, v]) => ({ 
        name: k, 
        value: String(v).slice(0, 1024) 
      })),
      timestamp: new Date().toISOString()
    };

    formData.append("payload_json", JSON.stringify({
      embeds: [embed]
    }));

    if (Array.isArray(images)) {
      images.forEach((image, i) => {
        formData.append(`file${i}`, image);
      });
    }

    await fetch(webhookUrl, {
      method: "POST",
      body: formData
    });

    res.json({ ok: true });
  });
}
