"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Factory, Kanban, FileQuestion,
  FileText, Scale, Package, ShoppingCart, Ship, DollarSign,
  FolderOpen, BarChart3, Crown, ChevronLeft, Menu,
  Globe, Boxes
} from "lucide-react";
import { useState } from "react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "CEO Command", href: "/ceo", icon: Crown },
  { divider: true, label: "CRM" },
  { label: "Buyers", href: "/buyers", icon: Users },
  { label: "Suppliers", href: "/suppliers", icon: Factory },
  { label: "CRM Pipeline", href: "/crm", icon: Kanban },
  { divider: true, label: "Trade" },
  { label: "RFQs", href: "/rfqs", icon: FileQuestion },
  { label: "Quotations", href: "/quotations", icon: FileText },
  { label: "Supplier Compare", href: "/quotations/compare", icon: Scale },
  { label: "Samples", href: "/samples", icon: Boxes },
  { divider: true, label: "Operations" },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Shipments", href: "/shipments", icon: Ship },
  { divider: true, label: "Finance & Docs" },
  { label: "Finance", href: "/finance", icon: DollarSign },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-gray-950 text-white flex flex-col fixed left-0 top-0 z-40 transition-all duration-200",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white tracking-wide">QUANTUMARD</div>
            <div className="text-xs text-gray-400">EXIM OS</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white p-1 rounded">
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {nav.map((item, i) => {
          if ("divider" in item && item.divider) {
            return (
              <div key={i} className={cn("px-4 pt-4 pb-1", collapsed && "hidden")}>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</span>
              </div>
            );
          }
          const Icon = item.icon!;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href!));
          return (
            <Link key={item.href} href={item.href!}
              className={cn(
                "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}>
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800 p-3">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">A</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">Admin User</div>
              <div className="text-xs text-gray-500">CEO</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
