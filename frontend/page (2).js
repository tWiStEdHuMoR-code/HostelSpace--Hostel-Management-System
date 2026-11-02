"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// Role -> items shown on dashboard (UI convenience only; server enforces access).
const MENU = {
  student: ["My profile", "Notices & rules", "Study room status", "Laundry", "Leave", "Attendance", "Complaints", "Mess", "Fees"],
  warden: ["Leave requests", "Attendance", "Deviation records"],
  chief_warden: ["Wardens", "Escalated cases"],
  director: ["Users & roles", "Hostel information", "Reports"],
  maintenance: ["Assigned complaints"],
  mess: ["Mess allocation", "Coupons"],
  laundry: ["Laundry days", "Handover & collection"],
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api("/api/auth/me/").then(setUser).catch(() => router.replace("/login"));
  }, [router]);

  async function signOut() {
    await api("/api/auth/logout/", { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  if (!user) return <main className="p-8">Loading...</main>;
  const items = MENU[user.role] || [];
  return (
    <main className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <button onClick={signOut} className="border rounded px-3 py-1">Sign out</button>
      </div>
      <p className="mt-1 text-sm">Role: {user.role}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <li key={i} className="bg-white rounded shadow p-4">{i}</li>
        ))}
      </ul>
    </main>
  );
}
