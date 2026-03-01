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

export type FilterState = {
    sector: string | null;
    impactLevel: string | null;
    timeHorizon: string | null;
    effortLevel: string | null;
    timeRange: string | null;
    sort: string;
    view: "grouped" | "list";
};
