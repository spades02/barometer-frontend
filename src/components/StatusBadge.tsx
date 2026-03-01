import { getStatusColor } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { bg, text, label } = getStatusColor(status);

    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: bg, color: text }}
        >
            {label}
        </span>
    );
}
