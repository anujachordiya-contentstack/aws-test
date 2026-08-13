import { useState } from "react";

export async function getServerSideProps({ req }) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const res = await fetch(`${protocol}://${req.headers.host}/api/users`);
  const data = await res.json();

  return {
    props: {
      users: data.users || [],
    },
  };
}

export default function Home({ users }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setStatus(res.ok ? data.message : data.error);
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Next.js SSR App</h1>

      <section>
        <h2>Users (server-rendered)</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.name} — {u.email}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <button type="submit">Send</button>
        </form>
        {status && <p>{status}</p>}
      </section>
    </main>
  );
}
