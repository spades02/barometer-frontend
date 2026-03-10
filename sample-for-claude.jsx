import { useState, useRef, useEffect } from "react";

const categories = ["AI & Digitalisation", "Sustainability", "Customer Experience", "Data & Analytics", "Leadership"];
const sectors = ["Retail", "Zorg", "Techniek", "ICT", "Logistiek", "Bouw"];
const impactOptions = ["Very High (9–10)", "High (7–8)", "Medium (5–6)", "Low (1–4)"];
const effortOptions = ["Very Low (1–2)", "Low (3–4)", "Medium (5–6)", "High (7–10)"];
const horizonOptions = ["< 6 months", "6–12 months", "1–2 years", "2+ years"];

const allSkills = [
  { id:1, name:"AI-Assisted Customer Interaction", desc:"Operating AI-driven customer service tools on the shop floor and in digital channels — including chatbot backends and recommendation engines.", type:"Tool", status:"Emerging", sector:"Retail", priority:8.4, impact:9.1, effort:2.8, trending:8.7, urgency:7.9, quickWin:true, trendCount:14, sourceCount:19, sparkline:[3.1,3.8,4.2,5.1,5.8,6.4,7.2,7.8,8.4,8.7], summaRecommended:true, reason:"trending", category:"AI & Digitalisation", horizon:"6–12 months", mentions:[4,6,8,11,14,16,19] },
  { id:2, name:"Data-Driven Inventory Management", desc:"Using real-time data and predictive analytics to optimise stock levels, reduce waste, and improve supply chain responsiveness.", type:"Hard Skill", status:"Emerging", sector:"Retail", priority:7.9, impact:8.6, effort:3.2, trending:7.4, urgency:6.8, quickWin:true, trendCount:11, sourceCount:14, sparkline:[2.4,3.1,3.9,4.8,5.5,6.1,6.9,7.4,7.7,7.9], summaRecommended:false, reason:"quickwin", category:"Data & Analytics", horizon:"6–12 months", mentions:[2,3,5,7,9,11,14] },
  { id:3, name:"Sustainable Procurement Practices", desc:"Evaluating and selecting suppliers based on environmental and social criteria, applying circular economy principles to purchasing decisions.", type:"Hard Skill", status:"Established", sector:"Retail", priority:5.8, impact:8.1, effort:4.2, trending:5.9, urgency:8.2, quickWin:false, trendCount:18, sourceCount:22, sparkline:[5.1,5.3,5.4,5.6,5.7,5.7,5.8,5.9,5.8,5.8], summaRecommended:false, reason:"urgent", category:"Sustainability", horizon:"1–2 years", mentions:[8,9,10,12,14,16,22] },
  { id:4, name:"Omnichannel Customer Journey Design", desc:"Mapping and optimising customer experiences across physical and digital touchpoints to create seamless, consistent interactions.", type:"Methodology", status:"Established", sector:"Retail", priority:6.2, impact:7.8, effort:3.9, trending:6.1, urgency:5.4, quickWin:false, trendCount:9, sourceCount:12, sparkline:[5.8,5.9,6.0,6.1,6.2,6.1,6.3,6.2,6.2,6.2], summaRecommended:false, reason:"priority", category:"Customer Experience", horizon:"1–2 years", mentions:[5,6,6,7,8,9,12] },
  { id:5, name:"AI Literacy for Non-Technical Staff", desc:"Understanding how AI systems work, their limitations, and how to work effectively alongside AI tools without deep technical knowledge.", type:"Soft Skill", status:"Emerging", sector:"Retail", priority:9.1, impact:9.4, effort:2.2, trending:9.6, urgency:8.8, quickWin:true, trendCount:31, sourceCount:44, sparkline:[2.1,3.2,4.5,5.8,6.9,7.8,8.4,8.8,9.0,9.1], summaRecommended:false, reason:"trending", category:"AI & Digitalisation", horizon:"< 6 months", mentions:[5,9,14,21,28,36,44] },
  { id:6, name:"Circular Economy Operations", desc:"Applying circular principles to daily operations — including product lifecycle management, repair, reuse, and waste reduction workflows.", type:"Hard Skill", status:"Emerging", sector:"Zorg", priority:7.2, impact:8.8, effort:3.6, trending:8.1, urgency:7.6, quickWin:true, trendCount:22, sourceCount:28, sparkline:[3.4,4.1,4.8,5.5,6.0,6.5,6.9,7.0,7.2,7.2], summaRecommended:false, reason:"quickwin", category:"Sustainability", horizon:"1–2 years", mentions:[6,9,12,16,20,24,28] },
  { id:7, name:"Data-Driven Decision Making", desc:"Using quantitative data and analytical frameworks to inform operational and strategic decisions, replacing intuition with evidence.", type:"Soft Skill", status:"Established", sector:"Techniek", priority:6.8, impact:8.2, effort:3.8, trending:6.4, urgency:6.1, quickWin:false, trendCount:27, sourceCount:35, sparkline:[6.0,6.1,6.3,6.4,6.5,6.6,6.7,6.8,6.8,6.8], summaRecommended:false, reason:"priority", category:"Data & Analytics", horizon:"6–12 months", mentions:[12,15,18,22,26,30,35] },
  { id:8, name:"Human-AI Collaboration", desc:"Working effectively with AI systems as a collaborative partner — delegating appropriately, verifying outputs, and maintaining oversight.", type:"Soft Skill", status:"Emerging", sector:"ICT", priority:8.8, impact:9.2, effort:2.4, trending:9.1, urgency:8.3, quickWin:true, trendCount:29, sourceCount:38, sparkline:[2.8,3.9,5.1,6.2,7.1,7.8,8.2,8.5,8.7,8.8], summaRecommended:false, reason:"trending", category:"AI & Digitalisation", horizon:"< 6 months", mentions:[6,10,15,21,27,32,38] },
  { id:9, name:"Cybersecurity Awareness", desc:"Recognising and responding to cyber threats in daily work — including phishing, social engineering, and secure data handling practices.", type:"Hard Skill", status:"Established", sector:"ICT", priority:7.1, impact:8.9, effort:3.8, trending:6.8, urgency:9.1, quickWin:false, trendCount:16, sourceCount:21, sparkline:[6.4,6.5,6.7,6.8,6.9,7.0,7.1,7.1,7.1,7.1], summaRecommended:false, reason:"urgent", category:"AI & Digitalisation", horizon:"< 6 months", mentions:[8,10,12,14,16,18,21] },
  { id:10, name:"Lean Process Optimisation", desc:"Identifying and eliminating waste in operational processes using lean methodologies, value stream mapping, and continuous improvement cycles.", type:"Methodology", status:"Declining", sector:"Techniek", priority:3.2, impact:6.1, effort:5.8, trending:2.4, urgency:3.1, quickWin:false, trendCount:4, sourceCount:6, sparkline:[7.1,6.8,6.4,5.9,5.3,4.7,4.1,3.6,3.4,3.2], summaRecommended:false, reason:"priority", category:"Leadership", horizon:"2+ years", mentions:[18,15,12,10,8,7,6] },
  { id:11, name:"Smart Logistics & Route Optimisation", desc:"Using algorithm-driven tools to plan efficient delivery routes, reduce fuel costs, and adapt dynamically to real-time conditions.", type:"Tool", status:"Emerging", sector:"Logistiek", priority:7.6, impact:8.4, effort:3.1, trending:7.9, urgency:7.2, quickWin:true, trendCount:13, sourceCount:17, sparkline:[3.8,4.4,5.0,5.7,6.2,6.7,7.1,7.3,7.5,7.6], summaRecommended:false, reason:"quickwin", category:"Data & Analytics", horizon:"6–12 months", mentions:[3,5,7,9,12,14,17] },
  { id:12, name:"Patient-Centred Care Coordination", desc:"Organising and aligning care processes around individual patient needs, preferences, and goals across multiple care providers and settings.", type:"Methodology", status:"Established", sector:"Zorg", priority:6.5, impact:8.0, effort:3.8, trending:5.8, urgency:7.4, quickWin:false, trendCount:20, sourceCount:25, sparkline:[6.1,6.2,6.3,6.4,6.4,6.5,6.5,6.5,6.5,6.5], summaRecommended:false, reason:"priority", category:"Customer Experience", horizon:"1–2 years", mentions:[10,12,14,17,19,22,25] },
];

const reasonLabels = {
  trending: { label:"Fast rising", color:"#2563eb", icon:"↗" },
  quickwin: { label:"Quick win", color:"#d97706", icon:"⚡" },
  urgent:   { label:"Urgent", color:"#dc2626", icon:"⏰" },
  priority: { label:"Top priority", color:"#374151", icon:"★" },
};

const typeIcons = { "Tool":"🔧", "Hard Skill":"📐", "Soft Skill":"💡", "Methodology":"📋" };

const scoreTooltips = {
  Impact: "How broadly this skill affects performance. 9–10 = critical. 1–4 = niche.",
  Effort: "Investment to proficiency. 1–2 = under 12h. 7–10 = months.",
  Trending: "Acceleration of mentions. High = growing fast.",
  Urgency: "Time pressure. High = deadlines approaching.",
  Priority: "Impact ÷ effort. Higher = more value per investment.",
  Signal: "Source activity over time. Rising = growing base.",
};

const chartTooltips = {
  matrix: "Shows each skill plotted by impact (vertical) vs effort (horizontal). Top-left quadrant = quick wins with high impact and low effort. Helps prioritise where to invest first.",
  trending: "Ranks skills by how fast their trending score is accelerating. Shows what's gaining momentum right now across your sources.",
  donut: "Breakdown of skill lifecycle stages. Emerging skills need early investment, Established need maintenance, Declining may be deprioritised.",
  urgency: "Skills sorted by urgency score. Darker = more time-sensitive. Helps identify which skills need action before competitive or regulatory deadlines hit.",
};

const skillTrends = {
  1: [
    {title:"Generative AI transforming knowledge work globally",level:"Macro",sources:24},
    {title:"AI entering retail customer service and shop floor operations",level:"Sector",sources:11},
    {title:"Consumer expectation for instant, personalised service rising",level:"Market",sources:8},
    {title:"Chatbot adoption in Dutch retail accelerating post-2024",level:"Sector",sources:6},
    {title:"Labour shortages driving automation investment",level:"Macro",sources:19},
    {title:"AI tool proficiency becoming baseline hiring requirement",level:"HR",sources:7},
    {title:"Omnichannel retail requiring unified AI backend",level:"Sector",sources:5},
    {title:"Customer data platforms integrating AI recommendation engines",level:"Technology",sources:9},
    {title:"EU AI Act compliance requiring staff training",level:"Regulatory",sources:12},
    {title:"Voice AI and conversational commerce emerging",level:"Technology",sources:4},
    {title:"Retail margins pressuring cost-saving innovation",level:"Market",sources:6},
    {title:"Digital-first retail models outperforming traditional",level:"Market",sources:8},
    {title:"AI ethics and responsible use gaining traction",level:"Regulatory",sources:5},
    {title:"Cross-sector AI literacy mandates from industry bodies",level:"Policy",sources:3},
  ],
  default: [
    {title:"Generative AI transforming knowledge work globally",level:"Macro",sources:24},
    {title:"Sector-specific digital transformation accelerating",level:"Sector",sources:11},
    {title:"Skills gap widening in technical domains",level:"HR",sources:8},
    {title:"EU regulatory frameworks driving compliance training",level:"Regulatory",sources:12},
    {title:"Labour market tightening in Netherlands",level:"Macro",sources:15},
  ]
};

