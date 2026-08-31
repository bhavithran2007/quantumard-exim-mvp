import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-600",
    Prospect: "bg-blue-100 text-blue-700",
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Closed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Draft: "bg-gray-100 text-gray-600",
    Sent: "bg-blue-100 text-blue-700",
    Accepted: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Expired: "bg-orange-100 text-orange-700",
    Requested: "bg-gray-100 text-gray-600",
    Delivered: "bg-green-100 text-green-700",
    Approved: "bg-green-100 text-green-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Production: "bg-yellow-100 text-yellow-700",
    Ready: "bg-purple-100 text-purple-700",
    Dispatched: "bg-indigo-100 text-indigo-700",
    Booked: "bg-blue-100 text-blue-700",
    "In Transit": "bg-yellow-100 text-yellow-700",
    "At Port": "bg-orange-100 text-orange-700",
    Customs: "bg-red-100 text-red-700",
    Won: "bg-green-100 text-green-700",
    Lost: "bg-red-100 text-red-700",
    "Repeat Customer": "bg-purple-100 text-purple-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}
