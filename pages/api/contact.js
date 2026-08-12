export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required" });
  }

  return res.status(200).json({
    success: true,
    message: `Thanks ${name}, we received your message.`,
  });
}
