import formidable from 'formidable';
import { createReadStream } from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm({ multiples: true });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    try {
      const { type } = fields;
      const answers = JSON.parse(fields.answers);
      const images = Array.isArray(files.images) ? files.images : files.images ? [files.images] : [];

      let webhookUrl;
      switch (type) {
        case "custom_channel": webhookUrl = process.env.CUSTOM_CHANNEL_WEBHOOK; break;
        case "ban_appeal": webhookUrl = process.env.BAN_APPEAL_WEBHOOK; break;
        case "mod_app": webhookUrl = process.env.MOD_APP_WEBHOOK; break;
        default: return res.status(400).json({ error: "Invalid type" });
      }

      const formData = new FormData();
      const embed = {
        title: `New ${type.replace("_", " ").toUpperCase()} Submission`,
        fields: Object.entries(answers).map(([k, v]) => ({ 
          name: k.replace(/_/g, ' ').toUpperCase(), 
          value: String(v).slice(0, 1024) || 'No response'
        })),
        timestamp: new Date().toISOString()
      };

      formData.append("payload_json", JSON.stringify({ embeds: [embed] }));

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const stream = createReadStream(image.filepath);
        formData.append(`file${i}`, stream, {
          filename: image.originalFilename,
          contentType: image.mimetype
        });
      }

      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        body: formData
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook error: ${webhookResponse.status}`);
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
