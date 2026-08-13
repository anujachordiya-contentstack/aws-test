import { users } from "../../lib/users-store";

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ users });
  }

  if (req.method === "POST") {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    return res.status(201).json({ user: newUser });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
