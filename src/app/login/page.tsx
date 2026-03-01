"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "./actions";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await signIn(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-8 gradient-bg">
            <div className="w-full max-w-[420px] mx-4">
                {/* Logo & Branding */}
                <div className="text-center mb-6">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 gradient-primary"
                    >
                        <svg
                            width="28"
                            height="28"
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
                    <h1 className="text-[22px] font-bold text-heading leading-tight">
                        VET Skills Barometer
                    </h1>
                    <p className="text-[13px] text-muted mt-1">
                        Intelligence-Driven Skills Forecasting
                    </p>
                </div>

                {/* Card */}
                <div
                    className="bg-white rounded-2xl p-8"
                    style={{
                        boxShadow:
                            "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)",
                    }}
                >
                    <div className="mb-6">
                        <h2 className="text-[20px] font-bold text-heading leading-tight">
                            Welcome Back
                        </h2>
                        <p className="text-[14px] text-muted mt-1">
                            Sign in to your account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-error-light text-error text-[13px] border border-error/20">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
                                    size={18}
                                />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full h-[44px] pl-11 pr-4 rounded-lg border transition-all duration-200 outline-none text-[14px]"
                                    style={{
                                        borderColor:
                                            focusedField === "email" ? "#1d4ed8" : "#e2e8f0",
                                        borderWidth: "1.5px",
                                        boxShadow:
                                            focusedField === "email"
                                                ? "0 0 0 3px rgba(29, 78, 216, 0.1)"
                                                : "none",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
                                    size={18}
                                />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Password"
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full h-[44px] pl-11 pr-11 rounded-lg border transition-all duration-200 outline-none text-[14px]"
                                    style={{
                                        borderColor:
                                            focusedField === "password" ? "#1d4ed8" : "#e2e8f0",
                                        borderWidth: "1.5px",
                                        boxShadow:
                                            focusedField === "password"
                                                ? "0 0 0 3px rgba(29, 78, 216, 0.1)"
                                                : "none",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="text-[12px] text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[44px] rounded-lg gradient-primary text-white text-[14px] font-medium transition-all duration-200 cursor-pointer hover:opacity-90 disabled:opacity-60"
                            style={{
                                boxShadow: "0 2px 8px rgba(29, 78, 216, 0.3)",
                            }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative px-4 bg-white">
                                <span className="text-[12px] text-subtle">or</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <button
                            type="button"
                            className="w-full h-[44px] rounded-lg border transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer text-[14px] font-medium text-text hover:bg-surface"
                            style={{
                                borderColor: "#e2e8f0",
                                borderWidth: "1.5px",
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5614C11.2416 14.1014 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Sign in with Google
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-[13px] text-subtle">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-info hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>

                {/* Bottom branding */}
                <p className="text-center mt-6 text-[11px] text-subtle">
                    Empowering VET providers with data-driven skills intelligence
                </p>
            </div>
        </div>
    );
}
