import { createClient } from "@/lib/supabase/server";
import { ExternalLink, FileText, Calendar, Building2 } from "lucide-react";
import type { Source } from "@/lib/types";

export default async function SourcesPage() {
    const supabase = await createClient();

    const { data: sources } = await supabase
        .from("sources")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600">
                        <FileText size={16} />
                    </div>
                    <h2 className="text-[20px] font-bold text-heading">Research Sources</h2>
                </div>
                <p className="text-[13px] text-muted ml-11">
                    The evidence base of articles, PDFs, and reports backing trending skills and technologies.
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6 max-w-6xl mx-auto">
                {sources && sources.length > 0 ? (
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-slate-50 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-6">Title</div>
                            <div className="col-span-3">Publisher</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-1 text-right">Auth.</div>
                        </div>
                        <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                            {sources.map((source: Source) => (
                                <div key={source.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="col-span-6 pr-4">
                                        {source.url ? (
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-amber-700 hover:text-amber-900 flex items-start gap-1.5 transition-colors line-clamp-2">
                                                <span>{source.title}</span>
                                                <ExternalLink size={13} className="opacity-50 flex-shrink-0 mt-1" />
                                            </a>
                                        ) : (
                                            <div className="text-[14px] font-semibold text-slate-800 line-clamp-2">{source.title}</div>
                                        )}
                                    </div>
                                    <div className="col-span-3 flex items-center gap-1.5 text-[13px] text-slate-600 truncate">
                                        <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                                        <span className="truncate">{source.publisher || "Unknown"}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1.5 text-[13px] text-slate-600">
                                        <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                                        {(source as any).publish_date ? new Date((source as any).publish_date).toLocaleDateString() : "—"}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        {source.authority_score != null ? (
                                            <span className="text-[13px] font-mono font-semibold text-slate-500">
                                                {source.authority_score}
                                            </span>
                                        ) : "—"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border rounded-xl shadow-sm p-12 text-center" style={{ borderColor: "#e2e8f0" }}>
                        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-[16px] font-semibold text-slate-800 mb-2">No Sources found</h3>
                        <p className="text-[14px] text-slate-500">Currently there are no sources listed in the database.</p>
                    </div>
                )}
            </div>
        </>
    );
}
