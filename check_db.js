const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabase() {
    console.log("--- LLO OFFERINGS ---");
    const { data: llo, error: lloErr } = await supabase.from('llo_offerings').select('*').limit(2);
    console.log(lloErr || (llo.length > 0 ? llo : "No llo_offerings found"));

    console.log("\n--- FUNDING OPTIONS ---");
    const { data: funding, error: fundErr } = await supabase.from('funding_options').select('*').limit(2);
    console.log(fundErr || (funding.length > 0 ? funding : "No funding_options found"));

    console.log("\n--- SKILL CLUSTER MEMBERS ---");
    const { data: clusters, error: clusterErr } = await supabase.from('skill_cluster_members').select('*').limit(2);
    console.log(clusterErr || (clusters.length > 0 ? clusters : "No skill_cluster_members found"));
}

checkDatabase();
