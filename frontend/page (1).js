"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setFields({});
    setLoading(true);
    try {
      await api("/api/auth/login/", { method: "POST", body: form });
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Could not sign in. Try again.");
      setFields(err.fields || {});
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full border rounded px-3 py-2 mt-1";
  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">HostelSpace Sign in</h1>
        {error && <p role="alert" style={{ color: "var(--hs-error)" }}>{error}</p>}
        <label className="block">
          Username
          <input className={input} value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
          {fields.username && <span style={{ color: "var(--hs-error)" }}>{fields.username}</span>}
        </label>
        <label className="block">
          Password
          <input type="password" className={input} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {fields.password && <span style={{ color: "var(--hs-error)" }}>{fields.password}</span>}
        </label>
        <button disabled={loading} className="w-full text-white py-2 rounded"
          style={{ background: "var(--hs-primary)" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