const skillBulletExamples = {
  1: {
    title: "What you'll be able to do",
    bullets: [
      {text:"Deploy and configure AI chatbot tools in daily customer service workflows", example:"e.g. Setting up a Zendesk AI agent to handle return queries in Dutch"},
      {text:"Recognise and correct incorrect or inappropriate AI outputs", example:"e.g. Flagging when a chatbot recommends an out-of-stock product"},
      {text:"Interpret AI-generated recommendations for colleagues and customers", example:"e.g. Explaining why the system suggests a cross-sell based on purchase history"},
      {text:"Monitor performance indicators and escalate issues appropriately", example:"e.g. Noticing a drop in chatbot resolution rate and alerting the team lead"},
    ]
  },
  default: {
    title: "What you'll be able to do",
    bullets: [
      {text:"Deploy and configure relevant tools in daily workflows", example:"e.g. Integrating the tool into existing team processes"},
      {text:"Recognise and correct incorrect or inappropriate outputs", example:"e.g. Identifying errors before they reach stakeholders"},
      {text:"Interpret data-driven recommendations for colleagues", example:"e.g. Translating analytics results into actionable next steps"},
      {text:"Monitor performance indicators and escalate issues appropriately", example:"e.g. Tracking KPIs and flagging anomalies to management"},
    ]
  }
};

// ── MICRO COMPONENTS ─────────────────────────────────────────────────────
const Spark = ({ data, declining, w=52, h=22 }) => {
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*(h-5)-2}`).join(" ");
  const c=declining?"#d1d5db":"#111827";
  return <svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx={w} cy={h-((data[data.length-1]-min)/range)*(h-5)-2} r="2.5" fill={c}/></svg>;
};

const Bars = ({ value, declining }) => (
  <div style={{display:"flex",gap:2,alignItems:"flex-end",height:20}}>
    {[...Array(7)].map((_,i)=>{
      const filled=value>=(i+1)/7*10;
      return <div key={i} style={{width:3.5,height:5+i*2,borderRadius:2,background:filled?(declining?"#d1d5db":"#111827"):"#f0f0f0"}}/>;
    })}
  </div>
);

const MiniBarChart = ({ data, w=70, h=20 }) => {
  const max = Math.max(...data);
  const barW = Math.floor((w - (data.length-1)*2) / data.length);
  return (
    <svg width={w} height={h} style={{display:"block"}}>
      {data.map((v,i) => {
        const bh = Math.max(2, (v/max)*(h-2));
        return <rect key={i} x={i*(barW+2)} y={h-bh} width={barW} height={bh} rx="1.5" fill={i===data.length-1?"#111827":"#d1d5db"}/>;
      })}
    </svg>
  );
};

const StatusDot = ({ status }) => {
  const c=status==="Emerging"?"#059669":status==="Declining"?"#9ca3af":"#2563eb";
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:14,fontWeight:500,color:c}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{status}</span>;
};

const TypeTag = ({ type }) => (
  <span style={{fontSize:13,color:"#6b7280",background:"#f3f4f6",padding:"3px 10px",borderRadius:20,fontWeight:500,display:"inline-flex",alignItems:"center",gap:4}}>
    <span style={{fontSize:12}}>{typeIcons[type]||""}</span>{type}
  </span>
);

const ScoreBar = ({ label, value, declining }) => (
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <span style={{fontSize:13,color:"#9ca3af",width:60,flexShrink:0}}>{label}</span>
    <div style={{flex:1,height:3,background:"#f0f0f0",borderRadius:99}}>
      <div style={{height:"100%",width:`${value*10}%`,background:declining?"#d1d5db":"#111827",borderRadius:99}}/>
    </div>
    <span style={{fontSize:14,fontWeight:600,color:declining?"#9ca3af":"#374151",minWidth:28,textAlign:"right"}}>{value.toFixed(1)}</span>
  </div>
);

// ── TOOLTIP ───────────────────────────────────────────────────────────────
const Tooltip = ({ text, children, maxWidth=200 }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({top:0,left:0});
  const ref = useRef();
  const onEnter = () => {
    setShow(true);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({top: r.top - 8, left: r.left + r.width/2});
    }
  };
  return (
    <div ref={ref} style={{position:"relative",display:"inline-flex"}}
      onMouseEnter={onEnter}
      onMouseLeave={()=>setShow(false)}>
      {children}
      {show&&(
        <div style={{position:"fixed",top:pos.top,left:pos.left,transform:"translate(-50%,-100%)",background:"#1f2937",color:"white",fontSize:12,lineHeight:1.5,padding:"8px 12px",borderRadius:8,width:maxWidth,zIndex:99999,boxShadow:"0 4px 16px rgba(0,0,0,0.18)",pointerEvents:"none"}}>
          {text}
          <div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:"5px solid #1f2937"}}/>
        </div>
      )}
    </div>
  );
};

// ── INFO ICON (for chart cards) ───────────────────────────────────────────
const InfoIcon = ({ tooltip }) => {
  const [show, setShow] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div style={{position:"relative",display:"inline-flex"}}
      onMouseEnter={()=>{setShow(true);setHov(true);}}
      onMouseLeave={()=>{setShow(false);setHov(false);}}>
      <div style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${hov?"#9ca3af":"#e5e7eb"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"help",fontSize:11,fontWeight:700,color:hov?"#6b7280":"#d1d5db",transition:"all 0.15s",background:hov?"#f9fafb":"white"}}>i</div>
      {show&&(
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"#1f2937",color:"white",fontSize:12,lineHeight:1.55,padding:"10px 14px",borderRadius:10,width:230,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",pointerEvents:"none",whiteSpace:"normal"}}>
          {tooltip}
          <div style={{position:"absolute",bottom:"100%",right:6,width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderBottom:"6px solid #1f2937"}}/>
        </div>
      )}
    </div>
  );
};

// ── EXPAND BUTTON (for chart cards) ──────────────────────────────────────
const ExpandBtn = ({ onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={(e)=>{e.stopPropagation();onClick();}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:24,height:24,borderRadius:6,border:`1.5px solid ${hov?"#9ca3af":"#e5e7eb"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:hov?"#6b7280":"#d1d5db",transition:"all 0.15s",background:hov?"#f9fafb":"white",flexShrink:0}}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 1h4v4M5 13H1V9M13 1L8.5 5.5M1 13l4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
};

// ── SUMMA PICK BADGE ──────────────────────────────────────────────────────
const SummaPick = () => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#7c3aed",fontWeight:600,background:"#f3f0ff",border:"1px solid #e9e5ff",padding:"2px 8px",borderRadius:6}}>
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.9L8 12.4l-4.3 2.2.8-4.9L1 6.3l4.8-.8L8 1z" fill="#7c3aed" opacity="0.3" stroke="#7c3aed" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
    Summa pick
  </span>
);

