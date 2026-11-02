"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Profile() {
  const router = useRouter();
  const [p, setP] = useState(null);
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [fieldErr, setFieldErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/auth/profile/")
      .then((d) => { setP(d); setPhone(d.phone); })
      .catch((e) => {
        if (e.status === 401) router.replace("/login");
        else setMsg({ type: "error", text: e.message || "Could not load profile." });
      });
  }, [router]);

  async function save(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setFieldErr("");
    setSaving(true);
    try {
      const d = await api("/api/auth/profile/", { method: "PATCH", body: { phone } });
      setP(d);
      setMsg({ type: "ok", text: "Phone number updated." });
    } catch (err) {
      setFieldErr(err.fields?.phone || "");
      setMsg({ type: "error", text: err.message || "Could not save. Try again." });
    } finally {
      setSaving(false);
    }
  }

  const rows = p && [
    ["Name", p.name], ["Username", p.username],
    ["USN", p.usn], ["Room", p.room_number],
  ];
  const err = { color: "var(--hs-error)" };

  return (
    <main className="p-8 max-w-lg">
      <a href="/dashboard" className="underline text-sm">← Dashboard</a>
      <h1 className="text-2xl font-bold mt-2">My profile</h1>
      {!p && !msg.text && <p className="mt-4">Loading...</p>}
      {!p && msg.type === "error" && <p role="alert" style={err} className="mt-4">{msg.text}</p>}
      {p && (
        <>
          <dl className="mt-4 bg-white rounded shadow p-4 space-y-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="font-medium">{k}</dt>
                <dd>{v || "Not set"}</dd>
              </div>
            ))}
          </dl>
          <form onSubmit={save} className="mt-6 bg-white rounded shadow p-4 space-y-3">
            <label className="block">
              Phone number
              <input className="w-full border rounded px-3 py-2 mt-1" value={phone}
                onChange={(e) => setPhone(e.target.value)} />
              {fieldErr && <span style={err}>{fieldErr}</span>}
            </label>
            {msg.text && (
              <p role={msg.type === "error" ? "alert" : "status"}
                style={msg.type === "error" ? err : { color: "#15803d" }}>{msg.text}</p>
            )}
            <button disabled={saving} className="text-white px-4 py-2 rounded"
              style={{ background: "var(--hs-primary)" }}>
              {saving ? "Saving..." : "Save phone"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
