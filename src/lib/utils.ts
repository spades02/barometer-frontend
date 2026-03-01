import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
    switch (status) {
        case "pending":
            return { bg: "#fef3c7", text: "#92400e", label: "Pending" };
        case "approved":
            return { bg: "#dbeafe", text: "#1e40af", label: "Approved" };
        case "rejected":
            return { bg: "#ffe4e6", text: "#9f1239", label: "Rejected" };
        case "detected":
            return { bg: "#dbeafe", text: "#1e40af", label: "Detected" };
        case "confirmed":
            return { bg: "#d1fae5", text: "#065f46", label: "Confirmed" };
        case "emerging":
            return { bg: "#fef3c7", text: "#92400e", label: "Emerging" };
        default:
            return { bg: "#f1f5f9", text: "#475569", label: status };
    }
}

export function getScoreColor(score: number) {
    if (score >= 8) return "#10b981";
    if (score >= 6) return "#3b82f6";
    if (score >= 4) return "#f59e0b";
    return "#ef4444";
}

export function formatScore(score: number | string | null): number {
    if (score === null) return 0;
    const num = typeof score === "string" ? parseFloat(score) : score;
    return Math.round(num * 10);
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
