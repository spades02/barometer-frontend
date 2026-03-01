"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    ShieldCheck,
    Zap,
    Settings,
    Search,
    Bell,
    ChevronDown,
    LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import GlobalSearch from "./GlobalSearch";

interface TopNavProps {
    isAdmin: boolean;
    userEmail: string;
    userName?: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
    badge?: boolean;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Skills Library", href: "/skills", icon: BookOpen },
    { label: "Trending Analysis", href: "/trending", icon: TrendingUp },
    { label: "Quick Wins", href: "/quick-wins", icon: Zap },
];

const adminItems: NavItem[] = [
    {
        label: "Admin Review",
        href: "/admin",
        icon: ShieldCheck,
        badge: true,
    },
    { label: "Settings", href: "/settings", icon: Settings },
];

export default function TopNav({
    isAdmin,
    userEmail,
    userName,
}: TopNavProps) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;
    const initials = userName
        ? getInitials(userName)
        : getInitials(userEmail.split("@")[0]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    }

    return (
        <nav
            className="bg-white border-b sticky top-0 z-50"
            style={{ borderColor: "#e2e8f0" }}
        >
            {/* Top row: logo + actions */}
            <div className="flex items-center justify-between px-6 lg:px-8 h-14">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center gradient-primary"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3 3L21 21M3 21L21 3"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="8"
                                stroke="white"
                                strokeWidth="2"
                                fill="none"
                            />
                        </svg>
                    </div>
                    <span className="text-[16px] font-bold text-heading hidden sm:inline">
                        VET Skills Barometer
                    </span>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    <GlobalSearch />
                    <button className="p-2 rounded-lg hover:bg-surface transition-colors relative">
                        <Bell size={20} className="text-muted" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral" />
                    </button>

                    {/* User menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface transition-colors"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold gradient-primary"
                            >
                                {initials}
                            </div>
                            <ChevronDown size={16} className="text-muted" />
                        </button>

                        {showUserMenu && (
                            <div
                                className="absolute top-full mt-2 right-0 bg-white rounded-xl border overflow-hidden z-50"
                                style={{
                                    borderColor: "#e2e8f0",
                                    minWidth: "200px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                                }}
                            >
                                <div className="px-4 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
                                    <p className="text-[13px] font-medium text-heading truncate">
                                        {userName || userEmail.split("@")[0]}
                                    </p>
                                    <p className="text-[11px] text-subtle truncate">{userEmail}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await fetch("/auth/signout", { method: "POST" });
                                        window.location.href = "/login";
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface text-[13px] text-coral"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation tabs */}
            <div className="flex items-center gap-0.5 px-6 lg:px-8 overflow-x-auto">
                {allItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-lg transition-all whitespace-nowrap text-[13px]"
                            style={{
                                fontWeight: active ? 600 : 400,
                                color: active ? "white" : "#64748b",
                                background: active
                                    ? "linear-gradient(135deg, #1d4ed8, #4f46e5)"
                                    : "transparent",
                                borderRadius: active ? "8px 8px 0 0" : "8px 8px 0 0",
                            }}
                        >
                            <Icon size={16} />
                            <span>{item.label}</span>
                            {"badge" in item && item.badge && (
                                <span
                                    className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold"
                                    style={{
                                        backgroundColor: active
                                            ? "rgba(255,255,255,0.2)"
                                            : "#dbeafe",
                                        color: active ? "white" : "#1d4ed8",
                                    }}
                                >
                                    12
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav >
    );
}