// ── SAVE HEART BUTTON ─────────────────────────────────────────────────────
const SaveButton = ({ saved, onToggle, size="sm", visible=true }) => (
  <button onClick={(e)=>{e.stopPropagation();onToggle();}}
    style={{display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,transition:"all 0.15s",opacity:visible?1:0}}
    onMouseEnter={e=>{if(!visible)e.currentTarget.style.opacity="1";e.currentTarget.style.background="#fef2f2";}}
    onMouseLeave={e=>{if(!visible)e.currentTarget.style.opacity="0";e.currentTarget.style.background="none";}}>
    <svg width={size==="sm"?15:17} height={size==="sm"?15:17} viewBox="0 0 20 20" fill={saved?"#ef4444":"none"} stroke={saved?"#ef4444":"#d1d5db"} strokeWidth="1.8">
      <path d="M10 17.5s-7-4.5-7-9.5a4 4 0 017-2.6A4 4 0 0117 8c0 5-7 9.5-7 9.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

// ── MULTI-SELECT DROPDOWN ─────────────────────────────────────────────────
const MultiDropdown = ({ label, options, values, onChange }) => {
  const [open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);
  const active=values.length>0;
  const toggle=opt=>onChange(values.includes(opt)?values.filter(v=>v!==opt):[...values,opt]);
  return (
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setOpen(!open)} className="filter-btn" style={{display:"flex",alignItems:"center",gap:8,background:active?"#111827":"white",border:`1.5px solid ${active?"#111827":"#e5e7eb"}`,color:active?"white":"#374151",padding:"9px 15px",borderRadius:8,fontSize:15,fontWeight:500,fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s",minWidth:110,justifyContent:"space-between"}}>
        <span>{active?`${label} (${values.length})`:label}</span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{transition:"transform 0.2s",transform:open?"rotate(180deg)":"none",flexShrink:0}}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"white",border:"1px solid #e5e7eb",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:200,minWidth:210,overflow:"hidden"}}>
          {options.map(opt=>{const sel=values.includes(opt);return(
            <button key={opt} onClick={()=>toggle(opt)} style={{display:"flex",alignItems:"center",width:"100%",padding:"11px 15px",background:sel?"#f9fafb":"white",border:"none",borderBottom:"1px solid #f9fafb",color:sel?"#111827":"#374151",fontSize:14,fontFamily:"inherit",cursor:"pointer",textAlign:"left",gap:9}}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
              onMouseLeave={e=>e.currentTarget.style.background=sel?"#f9fafb":"white"}>
              <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${sel?"#111827":"#d1d5db"}`,background:sel?"#111827":"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {sel&&<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2.5 2.5 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              {opt}
            </button>
          );})}
          {active&&<button onClick={()=>onChange([])} style={{width:"100%",padding:"9px 15px",background:"none",border:"none",borderTop:"1px solid #f3f4f6",color:"#9ca3af",fontSize:13,fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}>Clear</button>}
        </div>
      )}
    </div>
  );
};

// ── SEARCH OVERLAY ────────────────────────────────────────────────────────
const SearchOverlay = ({ skills, onClose, onSelect }) => {
  const [q,setQ]=useState("");
  const inputRef=useRef();
  useEffect(()=>{inputRef.current?.focus();},[]);
  const results=q.length>1?skills.filter(s=>s.name.toLowerCase().includes(q.toLowerCase())||s.category.toLowerCase().includes(q.toLowerCase())||s.sector.toLowerCase().includes(q.toLowerCase())).slice(0,6):[];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:100,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{width:"min(660px,90vw)",background:"white",borderRadius:16,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"20px 22px",borderBottom:results.length||q.length?"1px solid #f3f4f6":"none"}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#9ca3af" strokeWidth="1.5"/><path d="M13 13l2.5 2.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search skills, categories, sectors…" style={{flex:1,border:"none",outline:"none",fontSize:16,color:"#111827",fontFamily:"inherit",background:"transparent"}}/>
          <button onClick={onClose} style={{background:"#f3f4f6",border:"none",color:"#6b7280",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500}}>esc</button>
        </div>
        {results.map(s=>(
          <button key={s.id} onClick={()=>{onSelect(s);onClose();}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"14px 22px",background:"white",border:"none",borderBottom:"1px solid #f9fafb",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            <div><div style={{fontSize:15,fontWeight:600,color:"#111827",marginBottom:3}}>{s.name}</div><div style={{fontSize:13,color:"#9ca3af"}}>{s.sector} · {s.category}</div></div>
            <span style={{fontSize:20,fontWeight:700,color:"#111827"}}>{s.priority.toFixed(1)}</span>
          </button>
        ))}
        {q.length>1&&!results.length&&<div style={{padding:"36px 22px",textAlign:"center",color:"#9ca3af",fontSize:14}}>No skills found for "{q}"</div>}
        {!q.length&&(
          <div style={{padding:"18px 22px"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10}}>Suggested</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["AI & Digitalisation","Sustainability","Quick wins","Emerging","Retail","Zorg"].map(tag=>(
                <button key={tag} onClick={()=>setQ(tag)} style={{background:"#f3f4f6",border:"none",color:"#6b7280",padding:"7px 14px",borderRadius:20,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>{tag}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── AI CHAT OVERLAY ───────────────────────────────────────────────────────
const AiChatOverlay = ({ onClose }) => {
  const [messages, setMessages] = useState([{role:"ai",text:"Hi there! 👋 How can I help you today? I can analyse your skills landscape, suggest priorities, or find funding options."}]);
  const [input, setInput] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const inputRef = useRef();
  useEffect(()=>{inputRef.current?.focus();},[]);

  const suggestions = [
    "Most important skills in 3 years for a welding company in Eindhoven?",
    "Which quick wins to prioritise this quarter?",
    "AI Literacy vs Human-AI Collaboration — which first?",
    "Funding available for upskilling in Zorg?",
  ];
  const showSuggestions = messages.length === 1; // only after initial greeting

  const send = (text) => {
    const q = text || input;
    if (!q.trim()) return;
    setMessages(prev => [...prev, {role:"user",text:q}]);
    setInput("");
    setIsAnalysing(true);
    setTimeout(()=>{
      setIsAnalysing(false);
      setMessages(prev => [...prev, {role:"ai",text:"Based on your sector profile and current skill landscape, I'd recommend focusing on AI Literacy and Human-AI Collaboration first — both are emerging fast with high impact and low effort. The SLIM Regeling 2026 funding is available to cover training costs. In the full version, this connects to the Summa AI engine for personalised recommendations."}]);
    }, 2000);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:80,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{width:"min(640px,90vw)",background:"white",borderRadius:18,boxShadow:"0 24px 60px rgba(0,0,0,0.2)",overflow:"hidden",display:"flex",flexDirection:"column",maxHeight:"70vh"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:"1px solid #f3f4f6"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:8,background:"#111827",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:"#111827"}}>Summa AI Agent</div>
          </div>
          <button onClick={onClose} style={{background:"#f3f4f6",border:"none",color:"#6b7280",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
              <div style={{maxWidth:"80%",background:m.role==="user"?"#111827":"#f3f4f6",color:m.role==="user"?"white":"#374151",padding:"12px 16px",borderRadius:14,fontSize:15,lineHeight:1.6}}>
                {m.text}
              </div>
            </div>
          ))}
          {/* Suggestion chips inside chat */}
          {showSuggestions && (
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4,marginBottom:8}}>
              {suggestions.map((s,i)=>(
                <button key={i} onClick={()=>send(s)} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:20,padding:"8px 14px",textAlign:"left",fontSize:13,color:"#374151",fontFamily:"inherit",cursor:"pointer",lineHeight:1.4,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="#f9fafb";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.background="white";}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {isAnalysing && (
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0"}}>
              <div style={{display:"flex",gap:4}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#9ca3af",animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                ))}
              </div>
              <span style={{fontSize:13,color:"#9ca3af",fontStyle:"italic"}}>Analysing your skills landscape…</span>
            </div>
          )}
        </div>

        <div style={{padding:"14px 22px",borderTop:"1px solid #f3f4f6",display:"flex",gap:10}}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about skills, trends, strategy…" style={{flex:1,border:"1.5px solid #e5e7eb",borderRadius:10,padding:"11px 14px",fontSize:14,fontFamily:"inherit",outline:"none",color:"#111827"}}/>
          <button onClick={()=>send()} style={{background:"#111827",border:"none",color:"white",padding:"11px 18px",borderRadius:10,fontSize:14,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>Send</button>
        </div>
      </div>
    </div>
  );
};

// ── CHART CARDS ───────────────────────────────────────────────────────────

// A — Priority Matrix (Hero) — Clean dashboard thumbnail
const PriorityMatrixCard = ({ skills, expanded, onToggle, onSelectSkill }) => {
  const nonDeclining = skills.filter(s=>s.status!=="Declining");
  const quickWins = nonDeclining.filter(s=>s.quickWin).length;
  const avgPriority = (nonDeclining.reduce((a,s)=>a+s.priority,0)/nonDeclining.length).toFixed(1);
  const highImpact = nonDeclining.filter(s=>s.impact>=8).length;

  if (!expanded) {
    // Quadrant counts: quickwins = low effort + high impact, strategic = high effort + high impact, etc.
    const qw = nonDeclining.filter(s=>s.effort<=5&&s.impact>=7).length;
    const strategic = nonDeclining.filter(s=>s.effort>5&&s.impact>=7).length;
    const lowPri = nonDeclining.filter(s=>s.effort<=5&&s.impact<7).length;
    const reconsider = nonDeclining.filter(s=>s.effort>5&&s.impact<7).length;

    return (
      <div className="chart-card" style={{background:"white",border:"1px solid #ececec",borderRadius:14,padding:"22px",cursor:"pointer",height:"100%",position:"relative",overflow:"hidden"}} onClick={onToggle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Priority Matrix</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <InfoIcon tooltip={chartTooltips.matrix}/>
            <ExpandBtn onClick={onToggle}/>
          </div>
        </div>
        <div className="card-content-reveal">
          {/* 2x2 quadrant grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <div style={{background:"#f0fdf4",borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:700,color:"#059669",lineHeight:1}}>{qw}</div>
              <div style={{fontSize:11,color:"#059669",fontWeight:600,marginTop:4,opacity:0.8}}>Quick wins</div>
            </div>
            <div style={{background:"#fefce8",borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:700,color:"#b45309",lineHeight:1}}>{strategic}</div>
              <div style={{fontSize:11,color:"#b45309",fontWeight:600,marginTop:4,opacity:0.8}}>Strategic</div>
            </div>
            <div style={{background:"#f9fafb",borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:700,color:"#9ca3af",lineHeight:1}}>{lowPri}</div>
              <div style={{fontSize:11,color:"#9ca3af",fontWeight:600,marginTop:4}}>Low priority</div>
            </div>
            <div style={{background:"#fef2f2",borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:700,color:"#dc2626",lineHeight:1,opacity:0.7}}>{reconsider}</div>
              <div style={{fontSize:11,color:"#dc2626",fontWeight:600,marginTop:4,opacity:0.6}}>Reconsider</div>
            </div>
          </div>
          {/* Axis labels */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontSize:10,color:"#d1d5db"}}>↑ Impact</span>
            <span style={{fontSize:10,color:"#d1d5db"}}>Effort →</span>
          </div>
        </div>
      </div>
    );
  }

  // Expanded view — proper quadrant chart
  const W=760, H=480, PAD=60, INNER_W=W-PAD-20, INNER_H=H-PAD-30;
  return (
    <div style={{background:"white",borderRadius:14,padding:"28px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#111827"}}>Priority Matrix</div>
          <div style={{fontSize:13,color:"#9ca3af",marginTop:3}}>Impact (vertical) vs Effort (horizontal) — top-left = quick wins</div>
        </div>
        <button onClick={onToggle} style={{background:"#f3f4f6",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#6b7280"}}>✕</button>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",overflow:"visible"}}>
        {/* Quadrant fills */}
        <rect x={PAD} y={10} width={INNER_W/2} height={INNER_H/2} fill="#f0fdf4" rx="6"/>
        <rect x={PAD+INNER_W/2} y={10} width={INNER_W/2} height={INNER_H/2} fill="#fefce8" rx="6"/>
        <rect x={PAD} y={10+INNER_H/2} width={INNER_W/2} height={INNER_H/2} fill="#f9fafb" rx="6"/>
        <rect x={PAD+INNER_W/2} y={10+INNER_H/2} width={INNER_W/2} height={INNER_H/2} fill="#fef2f2" rx="6"/>
        {/* Quadrant labels */}
        <text x={PAD+12} y={30} fontSize="12" fill="#059669" fontWeight="600" opacity="0.8">Quick wins</text>
        <text x={PAD+INNER_W/2+12} y={30} fontSize="12" fill="#b45309" fontWeight="600" opacity="0.7">Strategic</text>
        <text x={PAD+12} y={INNER_H+4} fontSize="12" fill="#9ca3af" fontWeight="600" opacity="0.7">Low priority</text>
        <text x={PAD+INNER_W/2+12} y={INNER_H+4} fontSize="12" fill="#dc2626" fontWeight="600" opacity="0.6">Reconsider</text>
        {/* Axes */}
        <line x1={PAD} y1={10+INNER_H} x2={PAD+INNER_W} y2={10+INNER_H} stroke="#e5e7eb" strokeWidth="1"/>
        <line x1={PAD} y1={10} x2={PAD} y2={10+INNER_H} stroke="#e5e7eb" strokeWidth="1"/>
        <text x={PAD+INNER_W/2} y={H-4} fontSize="12" fill="#9ca3af" textAnchor="middle" fontWeight="500">Effort →</text>
        <text x={16} y={10+INNER_H/2} fontSize="12" fill="#9ca3af" textAnchor="middle" fontWeight="500" transform={`rotate(-90,16,${10+INNER_H/2})`}>Impact →</text>
        {/* Grid lines */}
        {[2,4,6,8].map(v=>(
          <g key={v}>
            <line x1={PAD} y1={10+INNER_H-(v/10)*INNER_H} x2={PAD+INNER_W} y2={10+INNER_H-(v/10)*INNER_H} stroke="#f3f4f6" strokeWidth="0.5"/>
            <text x={PAD-8} y={10+INNER_H-(v/10)*INNER_H+4} fontSize="10" fill="#d1d5db" textAnchor="end">{v}</text>
            <line x1={PAD+(v/10)*INNER_W} y1={10} x2={PAD+(v/10)*INNER_W} y2={10+INNER_H} stroke="#f3f4f6" strokeWidth="0.5"/>
            <text x={PAD+(v/10)*INNER_W} y={10+INNER_H+16} fontSize="10" fill="#d1d5db" textAnchor="middle">{v}</text>
          </g>
        ))}
        {/* Dots with labels */}
        {nonDeclining.map(s => {
          const x = PAD + (s.effort/10)*INNER_W;
          const y = 10 + INNER_H - (s.impact/10)*INNER_H;
          const r = 6 + s.trending*0.4;
          return (
            <g key={s.id} style={{cursor:"pointer"}} onClick={(e)=>{e.stopPropagation();onSelectSkill(s);}}>
              <circle cx={x} cy={y} r={r} fill={s.quickWin?"#059669":"#2563eb"} opacity="0.75" stroke="white" strokeWidth="2"/>
              <text x={x+r+5} y={y+4} fontSize="11" fill="#374151" fontWeight="500">{s.name.length>30?s.name.slice(0,28)+"…":s.name}</text>
            </g>
          );
        })}
        {/* Legend */}
        <circle cx={PAD+INNER_W-120} cy={H-14} r="5" fill="#059669" opacity="0.75"/><text x={PAD+INNER_W-110} y={H-10} fontSize="11" fill="#6b7280">Quick win</text>
        <circle cx={PAD+INNER_W-40} cy={H-14} r="5" fill="#2563eb" opacity="0.75"/><text x={PAD+INNER_W-30} y={H-10} fontSize="11" fill="#6b7280">Other</text>
      </svg>
    </div>
  );
};

// B — Trending Velocity
const TrendingVelocityCard = ({ skills, expanded, onToggle }) => {
  const sorted = [...skills].filter(s=>s.status!=="Declining").sort((a,b)=>b.trending-a.trending);
  const top = expanded ? sorted : sorted.slice(0,8);
  const maxT = Math.max(...sorted.map(s=>s.trending));

  if (!expanded) {
    return (
      <div className="chart-card" style={{background:"white",border:"1px solid #ececec",borderRadius:14,padding:"22px",cursor:"pointer",height:"100%",display:"flex",flexDirection:"column"}} onClick={onToggle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Trending Velocity</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <InfoIcon tooltip={chartTooltips.trending}/>
            <ExpandBtn onClick={onToggle}/>
          </div>
        </div>
        <div className="card-content-reveal" style={{display:"flex",flexDirection:"column",gap:5,flex:1,justifyContent:"space-between"}}>
          {sorted.slice(0,8).map((s,i)=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:"#9ca3af",width:14,flexShrink:0}}>{i+1}</span>
              <div style={{flex:1,height:6,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(s.trending/maxT)*100}%`,background:s.trending>8?"#059669":"#2563eb",borderRadius:99}}/>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:"#111827",minWidth:22,textAlign:"right"}}>{s.trending.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"white",borderRadius:14,padding:"28px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#111827"}}>Trending Velocity</div>
          <div style={{fontSize:13,color:"#9ca3af",marginTop:3}}>Skills ranked by trending score — fastest rising first</div>
        </div>
        <button onClick={onToggle} style={{background:"#f3f4f6",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#6b7280"}}>✕</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {top.map((s,i)=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:13,fontWeight:700,color:"#9ca3af",width:24,textAlign:"right",flexShrink:0}}>{i+1}</span>
            <span style={{fontSize:14,color:"#374151",fontWeight:500,width:260,flexShrink:0}}>{s.name}</span>
            <div style={{flex:1,height:10,background:"#f3f4f6",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(s.trending/maxT)*100}%`,background:s.trending>8?"#059669":"#2563eb",borderRadius:99,transition:"width 0.4s"}}/>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:"#111827",minWidth:30,textAlign:"right"}}>{s.trending.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// C — Skill Status Donut (2 donuts: status + type)
const StatusDonutCard = ({ skills, expanded, onToggle }) => {
  const emerging = skills.filter(s=>s.status==="Emerging").length;
  const established = skills.filter(s=>s.status==="Established").length;
  const declining = skills.filter(s=>s.status==="Declining").length;
  const tools = skills.filter(s=>s.type==="Tool").length;
  const hard = skills.filter(s=>s.type==="Hard Skill").length;
  const soft = skills.filter(s=>s.type==="Soft Skill").length;
  const meth = skills.filter(s=>s.type==="Methodology").length;
  const total = skills.length;

  const MiniDonut = ({data, colors, size=28, sw=6, label}) => {
    const circ = 2*Math.PI*size;
    let offset = 0;
    return (
      <svg width={size*2+sw} height={size*2+sw} viewBox={`0 0 ${size*2+sw} ${size*2+sw}`}>
        <circle cx={size+sw/2} cy={size+sw/2} r={size} fill="none" stroke="#f3f4f6" strokeWidth={sw}/>
        {data.map((d,i)=>{
          const dash = (d.v/total)*circ;
          const el = <circle key={i} cx={size+sw/2} cy={size+sw/2} r={size} fill="none" stroke={colors[i]} strokeWidth={sw} strokeDasharray={`${dash} ${circ}`} strokeDashoffset={`${-offset}`} transform={`rotate(-90 ${size+sw/2} ${size+sw/2})`} strokeLinecap="round"/>;
          offset += dash;
          return el;
        })}
        <text x={size+sw/2} y={size+sw/2+1} textAnchor="middle" fontSize={expanded?14:10} fontWeight="700" fill="#111827">{total}</text>
        {expanded&&<text x={size+sw/2} y={size+sw/2+14} textAnchor="middle" fontSize="9" fill="#9ca3af">{label}</text>}
      </svg>
    );
  };

  const statusData = [{v:emerging},{v:established},{v:declining}];
  const statusColors = ["#059669","#2563eb","#d1d5db"];
  const typeData = [{v:tools},{v:hard},{v:soft},{v:meth}];
  const typeColors = ["#6366f1","#059669","#f59e0b","#6b7280"];

  if (!expanded) {
    return (
      <div className="chart-card" style={{background:"white",border:"1px solid #ececec",borderRadius:14,padding:"22px",cursor:"pointer",height:"100%",display:"flex",flexDirection:"column"}} onClick={onToggle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Skill Landscape</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}><InfoIcon tooltip={chartTooltips.donut}/><ExpandBtn onClick={onToggle}/></div>
        </div>
        <div className="card-content-reveal" style={{display:"flex",flexDirection:"column",gap:14,flex:1,justifyContent:"center"}}>
          {/* Lifecycle donut */}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <MiniDonut data={statusData} colors={statusColors} size={30} sw={6}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:"#6b7280",marginBottom:4}}>Lifecycle</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[{l:"Emerging",c:emerging,cl:"#059669"},{l:"Established",c:established,cl:"#2563eb"},{l:"Declining",c:declining,cl:"#d1d5db"}].map(x=>(
                  <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:x.cl}}/>
                    <span style={{fontSize:11,color:"#6b7280"}}>{x.c} {x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Type donut */}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <MiniDonut data={typeData} colors={typeColors} size={30} sw={6}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:"#6b7280",marginBottom:4}}>Skill type</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {[{l:"Tool",c:tools,cl:"#6366f1"},{l:"Hard Skill",c:hard,cl:"#059669"},{l:"Soft Skill",c:soft,cl:"#f59e0b"},{l:"Methodology",c:meth,cl:"#6b7280"}].map(x=>(
                  <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:x.cl}}/>
                    <span style={{fontSize:11,color:"#6b7280"}}>{x.c} {x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"white",borderRadius:14,padding:"32px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <div style={{fontSize:20,fontWeight:700,color:"#111827"}}>Skill Landscape</div>
          <div style={{fontSize:13,color:"#9ca3af",marginTop:3}}>Breakdown by lifecycle stage and skill type</div>
        </div>
        <button onClick={onToggle} style={{background:"#f3f4f6",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#6b7280"}}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40}}>
        {/* Lifecycle column */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{fontSize:14,fontWeight:600,color:"#374151"}}>Lifecycle stage</div>
          <MiniDonut data={statusData} colors={statusColors} size={70} sw={14} label=""/>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignSelf:"stretch"}}>
            {[{l:"Emerging",c:emerging,cl:"#059669",desc:"New skills gaining traction"},{l:"Established",c:established,cl:"#2563eb",desc:"Mature, stable demand"},{l:"Declining",c:declining,cl:"#d1d5db",desc:"Fading relevance"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#f9fafb",borderRadius:8}}>
                <span style={{width:12,height:12,borderRadius:"50%",background:x.cl,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#374151"}}>{x.c} {x.l}</div>
                  <div style={{fontSize:12,color:"#9ca3af"}}>{x.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Type column */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{fontSize:14,fontWeight:600,color:"#374151"}}>Skill type</div>
          <MiniDonut data={typeData} colors={typeColors} size={70} sw={14} label=""/>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignSelf:"stretch"}}>
            {[{l:"Tool",c:tools,cl:"#6366f1",desc:"Software & platform proficiency"},{l:"Hard Skill",c:hard,cl:"#059669",desc:"Technical, measurable abilities"},{l:"Soft Skill",c:soft,cl:"#f59e0b",desc:"Interpersonal & cognitive"},{l:"Methodology",c:meth,cl:"#6b7280",desc:"Frameworks & processes"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#f9fafb",borderRadius:8}}>
                <span style={{width:12,height:12,borderRadius:"50%",background:x.cl,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#374151"}}>{x.c} {x.l}</div>
                  <div style={{fontSize:12,color:"#9ca3af"}}>{x.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// G — Urgency Heatmap
const UrgencyHeatmapCard = ({ skills, expanded, onToggle }) => {
  const sorted = [...skills].filter(s=>s.status!=="Declining").sort((a,b)=>b.urgency-a.urgency);
  const getColor = v => v>=8.5?"#991b1b":v>=7.5?"#dc2626":v>=6.5?"#f97316":v>=5.5?"#fbbf24":"#d1d5db";

  if (!expanded) {
    return (
      <div className="chart-card" style={{background:"white",border:"1px solid #ececec",borderRadius:14,padding:"22px",cursor:"pointer",height:"100%",display:"flex",flexDirection:"column"}} onClick={onToggle}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Urgency Heatmap</div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <InfoIcon tooltip={chartTooltips.urgency}/>
            <ExpandBtn onClick={onToggle}/>
          </div>
        </div>
        <div className="card-content-reveal" style={{display:"flex",flexDirection:"column",gap:4,flex:1,justifyContent:"space-between"}}>
          {sorted.slice(0,8).map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:14,borderRadius:2,background:getColor(s.urgency),flexShrink:0}}/>
              <span style={{fontSize:10,color:"#374151",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name.split(" ").slice(0,3).join(" ")}</span>
              <span style={{fontSize:10,fontWeight:700,color:getColor(s.urgency)}}>{s.urgency.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"white",borderRadius:14,padding:"28px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#111827"}}>Urgency Heatmap</div>
          <div style={{fontSize:13,color:"#9ca3af",marginTop:3}}>Skills ranked by urgency — darker = more time-sensitive</div>
        </div>
        <button onClick={onToggle} style={{background:"#f3f4f6",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#6b7280"}}>✕</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sorted.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:10,height:26,borderRadius:4,background:getColor(s.urgency),flexShrink:0}}/>
            <span style={{fontSize:14,color:"#374151",flex:1,fontWeight:500}}>{s.name}</span>
            <span style={{fontSize:14,fontWeight:700,color:getColor(s.urgency)}}>{s.urgency.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartModal = ({ children, onClose }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}} onClick={onClose}>
    <div style={{width:"min(880px,92vw)",maxHeight:"85vh",overflowY:"auto",background:"white",borderRadius:18,boxShadow:"0 24px 60px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// ── SKILL DETAIL (Slide-in) ──────────────────────────────────────────────
const SkillDetail = ({ skill, onClose, saved, onToggleSave }) => {
  const [openScore,setOpenScore]=useState(null);
  const [showTrends,setShowTrends]=useState(false);
  const dec=skill.status==="Declining";
  const scoreR={Impact:"Appears across multiple sectors with strong source consensus. Missing this skill creates direct operational risk.",Effort:"Learnable in under 12 hours of structured training. No prior technical knowledge required for most roles.",Trending:"Source mentions increased significantly over last 3 sweeps. Signal accelerating, not plateauing.",Urgency:"Competitive and regulatory pressure converging in 2026. Early adopters already gaining measurable advantage."};
  const trends = skillTrends[skill.id] || skillTrends.default;
  const bulletData = skillBulletExamples[skill.id] || skillBulletExamples.default;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"24px 28px 18px",borderBottom:"1px solid #f3f4f6",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,paddingRight:12}}>
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
              <StatusDot status={skill.status}/><span style={{color:"#e5e7eb"}}>·</span>
              <TypeTag type={skill.type}/><span style={{color:"#e5e7eb"}}>·</span>
              <span style={{fontSize:13,color:"#9ca3af"}}>{skill.sector}</span>
              {skill.quickWin&&<><span style={{color:"#e5e7eb"}}>·</span><span style={{fontSize:12,fontWeight:600,color:"#d97706",background:"#fffbeb",padding:"2px 10px",borderRadius:20}}>⚡ Quick win</span></>}
              {skill.summaRecommended&&<><span style={{color:"#e5e7eb"}}>·</span><SummaPick/></>}
            </div>
            <h2 style={{fontSize:22,fontWeight:700,color:dec?"#9ca3af":"#111827",lineHeight:1.2,letterSpacing:"-0.025em"}}>{skill.name}</h2>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>onToggleSave(skill.id)} style={{display:"flex",alignItems:"center",gap:5,background:saved?"#fef2f2":"none",border:`1px solid ${saved?"#fecaca":"#e5e7eb"}`,color:saved?"#dc2626":"#6b7280",padding:"7px 13px",borderRadius:8,fontSize:13,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill={saved?"#ef4444":"none"} stroke={saved?"#ef4444":"currentColor"} strokeWidth="1.8"><path d="M10 17.5s-7-4.5-7-9.5a4 4 0 017-2.6A4 4 0 0117 8c0 5-7 9.5-7 9.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {saved?"Saved":"Save"}
            </button>
            <button onClick={onClose} style={{background:"#f3f4f6",border:"none",color:"#6b7280",width:34,height:34,borderRadius:8,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 28px 40px"}}>
        {/* Description + bullets */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <p style={{fontSize:15,color:"#4b5563",lineHeight:1.75,marginBottom:14}}>{skill.desc}</p>
          <p style={{fontSize:15,color:"#4b5563",lineHeight:1.75,marginBottom:16}}>As this domain evolves, professionals will need to move from basic operation toward supervision and quality control — auditing outputs and maintaining the human layer that automation cannot replicate.</p>
          <div style={{fontSize:12,fontWeight:600,color:"#6b7280",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>{bulletData.title}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {bulletData.bullets.map((b,i)=>(
              <div key={i} style={{paddingLeft:14,borderLeft:"2px solid #e5e7eb"}}>
                <div style={{fontSize:14,color:"#374151",lineHeight:1.6}}>{b.text}</div>
                <div style={{fontSize:12,color:"#9ca3af",marginTop:2,fontStyle:"italic"}}>{b.example}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority / Trending / Evidence — FIXED: proper grid layout */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,border:"1px solid #f3f4f6",borderRadius:12,overflow:"hidden"}}>
            {[
              {label:"Priority",value:skill.priority.toFixed(1),sub:"impact ÷ effort"},
              {label:"Trending",value:skill.trending.toFixed(1),sub:"score"},
              {label:"Evidence",value:skill.sourceCount,sub:`${skill.trendCount} trends`},
            ].map((s,i)=>(
              <div key={i} style={{padding:"16px 18px",background:"#fafafa",borderRight:i<2?"1px solid #f3f4f6":"none"}}>
                <div style={{fontSize:11,color:"#9ca3af",fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:7}}>{s.label}</div>
                <div style={{fontSize:24,fontWeight:700,color:dec?"#9ca3af":"#111827",letterSpacing:"-0.03em",lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12,color:"#d1d5db",marginTop:4}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why this skill matters */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>Why this skill matters</div>
          {trends.slice(0,2).map((t,i,arr)=>(
            <div key={i} style={{display:"flex",gap:12}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:3}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#f3f4f6",border:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#6b7280",flexShrink:0}}>{i+1}</div>
                {i<arr.length&&<div style={{width:1,flex:1,minHeight:18,background:"#e5e7eb",margin:"3px 0"}}/>}
              </div>
              <div style={{paddingBottom:14,flex:1}}>
                <div style={{fontSize:12,color:"#9ca3af",marginBottom:3}}>{t.level} · {t.sources} sources</div>
                <div style={{fontSize:14,color:"#374151",fontWeight:500,lineHeight:1.45}}>{t.title}</div>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:12}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"#111827",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/></div>
            <div style={{flex:1,background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:"11px 14px"}}>
              <div style={{fontSize:11,color:"#9ca3af",marginBottom:2}}>Derived skill</div>
              <div style={{fontSize:14,color:"#111827",fontWeight:600}}>{skill.name}</div>
            </div>
          </div>
          <button onClick={()=>setShowTrends(!showTrends)} style={{background:"none",border:"1px solid #e5e7eb",color:"#6b7280",borderRadius:8,padding:"9px 16px",fontSize:13,fontFamily:"inherit",cursor:"pointer",width:"100%",marginTop:12}}
            onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            {showTrends?"Hide contributing trends":`Show all ${skill.trendCount} contributing trends`}
          </button>
          {showTrends&&(
            <div style={{marginTop:12,background:"#f9fafb",borderRadius:10,border:"1px solid #e5e7eb",overflow:"hidden"}}>
              {trends.map((t,i)=>(
                <div key={i} style={{padding:"10px 14px",borderBottom:i<trends.length-1?"1px solid #f3f4f6":"none"}}>
                  <div style={{fontSize:13,color:"#374151",fontWeight:500}}>{t.title}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{t.level} · {t.sources} sources</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scores */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Scores</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"Impact",v:skill.impact},{l:"Effort",v:skill.effort},{l:"Trending",v:skill.trending},{l:"Urgency",v:skill.urgency}].map(s=>(
              <Tooltip key={s.l} text={scoreTooltips[s.l]} maxWidth={180}>
                <div onClick={()=>setOpenScore(openScore===s.l?null:s.l)} style={{background:"#f9fafb",border:`1px solid ${openScore===s.l?"#d1d5db":"#f3f4f6"}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",width:"100%"}}>
                  <div style={{fontSize:11,color:"#9ca3af",fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>{s.l}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
                    <div style={{fontSize:26,fontWeight:700,color:dec?"#9ca3af":"#111827",letterSpacing:"-0.03em",lineHeight:1}}>{s.v.toFixed(1)}</div>
                    <Bars value={s.v} declining={dec}/>
                  </div>
                  <div style={{height:3,background:"#e5e7eb",borderRadius:99}}><div style={{height:"100%",width:`${s.v*10}%`,background:dec?"#d1d5db":"#111827",borderRadius:99}}/></div>
                  {openScore===s.l&&<div style={{marginTop:10,fontSize:13,color:"#6b7280",lineHeight:1.65,borderTop:"1px solid #e5e7eb",paddingTop:8}}>{scoreR[s.l]}</div>}
                </div>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Evidence</div>
          {[{source:"INretail Sector Outlook 2026",publisher:"INretail",authority:8,date:"Feb 2026",text:"Over 70% of mid-to-large retailers have deployed or are piloting AI-assisted customer interaction tools."},{source:"WEF Future of Jobs 2025",publisher:"World Economic Forum",authority:10,date:"Jan 2025",text:"AI literacy and human-AI collaboration rank among the top five fastest-growing competencies in Europe."}].map((e,i)=>(
            <div key={i} style={{border:"1px solid #f3f4f6",borderRadius:10,padding:"14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontSize:14,fontWeight:600,color:"#374151"}}>{e.source}</div><div style={{fontSize:12,color:"#9ca3af"}}>{e.publisher} · {e.date}</div></div>
                <span style={{fontSize:12,fontWeight:600,color:"#6b7280",background:"#f9fafb",border:"1px solid #e5e7eb",padding:"2px 8px",borderRadius:6,height:"fit-content"}}>{e.authority}/10</span>
              </div>
              <p style={{fontSize:13,color:"#6b7280",lineHeight:1.6,borderLeft:"2px solid #e5e7eb",paddingLeft:10}}>"{e.text}"</p>
            </div>
          ))}
        </div>

        {/* Training */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Available training</div>
          {["AI in Retail — Practical Skills|Blended|2 days","AI Literacy for Customer Service|Online|8 hours"].map((c,i)=>{const[name,fmt,dur]=c.split("|");return(
            <div key={i} style={{background:"#111827",borderRadius:10,padding:"14px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="#1f2937"}
              onMouseLeave={e=>e.currentTarget.style.background="#111827"}>
              <div><div style={{fontSize:14,fontWeight:600,color:"white"}}>{name}</div><div style={{fontSize:12,color:"#6b7280"}}>{fmt} · {dur}</div></div>
              <span style={{color:"#6b7280"}}>→</span>
            </div>
          );})}
        </div>

        {/* Funding — with sector labels */}
        <div style={{paddingTop:20,paddingBottom:20,borderBottom:"1px solid #f3f4f6"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Funding</div>
          {[{name:"SLIM Regeling 2026",amount:"€2.500",deadline:"1 Jun 2026",urgent:true,scope:"Generally available"},{name:"O&O Fonds Retail",amount:"€1.800",deadline:"15 Sep 2026",urgent:false,scope:"Retail sector"}].map((f,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i===0?"1px solid #f3f4f6":"none"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:14,fontWeight:500,color:"#374151"}}>{f.name}</div>
                  <span style={{fontSize:10,fontWeight:600,color:f.scope==="Generally available"?"#059669":"#2563eb",background:f.scope==="Generally available"?"#f0fdf4":"#eff6ff",padding:"2px 7px",borderRadius:4}}>{f.scope}</span>
                </div>
                <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Deadline {f.deadline}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:17,fontWeight:700,color:"#111827"}}>{f.amount}</div>
                {f.urgent&&<div style={{fontSize:11,color:"#d97706",fontWeight:600}}>Closing soon</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{paddingTop:20}}>
          <button style={{width:"100%",background:"#111827",border:"none",color:"white",borderRadius:10,padding:"14px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}
            onMouseEnter={e=>e.currentTarget.style.background="#1f2937"}
            onMouseLeave={e=>e.currentTarget.style.background="#111827"}>Export summary as PDF</button>
        </div>
      </div>
    </div>
  );
};

// ── TAG CAROUSEL ─────────────────────────────────────────────────────────
const TagCarousel = ({ children }) => {
  const scrollRef = useRef();
  const [canScrollRight, setCanScrollRight] = useState(true);
  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };
  useEffect(()=>{checkScroll();},[]);
  const scrollRight = (e) => {
    e.stopPropagation();
    scrollRef.current?.scrollBy({left:120,behavior:"smooth"});
    setTimeout(checkScroll, 300);
  };
  return (
    <div style={{display:"flex",alignItems:"center",flex:1,overflow:"hidden",position:"relative"}}>
      <div ref={scrollRef} onScroll={checkScroll} style={{display:"flex",gap:5,overflow:"auto",scrollbarWidth:"none",msOverflowStyle:"none",flex:1,maskImage:canScrollRight?"linear-gradient(to right, black 80%, transparent 100%)":undefined,WebkitMaskImage:canScrollRight?"linear-gradient(to right, black 80%, transparent 100%)":undefined}}>
        {children}
      </div>
      {canScrollRight&&(
        <button onClick={scrollRight} style={{position:"absolute",right:0,width:22,height:22,borderRadius:"50%",background:"white",border:"1px solid #e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,boxShadow:"0 1px 4px rgba(0,0,0,0.08)",zIndex:2,transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="#f3f4f6"}
          onMouseLeave={e=>e.currentTarget.style.background="white"}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 1.5l4 3.5-4 3.5" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
    </div>
  );
};

// ── SAVED SKILLS PANEL ──────────────────────────────────────────────────
const SavedPanel = ({ savedIds, skills, onClose, onSelect }) => {
  const savedList = skills.filter(s=>savedIds.has(s.id));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}} onClick={onClose}>
      <div style={{width:"min(500px,90vw)",maxHeight:"70vh",background:"white",borderRadius:18,boxShadow:"0 24px 60px rgba(0,0,0,0.15)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:700,color:"#111827"}}>Saved items</div>
          <button onClick={onClose} style={{background:"#f3f4f6",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6b7280"}}>✕</button>
        </div>
        <div style={{overflowY:"auto",maxHeight:"55vh"}}>
          {savedList.length===0&&<div style={{padding:"40px 24px",textAlign:"center",color:"#9ca3af",fontSize:14}}>No saved items yet. Use the heart icon on any skill to save it.</div>}
          {savedList.map(s=>(
            <div key={s.id} onClick={()=>{onSelect(s);onClose();}} style={{padding:"14px 24px",borderBottom:"1px solid #f9fafb",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
              onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#111827"}}>{s.name}</div>
                <div style={{fontSize:12,color:"#9ca3af"}}>{s.sector} · {s.type}</div>
              </div>
              <span style={{fontSize:18,fontWeight:700,color:"#111827"}}>{s.priority.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── MAIN ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;
const HIGHLIGHT_PAGE_SIZE = 9;
const tabs = ["Skills","Trends","Sources","Funding"];

export default function App() {
  const [activeTab,setActiveTab]=useState("Skills");
  const [view,setView]=useState("highlights");
  const [selectedSkill,setSelectedSkill]=useState(null);
  const [panelMounted,setPanelMounted]=useState(false);
  const [sortBy,setSortBy]=useState("priority");
  const [searchOpen,setSearchOpen]=useState(false);
  const [aiChatOpen,setAiChatOpen]=useState(false);
  const [savedPanelOpen,setSavedPanelOpen]=useState(false);
  const [pulseVisible,setPulseVisible]=useState(true);
  const [page,setPage]=useState(1);
  const [savedSkills,setSavedSkills]=useState(new Set());
  const [expandedChart,setExpandedChart]=useState(null);
  const [accountOpen,setAccountOpen]=useState(false);
  const [chartsLoaded,setChartsLoaded]=useState(false);
  const [hoveredRow,setHoveredRow]=useState(null);
  const [hoveredCard,setHoveredCard]=useState(null);
  const accountRef=useRef();

  const [fSector,setFSector]=useState([]);
  const [fImpact,setFImpact]=useState([]);
  const [fEffort,setFEffort]=useState([]);
  const [fHorizon,setFHorizon]=useState([]);
  const [fQW,setFQW]=useState(false);
  const [searchQ,setSearchQ]=useState("");

  useEffect(()=>{setTimeout(()=>setChartsLoaded(true),100);},[]);
  useEffect(()=>{
    const h=e=>{if(accountRef.current&&!accountRef.current.contains(e.target))setAccountOpen(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const toggleSave = (id) => {
    setSavedSkills(prev => {const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});
  };
  const openSkill=s=>{setSelectedSkill(s);setTimeout(()=>setPanelMounted(true),20);};
  const closeSkill=()=>{setPanelMounted(false);setTimeout(()=>setSelectedSkill(null),420);};

  const impactInRange=(v,opts)=>{if(!opts.length)return true;return opts.some(o=>o.includes("9–10")?v>=9:o.includes("7–8")?v>=7&&v<9:o.includes("5–6")?v>=5&&v<7:o.includes("1–4")?v<5:true);};
  const effortInRange=(v,opts)=>{if(!opts.length)return true;return opts.some(o=>o.includes("1–2")?v<=2:o.includes("3–4")?v>=3&&v<=4:o.includes("5–6")?v>=5&&v<=6:o.includes("7–10")?v>=7:true);};
  const clearAll=()=>{setFSector([]);setFImpact([]);setFEffort([]);setFHorizon([]);setFQW(false);setSearchQ("");};
  const activeCount=[fSector,fImpact,fEffort,fHorizon].filter(a=>a.length>0).length+(fQW?1:0)+(searchQ?1:0);

  const filtered=allSkills
    .filter(s=>fSector.length?fSector.includes(s.sector):true)
    .filter(s=>impactInRange(s.impact,fImpact))
    .filter(s=>effortInRange(s.effort,fEffort))
    .filter(s=>fHorizon.length?fHorizon.includes(s.horizon):true)
    .filter(s=>fQW?s.quickWin:s.status!=="Declining")
    .filter(s=>searchQ?s.name.toLowerCase().includes(searchQ.toLowerCase())||s.category.toLowerCase().includes(searchQ.toLowerCase()):true)
    .sort((a,b)=>sortBy==="priority"?b.priority-a.priority:sortBy==="trending"?b.trending-a.trending:b.urgency-a.urgency);

  const currentPageSize = view==="highlights"?HIGHLIGHT_PAGE_SIZE:PAGE_SIZE;
  const totalPages=Math.max(1,Math.ceil(filtered.length/currentPageSize));
  const paginated=filtered.slice((page-1)*currentPageSize,page*currentPageSize);

  const selectedTags=[
    ...fSector.map(v=>({label:v,clear:()=>setFSector(fSector.filter(x=>x!==v))})),
    ...fImpact.map(v=>({label:`Impact: ${v}`,clear:()=>setFImpact(fImpact.filter(x=>x!==v))})),
    ...fEffort.map(v=>({label:`Effort: ${v}`,clear:()=>setFEffort(fEffort.filter(x=>x!==v))})),
    ...fHorizon.map(v=>({label:`Horizon: ${v}`,clear:()=>setFHorizon(fHorizon.filter(x=>x!==v))})),
    ...(fQW?[{label:"Quick wins only",clear:()=>setFQW(false)}]:[]),
  ];

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",minHeight:"100vh",background:"#f5f5f5"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px;}
        .view-btn{background:none;border:none;color:#9ca3af;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;padding:7px 14px;border-radius:6px;transition:all 0.15s;}
        .view-btn.active{background:white;color:#111827;box-shadow:0 1px 3px rgba(0,0,0,0.08);}
        .sort-btn{background:none;border:none;color:#9ca3af;font-size:14px;font-weight:500;font-family:inherit;cursor:pointer;padding:6px 2px;transition:all 0.15s;border-bottom:2px solid transparent;border-radius:0;}
        .sort-btn.active{color:#111827;font-weight:600;border-bottom-color:#111827;}
        .sort-btn:hover:not(.active){color:#374151;}
        .h-card{background:white;border:1px solid #ececec;border-radius:14px;padding:24px;cursor:pointer;transition:all 0.18s;position:relative;min-width:0;overflow:hidden;}
        .h-card:hover{border-color:#d1d5db;box-shadow:0 4px 16px rgba(0,0,0,0.07);transform:translateY(-2px);}
        .h-card:hover .score-bar-fill{transform:scaleY(2.5);background:#2563eb !important;box-shadow:0 1px 4px rgba(37,99,235,0.2);}
        .h-card:hover .save-on-hover{opacity:1 !important;}
        .t-row{display:grid;grid-template-columns:52px 1fr 80px 70px 100px 170px;gap:0;align-items:center;padding:16px 20px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:background 0.1s;}
        .t-row:hover{background:#fafafa;}
        .t-row:hover .save-on-hover{opacity:1 !important;}
        .g-card{background:white;border:1px solid #ececec;border-radius:12px;padding:20px;cursor:pointer;transition:all 0.18s;position:relative;}
        .g-card:hover{border-color:#d1d5db;box-shadow:0 4px 12px rgba(0,0,0,0.06);transform:translateY(-1px);}
        .pg-btn{background:white;border:1px solid #e5e7eb;color:#374151;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:13px;font-family:inherit;font-weight:500;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
        .pg-btn:hover:not(:disabled){border-color:#d1d5db;background:#f9fafb;}
        .pg-btn.active-pg{background:#111827;border-color:#111827;color:white;}
        .pg-btn:disabled{opacity:0.3;cursor:default;}
        .slide-panel{transform:translateX(110%);transition:transform 0.42s cubic-bezier(0.16,1,0.3,1);}
        .slide-panel.open{transform:translateX(0);}
        .search-input{background:white;border:1.5px solid #e5e7eb;color:#374151;padding:9px 14px 9px 36px;border-radius:8px;font-size:15px;font-family:inherit;outline:none;width:220px;transition:all 0.15s;}
        .search-input:focus,.search-input:hover{border-color:#111827;}
        .filter-btn:hover{border-color:#111827 !important;color:#111827 !important;}
        .desc-clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .chart-card{transition:all 0.15s,opacity 0.6s,transform 0.6s;}
        .chart-card:hover{border-color:#d1d5db;box-shadow:0 4px 16px rgba(0,0,0,0.06);transform:translateY(-2px);}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes contentReveal{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:0.3;}50%{opacity:1;}}
        .chart-animate{animation:fadeSlideUp 0.5s ease-out both;}
        .card-content-reveal{animation:contentReveal 0.6s ease-out 0.3s both;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:"#f5f5f5",padding:"0 36px"}}>
        <div style={{background:"#f0f0f0",borderRadius:12,padding:"8px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
          {/* Center nav */}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{background:activeTab===t?"white":"none",border:"none",fontFamily:"inherit",fontSize:15,fontWeight:activeTab===t?600:500,color:activeTab===t?"#111827":"#6b7280",cursor:"pointer",padding:"8px 16px",borderRadius:8,transition:"all 0.15s",boxShadow:activeTab===t?"0 1px 3px rgba(0,0,0,0.06)":"none"}}
                onMouseEnter={e=>{if(activeTab!==t){e.currentTarget.style.background="#e8e8e8";e.currentTarget.style.color="#374151";}}}
                onMouseLeave={e=>{if(activeTab!==t){e.currentTarget.style.background="none";e.currentTarget.style.color="#6b7280";}}}>{t}</button>
            ))}
          </div>
          {/* Right: heart + account */}
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setSavedPanelOpen(true)} style={{display:"flex",alignItems:"center",gap:5,background:savedSkills.size>0?"#fef2f2":"white",border:`1px solid ${savedSkills.size>0?"#fecaca":"#e5e7eb"}`,padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",color:savedSkills.size>0?"#dc2626":"#9ca3af"}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill={savedSkills.size>0?"#ef4444":"none"} stroke={savedSkills.size>0?"#ef4444":"#d1d5db"} strokeWidth="1.8"><path d="M10 17.5s-7-4.5-7-9.5a4 4 0 017-2.6A4 4 0 0117 8c0 5-7 9.5-7 9.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {savedSkills.size>0?savedSkills.size:"0"}
            </button>
            <div ref={accountRef} style={{position:"relative"}}>
              <button onClick={()=>setAccountOpen(!accountOpen)} style={{display:"flex",alignItems:"center",gap:8,background:"white",border:"1px solid #e5e7eb",padding:"5px 12px 5px 6px",borderRadius:20,cursor:"pointer",fontFamily:"inherit"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"#111827",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white"}}>JD</div>
                <span style={{fontSize:13,fontWeight:500,color:"#374151"}}>Jan de Vries</span>
              </button>
              {accountOpen&&(
                <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"white",border:"1px solid #e5e7eb",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:200,minWidth:160,overflow:"hidden"}}>
                  <button style={{width:"100%",padding:"11px 16px",background:"none",border:"none",borderBottom:"1px solid #f3f4f6",fontSize:13,color:"#374151",fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>Account settings</button>
                  <button style={{width:"100%",padding:"11px 16px",background:"none",border:"none",fontSize:13,color:"#dc2626",fontFamily:"inherit",cursor:"pointer",textAlign:"left"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{padding:"24px 36px",maxWidth:1400,margin:"0 auto"}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:30,fontWeight:700,color:"#111827",letterSpacing:"-0.025em"}}>{activeTab}</h1>
          <p style={{fontSize:15,color:"#9ca3af",marginTop:4}}>{filtered.length} skills · sorted by {sortBy}</p>
        </div>

        {/* Pulse bar */}
        {pulseVisible&&(
          <div style={{background:"white",border:"1px solid #ececec",borderRadius:12,padding:"14px 20px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:32,alignItems:"center",flexWrap:"wrap"}}>
              {[{l:"Last scan",v:"2 Mar 2026"},{l:"New skills",v:"4 this sweep"},{l:"Top trending",v:"AI Literacy"},{l:"Sources",v:"312"}].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:7,alignItems:"baseline"}}>
                  <span style={{fontSize:13,color:"#9ca3af"}}>{s.l}</span>
                  <span style={{fontSize:14,fontWeight:600,color:"#374151"}}>{s.v}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setPulseVisible(false)} style={{background:"none",border:"none",color:"#d1d5db",cursor:"pointer",padding:4,borderRadius:6}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        )}

        {/* ── 4 CHART CARDS with animations ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:18}}>
          {[
            <PriorityMatrixCard key="m" skills={allSkills} expanded={false} onToggle={()=>setExpandedChart("matrix")} onSelectSkill={openSkill}/>,
            <TrendingVelocityCard key="t" skills={allSkills} expanded={false} onToggle={()=>setExpandedChart("trending")}/>,
            <StatusDonutCard key="d" skills={allSkills} expanded={false} onToggle={()=>setExpandedChart("donut")}/>,
            <UrgencyHeatmapCard key="u" skills={allSkills} expanded={false} onToggle={()=>setExpandedChart("urgency")}/>,
          ].map((card,i)=>(
            <div key={i} className={chartsLoaded?"chart-animate":""} style={{animationDelay:`${i*0.1}s`,opacity:chartsLoaded?undefined:0}}>
              {card}
            </div>
          ))}
        </div>

        {expandedChart&&(
          <ChartModal onClose={()=>setExpandedChart(null)}>
            {expandedChart==="matrix"&&<PriorityMatrixCard skills={allSkills} expanded onToggle={()=>setExpandedChart(null)} onSelectSkill={s=>{setExpandedChart(null);openSkill(s);}}/>}
            {expandedChart==="trending"&&<TrendingVelocityCard skills={allSkills} expanded onToggle={()=>setExpandedChart(null)}/>}
            {expandedChart==="donut"&&<StatusDonutCard skills={allSkills} expanded onToggle={()=>setExpandedChart(null)}/>}
            {expandedChart==="urgency"&&<UrgencyHeatmapCard skills={allSkills} expanded onToggle={()=>setExpandedChart(null)}/>}
          </ChartModal>
        )}

        {/* ── FILTER BAR ── */}
        <div style={{background:"white",border:"1px solid #ececec",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{position:"relative",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><circle cx="6" cy="6" r="4" stroke="#9ca3af" strokeWidth="1.5"/><path d="M10 10l2 2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input className="search-input" placeholder="Search skills…" value={searchQ} onChange={e=>{setSearchQ(e.target.value);setPage(1);}} onClick={()=>setSearchOpen(true)} readOnly style={{cursor:"pointer"}}/>
            </div>
            {/* AI Agent button — subtle with colored icon, like Quick wins */}
            <button onClick={()=>setAiChatOpen(true)} className="filter-btn" style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1.5px solid #e5e7eb",color:"#374151",padding:"9px 15px",borderRadius:8,fontSize:15,fontWeight:500,fontFamily:"inherit",cursor:"pointer",transition:"all 0.15s",flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.2 3.3L12.5 5.5l-3.3 1.2L8 10l-1.2-3.3L3.5 5.5l3.3-1.2z" fill="#7c3aed" stroke="#7c3aed" strokeWidth="0.5" strokeLinejoin="round"/><path d="M12.5 8l.6 1.6L14.7 10.2l-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" fill="#7c3aed" opacity="0.6" strokeLinejoin="round"/><path d="M3.5 10.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="#7c3aed" opacity="0.5" strokeLinejoin="round"/></svg>
              AI agent
            </button>
            <div style={{width:1,height:24,background:"#e5e7eb",flexShrink:0}}/>
            <MultiDropdown label="Sector" options={sectors} values={fSector} onChange={v=>{setFSector(v);setPage(1);}}/>
            <MultiDropdown label="Impact" options={impactOptions} values={fImpact} onChange={v=>{setFImpact(v);setPage(1);}}/>
            <MultiDropdown label="Effort" options={effortOptions} values={fEffort} onChange={v=>{setFEffort(v);setPage(1);}}/>
            <MultiDropdown label="Horizon" options={horizonOptions} values={fHorizon} onChange={v=>{setFHorizon(v);setPage(1);}}/>
            <button onClick={()=>{setFQW(!fQW);setPage(1);}} className="filter-btn" style={{display:"flex",alignItems:"center",gap:6,background:fQW?"#111827":"none",border:`1.5px solid ${fQW?"#111827":"#e5e7eb"}`,color:fQW?"white":"#374151",padding:"9px 14px",borderRadius:8,fontSize:15,fontWeight:500,fontFamily:"inherit",cursor:"pointer",flexShrink:0}}>⚡ Quick wins</button>
            {activeCount>0&&<button onClick={clearAll} style={{background:"none",border:"none",color:"#9ca3af",fontSize:13,fontFamily:"inherit",cursor:"pointer",marginLeft:"auto"}}
              onMouseEnter={e=>e.currentTarget.style.color="#374151"}
              onMouseLeave={e=>e.currentTarget.style.color="#9ca3af"}>Clear all ({activeCount})</button>}
          </div>
          {selectedTags.length>0&&(
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap",alignItems:"center"}}>
              {selectedTags.map(f=>(
                <span key={f.label} style={{display:"inline-flex",alignItems:"center",gap:5,background:"#f3f4f6",border:"1px solid #e5e7eb",color:"#374151",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:500}}>
                  {f.label}
                  <button onClick={f.clear} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14,lineHeight:1,padding:0}}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* View + sort */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{display:"flex",gap:2,background:"white",padding:4,borderRadius:10,border:"1px solid #ececec"}}>
            {[["highlights","✦ Highlights"],["grid","⊞ Grid"],["table","≡ Table"]].map(([v,label])=>(
              <button key={v} className={`view-btn ${view===v?"active":""}`} onClick={()=>{setView(v);setPage(1);}}>{label}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <span style={{fontSize:13,color:"#9ca3af"}}>Sort</span>
            {[["priority","Priority"],["trending","Trending"],["urgency","Urgency"]].map(([v,label])=>(
              <button key={v} className={`sort-btn ${sortBy===v?"active":""}`} onClick={()=>setSortBy(v)}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── HIGHLIGHTS ── */}
        {view==="highlights"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,minWidth:0}}>
              {paginated.map((s,idx)=>{
                const dec=s.status==="Declining";
                const r=reasonLabels[s.reason];
                const isSaved=savedSkills.has(s.id);
                const isHovered=hoveredCard===s.id;
                return(
                  <div key={s.id} className="h-card" onClick={()=>openSkill(s)}
                    onMouseEnter={()=>setHoveredCard(s.id)} onMouseLeave={()=>setHoveredCard(null)}>
                    {/* Tags carousel — shows ~2.5 labels, arrow to see more */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <TagCarousel>
                        <Tooltip text={r.label+": "+({trending:"Signal is accelerating fast",quickwin:"High impact, low effort",urgent:"Time-sensitive, act now",priority:"Highest overall score"}[s.reason]||"")} maxWidth={180}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:"#9ca3af",background:"#f9fafb",border:"1px solid #f0f0f0",padding:"3px 9px",borderRadius:6,cursor:"default",transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}
                          onMouseEnter={e=>{e.currentTarget.style.color=r.color;e.currentTarget.style.borderColor=r.color+"55";e.currentTarget.style.background=r.color+"10";}}
                          onMouseLeave={e=>{e.currentTarget.style.color="#9ca3af";e.currentTarget.style.borderColor="#f0f0f0";e.currentTarget.style.background="#f9fafb";}}>
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            {s.reason==="trending"&&<><path d="M1 10l4-4 3 3 5-6"/><path d="M9 3h4v4"/></>}
                            {s.reason==="quickwin"&&<><path d="M7 1v5l3 2"/><circle cx="7" cy="7" r="6" fill="none"/></>}
                            {s.reason==="urgent"&&<><path d="M7 1v6"/><circle cx="7" cy="11" r="0.8" fill="currentColor" stroke="none"/><path d="M1.5 5a6.5 6.5 0 0111 0" fill="none"/></>}
                            {s.reason==="priority"&&<><path d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.2 3.4 12l.7-4L1.2 5.2l4-.6z" fill="none"/></>}
                          </svg>
                          {r.label}
                        </span>
                        </Tooltip>
                        <Tooltip text={s.status==="Emerging"?"New skill gaining traction":"Mature skill with stable demand"} maxWidth={180}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:"#9ca3af",background:"#f9fafb",border:"1px solid #f0f0f0",padding:"3px 9px",borderRadius:6,cursor:"default",transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}
                          onMouseEnter={e=>{const c=s.status==="Emerging"?"#059669":"#2563eb";e.currentTarget.style.color=c;e.currentTarget.style.borderColor=c+"55";e.currentTarget.style.background=c+"10";}}
                          onMouseLeave={e=>{e.currentTarget.style.color="#9ca3af";e.currentTarget.style.borderColor="#f0f0f0";e.currentTarget.style.background="#f9fafb";}}>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/></svg>
                          {s.status}
                        </span>
                        </Tooltip>
                        <Tooltip text={"Skill type: "+s.type} maxWidth={160}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:"#9ca3af",background:"#f9fafb",border:"1px solid #f0f0f0",padding:"3px 9px",borderRadius:6,cursor:"default",transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}
                          onMouseEnter={e=>{e.currentTarget.style.color="#374151";e.currentTarget.style.borderColor="#d1d5db";e.currentTarget.style.background="#f3f4f6";}}
                          onMouseLeave={e=>{e.currentTarget.style.color="#9ca3af";e.currentTarget.style.borderColor="#f0f0f0";e.currentTarget.style.background="#f9fafb";}}>
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                            {s.type==="Tool"&&<><path d="M7 2l3 3-5 5H2V7z"/><path d="M6 3l3 3"/></>}
                            {s.type==="Hard Skill"&&<><path d="M1 9l5-5 5 5"/><path d="M3 11h6"/></>}
                            {s.type==="Soft Skill"&&<><circle cx="6" cy="4" r="3" fill="none"/><path d="M3 7.5C3 6 4.3 5 6 5s3 1 3 2.5"/></>}
                            {s.type==="Methodology"&&<><rect x="2" y="2" width="8" height="8" rx="1" fill="none"/><path d="M2 5h8M5 5v5"/></>}
                          </svg>
                          {s.type}
                        </span>
                        </Tooltip>
                        {s.quickWin&&<span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600,color:"#9ca3af",background:"#f9fafb",border:"1px solid #f0f0f0",padding:"3px 8px",borderRadius:6,whiteSpace:"nowrap",flexShrink:0,cursor:"default",transition:"all 0.15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.color="#d97706";e.currentTarget.style.borderColor="#fef3c7";e.currentTarget.style.background="#fffbeb";}}
                          onMouseLeave={e=>{e.currentTarget.style.color="#9ca3af";e.currentTarget.style.borderColor="#f0f0f0";e.currentTarget.style.background="#f9fafb";}}>⚡ Quick win</span>}
                        {s.summaRecommended&&<SummaPick/>}
                      </TagCarousel>
                      <div className="save-on-hover" style={{opacity:isSaved?1:0,transition:"opacity 0.15s",flexShrink:0,marginLeft:6}}>
                        <SaveButton saved={isSaved} onToggle={()=>toggleSave(s.id)} visible={isSaved||isHovered}/>
                      </div>
                    </div>
                    <h3 style={{fontSize:17,fontWeight:700,color:dec?"#9ca3af":"#111827",lineHeight:1.3,marginBottom:10,letterSpacing:"-0.015em"}}>{s.name}</h3>
                    <p className="desc-clamp" style={{fontSize:14,color:"#9ca3af",lineHeight:1.6,marginBottom:22}}>{s.desc}</p>
                    <div style={{display:"flex",gap:0,alignItems:"stretch",paddingTop:20,borderTop:"1px solid #f3f4f6"}}>
                      <Tooltip text={scoreTooltips.Priority} maxWidth={180}>
                        <div style={{width:"38%",flexShrink:0,paddingRight:16,cursor:"help"}}>
                          <div style={{fontSize:12,color:"#d1d5db",marginBottom:6}}>Priority</div>
                          <div style={{fontSize:38,fontWeight:700,color:dec?"#9ca3af":"#111827",letterSpacing:"-0.04em",lineHeight:1}}>{s.priority.toFixed(1)}</div>
                        </div>
                      </Tooltip>
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:7,justifyContent:"center",borderLeft:"1px solid #f3f4f6",paddingLeft:16}}>
                        {[{label:"Impact",value:s.impact},{label:"Urgency",value:s.urgency},{label:"Trending",value:s.trending}].map((sc,si)=>(
                          <div key={sc.label} style={{display:"flex",alignItems:"center",gap:5,width:"100%"}}>
                            <span style={{fontSize:12,color:"#9ca3af",width:50,flexShrink:0}}>{sc.label}</span>
                            <div style={{flex:1,height:3,background:"#f0f0f0",borderRadius:99,overflow:"hidden"}}>
                              <div className="score-bar-fill" style={{height:"100%",width:`${sc.value*10}%`,background:dec?"#d1d5db":"#111827",borderRadius:99,transition:`all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${si*0.08}s`,transformOrigin:"left"}}/>
                            </div>
                            <span style={{fontSize:13,fontWeight:700,color:dec?"#9ca3af":"#111827",minWidth:24,textAlign:"right"}}>{sc.value.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{marginTop:20,display:"flex",gap:8}}>
                      <span style={{fontSize:13,color:"#9ca3af"}}>{s.sourceCount} sources</span>
                      <span style={{fontSize:13,color:"#e5e7eb"}}>·</span>
                      <span style={{fontSize:13,color:"#9ca3af"}}>{s.trendCount} trends</span>
                      <span style={{fontSize:13,color:"#e5e7eb"}}>·</span>
                      <span style={{fontSize:13,color:"#9ca3af"}}>{s.sector}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Highlights pagination */}
            {totalPages>1&&(
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginTop:24}}>
                <button className="pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>←</button>
                {[...Array(totalPages)].map((_,i)=>(
                  <button key={i} className={`pg-btn ${page===i+1?"active-pg":""}`} onClick={()=>setPage(i+1)}>{i+1}</button>
                ))}
                <button className="pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>→</button>
              </div>
            )}
          </>
        )}

        {/* ── GRID ── */}
        {view==="grid"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {paginated.map((s,idx)=>{
              const dec=s.status==="Declining";
              const isSaved=savedSkills.has(s.id);
              return(
                <div key={s.id} className="g-card" onClick={()=>openSkill(s)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#e5e7eb"}}>#{(page-1)*PAGE_SIZE+idx+1}</span>
                      {s.summaRecommended&&<SummaPick/>}
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      <SaveButton saved={isSaved} onToggle={()=>toggleSave(s.id)}/>
                      {s.quickWin&&<span style={{fontSize:13,color:"#d97706"}}>⚡</span>}
                      <TypeTag type={s.type}/>
                    </div>
                  </div>
                  <h4 style={{fontSize:15,fontWeight:600,color:dec?"#9ca3af":"#111827",lineHeight:1.35,marginBottom:7}}>{s.name}</h4>
                  <p className="desc-clamp" style={{fontSize:13,color:"#9ca3af",lineHeight:1.55,marginBottom:14}}>{s.desc}</p>
                  <div style={{marginBottom:12}}><StatusDot status={s.status}/></div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",paddingTop:12,borderTop:"1px solid #f5f5f5"}}>
                    <div>
                      <div style={{fontSize:11,color:"#d1d5db",marginBottom:3}}>Priority</div>
                      <div style={{fontSize:22,fontWeight:700,color:dec?"#9ca3af":"#111827"}}>{s.priority.toFixed(1)}</div>
                    </div>
                    <Spark data={s.sparkline} declining={dec}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TABLE ── */}
        {view==="table"&&(
          <div style={{background:"white",border:"1px solid #ececec",borderRadius:14,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"52px 1fr 80px 70px 100px 170px",gap:0,alignItems:"center",padding:"12px 20px",borderBottom:"1px solid #f3f4f6",background:"#fafafa"}}>
              {["","Skill","Sector","Priority","Mentions","Scores"].map((h,i)=>(
                <div key={i} style={{fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.07em",textTransform:"uppercase"}}>{h}</div>
              ))}
            </div>
            {paginated.map((s,idx)=>{
              const dec=s.status==="Declining";
              const isSaved=savedSkills.has(s.id);
              const isHov=hoveredRow===s.id;
              return(
                <div key={s.id} className="t-row" onClick={()=>openSkill(s)}
                  onMouseEnter={()=>setHoveredRow(s.id)} onMouseLeave={()=>setHoveredRow(null)}>
                  <div style={{fontSize:36,fontWeight:800,color:"transparent",WebkitTextStroke:"1.8px #d1d5db",lineHeight:1,letterSpacing:"-0.05em",fontFamily:"'Inter',-apple-system,sans-serif"}}>{(page-1)*PAGE_SIZE+idx+1}</div>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <div style={{fontSize:15,fontWeight:600,color:dec?"#9ca3af":"#111827"}}>{s.name}</div>
                      {s.summaRecommended&&<SummaPick/>}
                      <div className="save-on-hover" style={{opacity:isSaved?1:0,transition:"opacity 0.15s"}}>
                        <SaveButton saved={isSaved} onToggle={()=>toggleSave(s.id)} visible={isSaved||isHov}/>
                      </div>
                    </div>
                    <p className="desc-clamp" style={{fontSize:12,color:"#9ca3af",lineHeight:1.5,marginBottom:5,maxWidth:380}}>{s.desc}</p>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <StatusDot status={s.status}/>
                      <span style={{color:"#e5e7eb"}}>·</span>
                      <TypeTag type={s.type}/>
                      {s.quickWin&&<><span style={{color:"#e5e7eb"}}>·</span><span style={{fontSize:12,color:"#d97706",fontWeight:600}}>⚡ Quick win</span></>}
                    </div>
                  </div>
                  <div style={{fontSize:13,color:"#6b7280"}}>{s.sector}</div>
                  <div>
                    <div style={{fontSize:22,fontWeight:700,color:dec?"#9ca3af":"#111827",letterSpacing:"-0.03em",lineHeight:1}}>{s.priority.toFixed(1)}</div>
                    <div style={{fontSize:11,color:"#d1d5db",marginTop:2}}>i÷e</div>
                  </div>
                  {/* Mini mentions bar chart */}
                  <div>
                    <MiniBarChart data={s.mentions} w={80} h={22}/>
                    <div style={{fontSize:10,color:"#9ca3af",marginTop:3}}>{s.mentions[s.mentions.length-1]} mentions</div>
                  </div>
                  {/* Scores: Impact, Urgency, Trending */}
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    <ScoreBar label="Impact" value={s.impact} declining={dec}/>
                    <ScoreBar label="Urgency" value={s.urgency} declining={dec}/>
                    <ScoreBar label="Trending" value={s.trending} declining={dec}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"60px 0",color:"#9ca3af",fontSize:14,background:"white",borderRadius:14,border:"1px solid #ececec"}}>
            <div style={{fontSize:24,marginBottom:8}}>∅</div>
            No skills match your current filters.
            <button onClick={clearAll} style={{display:"block",margin:"12px auto 0",background:"none",border:"1px solid #e5e7eb",color:"#374151",borderRadius:8,padding:"8px 16px",fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>Clear filters</button>
          </div>
        )}

        {/* Pagination for grid/table */}
        {view!=="highlights"&&totalPages>1&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:6,marginTop:24}}>
            <button className="pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>←</button>
            {[...Array(totalPages)].map((_,i)=>(
              <button key={i} className={`pg-btn ${page===i+1?"active-pg":""}`} onClick={()=>setPage(i+1)}>{i+1}</button>
            ))}
            <button className="pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>→</button>
          </div>
        )}
      </div>

      {/* Overlays */}
      {searchOpen&&<SearchOverlay skills={allSkills} onClose={()=>setSearchOpen(false)} onSelect={s=>openSkill(s)}/>}
      {aiChatOpen&&<AiChatOverlay onClose={()=>setAiChatOpen(false)}/>}
      {savedPanelOpen&&<SavedPanel savedIds={savedSkills} skills={allSkills} onClose={()=>setSavedPanelOpen(false)} onSelect={openSkill}/>}

      {/* Slide panel */}
      {selectedSkill&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.2)",zIndex:40,backdropFilter:"blur(2px)"}} onClick={closeSkill}/>}
      <div className={`slide-panel ${panelMounted?"open":""}`} style={{position:"fixed",top:0,right:0,bottom:0,width:"min(580px,100vw)",background:"white",borderLeft:"1px solid #ececec",zIndex:50,overflowY:"hidden"}}>
        {selectedSkill&&<SkillDetail skill={selectedSkill} onClose={closeSkill} saved={savedSkills.has(selectedSkill.id)} onToggleSave={toggleSave}/>}
      </div>
    </div>
  );
}