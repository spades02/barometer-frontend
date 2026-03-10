import { createClient } from "@/lib/supabase/server";
import { ExternalLink, Banknote, Calendar, Tag } from "lucide-react";
import type { FundingOption } from "@/lib/types";

export default async function FundingPage() {
    const supabase = await createClient();

    const { data: fundingOptions } = await supabase
        .from("funding_options")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <>
            <div
                className="bg-white border-b px-6 lg:px-8 py-5"
                style={{ borderColor: "#e2e8f0" }}
            >
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                        <Banknote size={16} />
                    </div>
                    <h2 className="text-[20px] font-bold text-heading">Funding Options</h2>
                </div>
                <p className="text-[13px] text-muted ml-11">
                    Available subsidies, grants, and financial incentives across regions and sectors.
                </p>
            </div>

            <div className="px-6 lg:px-8 py-6 max-w-6xl mx-auto">
                {fundingOptions && fundingOptions.length > 0 ? (
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-slate-50 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-5">Funding Name</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Max Amount</div>
                            <div className="col-span-2">Deadline</div>
                            <div className="col-span-1 text-right">Status</div>
                        </div>
                        <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                            {fundingOptions.map((fund: FundingOption) => (
                                <div key={fund.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                    <div className="col-span-5 pr-4">
                                        {fund.url ? (
                                            <a href={fund.url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors">
                                                {fund.name}
                                                <ExternalLink size={14} className="opacity-50" />
                                            </a>
                                        ) : (
                                            <div className="text-[14px] font-semibold text-slate-800">{fund.name}</div>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1.5 text-[13px] text-slate-600">
                                        <Tag size={13} className="text-slate-400" />
                                        {fund.type || "General"}
                                    </div>
                                    <div className="col-span-2 text-[13px] font-medium text-slate-700">
                                        {fund.max_amount ? `€${fund.max_amount.toLocaleString()}` : "Variable/Unknown"}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1.5 text-[13px] text-slate-600">
                                        <Calendar size={13} className="text-slate-400" />
                                        {fund.deadline ? new Date(fund.deadline).toLocaleDateString() : "Rolling"}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                            fund.status === "active" ? "bg-emerald-100 text-emerald-700" :
                                            fund.status === "upcoming" ? "bg-blue-100 text-blue-700" :
                                            "bg-slate-100 text-slate-600"
                                        }`}>
                                            {fund.status || "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border rounded-xl shadow-sm p-12 text-center" style={{ borderColor: "#e2e8f0" }}>
                        <Banknote size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-[16px] font-semibold text-slate-800 mb-2">No Funding Options found</h3>
                        <p className="text-[14px] text-slate-500">Currently there are no funding options listed in the database.</p>
                    </div>
                )}
            </div>
        </>
    );
}
