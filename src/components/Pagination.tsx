"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
    totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentPage = Number(searchParams.get("page")) || 1;

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => router.push(createPageURL(currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: "#e2e8f0" }}
            >
                <ChevronLeft size={18} className="text-muted" />
            </button>

            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={page}
                                onClick={() => router.push(createPageURL(page))}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${currentPage === page
                                        ? "bg-primary text-white"
                                        : "hover:bg-surface text-text"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                            <span key={page} className="px-1 text-muted text-[13px]">
                                ...
                            </span>
                        );
                    }
                    return null;
                })}
            </div>

            <button
                onClick={() => router.push(createPageURL(currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: "#e2e8f0" }}
            >
                <ChevronRight size={18} className="text-muted" />
            </button>
        </div>
    );
}
