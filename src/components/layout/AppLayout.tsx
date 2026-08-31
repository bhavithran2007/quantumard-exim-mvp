"use client";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-56 overflow-auto" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
