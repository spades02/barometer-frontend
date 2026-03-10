export interface Sector {
    id: string;
    name: string;
    sbi_code: string;
    is_active: boolean;
}

export interface Skill {
    id: string;
    name: string;
    description: string | null;
    skill_type: string;
    esco_uri: string | null;
    created_at: string;
    updated_at: string;
    tags?: string[];
}

export interface SectorSkill {
    id: string;
    sector_id: string;
    skill_id: string;
    trending_score: number | null;
    impact_score: number | null;
    urgency_score: number | null;
    priority_score: number | null;
    quick_win_score: number | null;
    effort_learn_score?: number | null;
    effort_apply_score?: number | null;
    admin_override?: Record<string, any>;
    ai_rationale: string | null;
    created_at: string;
    // Joined fields
    skill?: Skill;
    sector?: Sector;
}

export interface Trend {
    id: string;
    title: string;
    description: string | null;
    status: string;
    source_count: number;
    abstraction_level: string | null;
    weighted_authority_sum: number | null;
    created_at: string;
}

export interface ReviewQueueItem {
    id: string;
    item_type: string;
    item_id: string | null;
    item_name: string | null;
    description: string | null;
    status: string;
    priority: number | null;
    reason: string | null;
    created_at: string;
}

export interface AdminUser {
    id: string;
    user_id: string | null;
    email: string;
    invited_by: string | null;
    created_at: string;
    is_active: boolean;
}

export interface FundingOption {
    id: string;
    name: string;
    type: string;
    max_amount: number | null;
    deadline: string | null;
    status: string;
    url: string | null;
    created_at: string;
}

export interface Source {
    id: string;
    title: string;
    url: string | null;
    publisher: string | null;
    authority_score: number | null;
    publication_date: string | null;
}

export interface SearchQuery {
    id: string;
    sector_id: string;
    level: number;
    layer: number;
    spoor: string;
    search_type: string;
    query_text: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined
    sector?: { name: string; name_nl: string };
}

export interface SectorResearchConfig {
    id: string;
    sector_id: string;
    level: number;
    geo_focus: string;
    level_description: string;
    tier1_domains: string;
    tier2_domains: string;
    l1_hints: string;
    l1_pdf_hints: string;
    l2_hints: string;
    l2_pdf_hints: string;
}

export type FilterState = {
    sector: string | null;
    impactLevel: string | null;
    timeHorizon: string | null;
    effortLevel: string | null;
    timeRange: string | null;
    sort: string;
    view: "grouped" | "list";
};
