import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart,
} from 'recharts'

/* ── COLORES (Design System del documento) ──────────────────────────── */
const AC  = '#C8714A'          // Acento principal (naranja/terracota)
const ACL = '#e8916a'          // Acento claro
const ACD = 'rgba(200,113,74,0.12)'  // Acento dim
const GR  = '#4ADE80'          // Positivo
const GRD = 'rgba(74,222,128,0.13)'
const AM  = '#fbbf24'          // Amber / neutral
const AMD = 'rgba(251,191,36,0.13)'
const RE  = '#f87171'          // Negativo
const RED = 'rgba(248,113,113,0.13)'
const BL  = '#60a5fa'          // Azul
const BG  = '#0d0d0d'          // Fondo
const SRF = '#0f0f0f'
const CRD = '#161616'          // Card
const BRD = '#282828'          // Border
const TXT = '#FFFFFF'          // Texto principal
const SEC = '#8C8C8C'          // Texto secundario
const NEU = '#94A3B8'          // Neutral

/* ── TIPOGRAFÍA ──────────────────────────────────────────────────────── */
const MONO = { fontFamily: "'JetBrains Mono', monospace" }
const SANS = { fontFamily: "'Inter', sans-serif" }

/* ── DATOS MOCK (Tennispremium) ─────────────────────────────────────── */
const ACCOUNT = { name: 'Tennispremium', id: 'act_1043322110399302' }

const DAILY_DATA = [
  { date:'15/3', spend:1820000, roas:4.1, impressions:185000, clicks:5820, ctr:3.15 },
  { date:'16/3', spend:2100000, roas:4.3, impressions:201000, clicks:6100, ctr:3.03 },
  { date:'17/3', spend:1950000, roas:3.9, impressions:198000, clicks:5900, ctr:2.98 },
  { date:'18/3', spend:2300000, roas:4.7, impressions:225000, clicks:7100, ctr:3.16 },
  { date:'19/3', spend:2150000, roas:4.5, impressions:210000, clicks:6500, ctr:3.10 },
  { date:'20/3', spend:1800000, roas:3.8, impressions:180000, clicks:5400, ctr:3.00 },
  { date:'21/3', spend:2400000, roas:5.0, impressions:230000, clicks:7300, ctr:3.17 },
  { date:'22/3', spend:2250000, roas:4.6, impressions:215000, clicks:6800, ctr:3.16 },
  { date:'23/3', spend:2050000, roas:4.2, impressions:200000, clicks:6200, ctr:3.10 },
  { date:'24/3', spend:1900000, roas:3.9, impressions:188000, clicks:5700, ctr:3.03 },
  { date:'25/3', spend:2600000, roas:5.1, impressions:248000, clicks:7900, ctr:3.19 },
  { date:'26/3', spend:2450000, roas:4.8, impressions:234000, clicks:7500, ctr:3.21 },
  { date:'27/3', spend:2100000, roas:4.3, impressions:203000, clicks:6300, ctr:3.10 },
  { date:'28/3', spend:2300000, roas:4.5, impressions:220000, clicks:7000, ctr:3.18 },
  { date:'29/3', spend:2200000, roas:4.4, impressions:212000, clicks:6700, ctr:3.16 },
  { date:'30/3', spend:2800000, roas:5.3, impressions:265000, clicks:8400, ctr:3.17 },
  { date:'31/3', spend:2650000, roas:5.0, impressions:252000, clicks:8000, ctr:3.17 },
  { date:'1/4',  spend:2100000, roas:4.1, impressions:200000, clicks:6100, ctr:3.05 },
  { date:'2/4',  spend:1950000, roas:3.9, impressions:190000, clicks:5800, ctr:3.05 },
  { date:'3/4',  spend:2200000, roas:4.4, impressions:213000, clicks:6600, ctr:3.10 },
  { date:'4/4',  spend:2400000, roas:4.7, impressions:228000, clicks:7200, ctr:3.16 },
  { date:'5/4',  spend:2550000, roas:4.9, impressions:241000, clicks:7700, ctr:3.20 },
  { date:'6/4',  spend:2350000, roas:4.6, impressions:224000, clicks:7100, ctr:3.17 },
  { date:'7/4',  spend:2150000, roas:4.3, impressions:207000, clicks:6400, ctr:3.09 },
  { date:'8/4',  spend:2300000, roas:4.5, impressions:219000, clicks:6900, ctr:3.15 },
  { date:'9/4',  spend:2700000, roas:5.2, impressions:255000, clicks:8200, ctr:3.22 },
  { date:'10/4', spend:2500000, roas:4.8, impressions:238000, clicks:7600, ctr:3.19 },
  { date:'11/4', spend:2100000, roas:4.2, impressions:202000, clicks:6200, ctr:3.07 },
  { date:'12/4', spend:1980000, roas:4.0, impressions:193000, clicks:5900, ctr:3.06 },
]

const CAMPAIGNS = [
  { id:1, name:'Prospecting - Raquetas Premium',   status:'ACTIVE', daily_budget:3200000, spend:18500000, impressions:1820000, clicks:58000, ctr:3.19, cpc:319, roas:5.2 },
  { id:2, name:'Retargeting - Carrito Abandonado', status:'ACTIVE', daily_budget:1800000, spend:12300000, impressions:980000,  clicks:38500, ctr:3.93, cpc:319, roas:6.8 },
  { id:3, name:'Lookalike - Compradores',          status:'ACTIVE', daily_budget:2500000, spend:9800000,  impressions:1100000, clicks:32000, ctr:2.91, cpc:306, roas:4.5 },
  { id:4, name:'Brand Awareness - General',        status:'PAUSED', daily_budget:1200000, spend:7200000,  impressions:1450000, clicks:30000, ctr:2.07, cpc:240, roas:2.1 },
  { id:5, name:'Conversión - Zapatillas',          status:'ACTIVE', daily_budget:2100000, spend:8900000,  impressions:780000,  clicks:28000, ctr:3.59, cpc:318, roas:4.9 },
  { id:6, name:'Temporada - Torneos 2026',         status:'ACTIVE', daily_budget:1500000, spend:5200000,  impressions:620000,  clicks:18500, ctr:2.98, cpc:281, roas:3.7 },
  { id:7, name:'Video Ads - Tutoriales',           status:'ENDED',  daily_budget:800000,  spend:1800000,  impressions:395000,  clicks:8510,  ctr:2.15, cpc:212, roas:1.8 },
]

const CREATIVES = [
  { id:1, campaign:'Prospecting - Raquetas Premium',   name:'Raqueta Head Speed Pro - Carrusel',  spend:5200000, impressions:520000, ctr:3.8, roas:6.2, emoji:'🎾' },
  { id:2, campaign:'Retargeting - Carrito Abandonado', name:'Video Dinámico - Carrito 15s',       spend:4800000, impressions:380000, ctr:4.1, roas:7.3, emoji:'🎥' },
  { id:3, campaign:'Lookalike - Compradores',          name:'Oferta Flash - 20% OFF',             spend:3200000, impressions:410000, ctr:2.9, roas:4.2, emoji:'🏷️' },
  { id:4, campaign:'Conversión - Zapatillas',          name:'Nike Air Zoom Vapor - Stories',      spend:2900000, impressions:290000, ctr:3.5, roas:4.8, emoji:'👟' },
  { id:5, campaign:'Brand Awareness',                  name:'¿Eres tenista? - Video 30s',         spend:2100000, impressions:680000, ctr:1.9, roas:2.0, emoji:'🎬' },
  { id:6, campaign:'Temporada - Torneos 2026',         name:'Roland Garros 2026 - Colección',     spend:1800000, impressions:225000, ctr:3.1, roas:3.9, emoji:'🏆' },
  { id:7, campaign:'Prospecting - Raquetas',           name:'Wilson Pro Staff - Imagen Única',    spend:1600000, impressions:198000, ctr:2.7, roas:3.5, emoji:'🎾' },
  { id:8, campaign:'Video Ads',                        name:'Tutorial Saque - Nivel Avanzado',    spend:890000,  impressions:215000, ctr:1.8, roas:1.5, emoji:'📺' },
  { id:9, campaign:'Retargeting',                      name:'Testimonio Cliente - Video 20s',     spend:2400000, impressions:195000, ctr:4.5, roas:8.1, emoji:'⭐' },
]

const AGE_GENDER = [
  { age:'18-24', male:450000, female:380000 },
  { age:'25-34', male:890000, female:720000 },
  { age:'35-44', male:650000, female:510000 },
  { age:'45-54', male:320000, female:270000 },
  { age:'55+',   male:180000, female:140000 },
]

const DEVICES = [
  { name:'Móvil', value:68 },
  { name:'Escritorio', value:24 },
  { name:'Tablet', value:8 },
]

const GEO = [
  { country:'Colombia',   spend:38500000, impressions:3820000, clicks:121000, roas:4.8 },
  { country:'México',     spend:9200000,  impressions:890000,  clicks:28000,  roas:3.9 },
  { country:'Argentina',  spend:5800000,  impressions:560000,  clicks:17500,  roas:3.5 },
  { country:'España',     spend:4200000,  impressions:410000,  clicks:13000,  roas:4.1 },
  { country:'Chile',      spend:2900000,  impressions:285000,  clicks:9000,   roas:3.7 },
  { country:'Perú',       spend:1800000,  impressions:175000,  clicks:5500,   roas:3.2 },
  { country:'Ecuador',    spend:890000,   impressions:87000,   clicks:2700,   roas:2.9 },
  { country:'Venezuela',  spend:650000,   impressions:64000,   clicks:2000,   roas:2.5 },
  { country:'Uruguay',    spend:520000,   impressions:51000,   clicks:1600,   roas:3.0 },
  { country:'Paraguay',   spend:340000,   impressions:33000,   clicks:1050,   roas:2.7 },
]

const PLACEMENTS = [
  { name:'Facebook Feed',    spend:22000000, impressions:2100000, roas:4.9 },
  { name:'Instagram Feed',   spend:18500000, impressions:1750000, roas:4.6 },
  { name:'IG Stories',       spend:9800000,  impressions:1200000, roas:3.8 },
  { name:'IG Reels',         spend:7200000,  impressions:980000,  roas:4.2 },
  { name:'Audience Network', spend:3100000,  impressions:520000,  roas:2.8 },
  { name:'FB Stories',       spend:2800000,  impressions:390000,  roas:3.4 },
]

const PREV_PERIOD = {
  spend: 56700000, roas: 4.18, impressions: 5640000, clicks: 177200,
  ctr: 3.04, cpc: 342, purchases: 810,
}

/* ── UTILIDADES ─────────────────────────────────────────────────────── */
const fmtCOP = (n) => {
  if (n >= 1000000000) return '$' + (n/1000000000).toFixed(1) + 'B'
  if (n >= 1000000)    return '$' + (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)       return '$' + (n/1000).toFixed(0) + 'K'
  return '$' + n
}
const fmtNum = (n) => {
  if (n >= 1000000) return (n/1000000).toFixed(2) + 'M'
  if (n >= 1000)    return (n/1000).toFixed(1) + 'K'
  return n.toLocaleString('es-CO')
}
const fmtPct = (v) => (v > 0 ? '+' : '') + v.toFixed(1) + '%'
const TT_STYLE = { background:'#1e1e1e', border:'1px solid #282828', borderRadius:8, fontSize:12, color:'#fff' }

/* ── ESTILOS BASE ────────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight:'100vh', background:BG, display:'flex',
    fontFamily:"'Inter', -apple-system, sans-serif", color:TXT,
  },
  sidebar: {
    width:220, minWidth:220, background:CRD,
    borderRight:'1px solid '+BRD, display:'flex',
    flexDirection:'column', padding:'20px 0',
    position:'fixed', top:0, left:0, height:'100vh', zIndex:10,
  },
  sidebarLogo: {
    display:'flex', alignItems:'center', gap:10,
    padding:'0 20px 20px', borderBottom:'1px solid '+BRD, marginBottom:12,
  },
  logoDot: { width:10, height:10, background:AC, borderRadius:'50%' },
  logoText: { fontSize:16, fontWeight:700 },
  navItem: (active) => ({
    display:'flex', alignItems:'center', gap:10,
    padding:'10px 20px', cursor:'pointer', fontSize:14,
    color: active ? AC : SEC, transition:'all 0.15s',
    borderLeft: active ? '3px solid '+AC : '3px solid transparent',
    background: active ? ACD : 'transparent',
  }),
  navIcon: { width:18, fontSize:14, textAlign:'center' },
  sidebarFooter: {
    marginTop:'auto', padding:'16px 20px',
    borderTop:'1px solid '+BRD, fontSize:11, color:SEC, ...MONO,
  },
  main: { marginLeft:220, display:'flex', flexDirection:'column', minHeight:'100vh', flex:1 },
  header: {
    height:56, background:CRD, borderBottom:'1px solid '+BRD,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'0 28px', position:'sticky', top:0, zIndex:9,
  },
  headerTitle: { fontSize:16, fontWeight:600 },
  accountPill: {
    background:ACD, color:AC, border:'1px solid rgba(200,113,74,0.3)',
    borderRadius:6, padding:'5px 12px', fontSize:13, fontWeight:500,
  },
  datePill: {
    background:BG, border:'1px solid '+BRD, borderRadius:6,
    padding:'5px 12px', fontSize:13, cursor:'pointer',
    display:'flex', alignItems:'center', gap:6,
  },
  content: { padding:28, flex:1 },
  pageTitle: { fontSize:22, fontWeight:700, marginBottom:24 },
  card: { background:CRD, border:'1px solid '+BRD, borderRadius:10, padding:20 },
  cardLabel: { fontSize:11, fontWeight:600, letterSpacing:'0.08em', color:SEC, textTransform:'uppercase', marginBottom:8 },
  cardValue: { fontSize:28, fontWeight:700, lineHeight:1, marginBottom:6, ...MONO },
  cardSub: { fontSize:12, color:SEC },
  chartCard: { background:CRD, border:'1px solid '+BRD, borderRadius:10, padding:20 },
  chartTitle: { fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:SEC, marginBottom:16 },
  badge: (type) => {
    const map = {
      ACTIVE: { bg:'rgba(74,222,128,0.12)', color:GR, border:'1px solid rgba(74,222,128,0.25)' },
      PAUSED: { bg:'rgba(148,163,184,0.12)', color:NEU, border:'1px solid rgba(148,163,184,0.25)' },
      ENDED:  { bg:'rgba(248,113,113,0.12)', color:RE, border:'1px solid rgba(248,113,113,0.25)' },
      TOP:    { bg:'rgba(74,222,128,0.12)', color:GR, border:'1px solid rgba(74,222,128,0.25)' },
      AVG:    { bg:'rgba(251,191,36,0.12)', color:AM, border:'1px solid rgba(251,191,36,0.25)' },
      LOW:    { bg:'rgba(248,113,113,0.12)', color:RE, border:'1px solid rgba(248,113,113,0.25)' },
    }
    const m = map[type] || map.PAUSED
    return {
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600,
      background:m.bg, color:m.color, border:m.border,
    }
  },
}

/* ── COMPONENTES REUTILIZABLES ──────────────────────────────────────── */
function KpiCard({ label, value, sub, change }) {
  const isPos = change >= 0
  return (
    <div style={S.card}>
      <div style={S.cardLabel}>{label}</div>
      <div style={S.cardValue}>{value}</div>
      {sub && <div style={S.cardSub}>{sub}</div>}
      {change !== undefined && (
        <div style={{ fontSize:12, display:'flex', alignItems:'center', gap:4, marginTop:4, color: isPos ? GR : RE }}>
          {isPos ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs período anterior
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={S.pageTitle}>{title}</div>
      {sub && <div style={{ color:SEC, fontSize:13, marginTop:-16, marginBottom:8 }}>{sub}</div>}
    </div>
  )
}

function StatusBadge({ status }) {
  const labels = { ACTIVE:'● Activa', PAUSED:'⏸ Pausada', ENDED:'✕ Finalizada' }
  return <span style={S.badge(status)}>{labels[status] || status}</span>
}

function PerfBadge({ roas }) {
  const type = roas > 5 ? 'TOP' : roas >= 2 ? 'AVG' : 'LOW'
  const labels = { TOP:'🏆 Top', AVG:'↗ Promedio', LOW:'↘ Bajo' }
  return <span style={S.badge(type)}>{labels[type]}</span>
}

function RoasBar({ roas }) {
  const color = roas > 4 ? GR : roas >= 2 ? AM : RE
  const pct = Math.min((roas / 8) * 100, 100)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:5, background:BRD, borderRadius:3 }}>
        <div style={{ width:pct+'%', height:'100%', background:color, borderRadius:3 }} />
      </div>
      <span style={{ ...MONO, fontSize:13, color, minWidth:35 }}>{roas}x</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA A — VISTA GENERAL
══════════════════════════════════════════════════════════════════════ */
function Overview({ onNavigate }) {
  const totalSpend = DAILY_DATA.reduce((s,d)=>s+d.spend,0)
  const avgROAS = 4.40
  const totalRevenue = totalSpend * avgROAS
  const totalImpressions = DAILY_DATA.reduce((s,d)=>s+d.impressions,0)
  const totalClicks = DAILY_DATA.reduce((s,d)=>s+d.clicks,0)
  const top5 = [...CAMPAIGNS].sort((a,b)=>b.spend-a.spend).slice(0,5)

  const chgSpend    = ((totalSpend - PREV_PERIOD.spend) / PREV_PERIOD.spend) * 100
  const chgROAS     = ((avgROAS - PREV_PERIOD.roas) / PREV_PERIOD.roas) * 100
  const chgImpr     = ((totalImpressions - PREV_PERIOD.impressions) / PREV_PERIOD.impressions) * 100
  const chgRevenue  = ((totalRevenue - PREV_PERIOD.spend*PREV_PERIOD.roas) / (PREV_PERIOD.spend*PREV_PERIOD.roas)) * 100

  return (
    <div style={S.content}>
      <SectionHeader title="Vista General" />

      {/* KPI row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:16 }}>
        <KpiCard label="Inversión Total"      value={fmtCOP(totalSpend)}   sub="COP · 30 días"           change={chgSpend} />
        <KpiCard label="Ingresos Estimados"   value={fmtCOP(totalRevenue)} sub={`ROAS ${avgROAS}x × Gasto`} change={chgRevenue} />
        <KpiCard label="ROAS Combinado"       value={`${avgROAS}x`}         sub="omni_purchase"          change={chgROAS} />
        <KpiCard label="Impresiones Totales"  value={fmtNum(totalImpressions)} sub="últimos 30 días"     change={chgImpr} />
      </div>

      {/* KPI row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <KpiCard label="Compras"      value="989"           sub="conversiones"  change={22.1} />
        <KpiCard label="CTR Promedio" value="3.15%"         sub="sobre benchmark" change={3.7} />
        <KpiCard label="CPC Promedio" value="$329"          sub="COP por clic"  change={-3.8} />
        <KpiCard label="Add to Cart"  value="9.584"         sub="alto engagement" change={15.6} />
      </div>

      {/* Gráfico combinado Gasto + ROAS doble eje Y */}
      <div style={{ ...S.chartCard, marginBottom:24 }}>
        <div style={S.chartTitle}>Gasto Diario (COP) &amp; ROAS — Últimos 30 días · Doble eje Y</div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={DAILY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
            <XAxis dataKey="date" tick={{ fill:SEC, fontSize:11 }} interval={4} />
            <YAxis yAxisId="left" tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`} />
            <YAxis yAxisId="right" orientation="right" domain={[0,8]} tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>`${v}x`} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>n==='spend'?[fmtCOP(v),'Gasto']:[v+'x','ROAS']} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar yAxisId="left" dataKey="spend" name="Gasto COP" fill={AC} fillOpacity={0.75} />
            <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke={GR} strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico CTR + Embudo */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24, minWidth:0 }}>
        <div style={S.chartCard}>
          <div style={S.chartTitle}>CTR Diario (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={DAILY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
              <XAxis dataKey="date" tick={{ fill:SEC, fontSize:11 }} interval={4} />
              <YAxis tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>v+'%'} domain={[0,5]} />
              <Tooltip contentStyle={TT_STYLE} formatter={v=>[v+'%','CTR']} />
              <Line type="monotone" dataKey="ctr" name="CTR %" stroke={AC} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={S.chartCard}>
          <div style={S.chartTitle}>Embudo de Conversión</div>
          {[
            { label:'Impresiones', value:6144998, color:AC },
            { label:'Clics',       value:193510,  color:BL },
            { label:'Add to Cart', value:9584,    color:'#A78BFA' },
            { label:'Checkout',    value:4236,    color:AM },
            { label:'Compras',     value:989,     color:GR },
          ].map(item => (
            <div key={item.label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                <span>{item.label}</span>
                <span style={MONO}>{item.value.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ height:4, background:BRD, borderRadius:2 }}>
                <div style={{ width:Math.max((item.value/6144998)*100,1)+'%', height:'100%', background:item.color, borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Campañas */}
      <div style={{ background:CRD, border:'1px solid '+BRD, borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid '+BRD }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Top 5 Campañas por Gasto</span>
          <span style={{ fontSize:12, color:AC, cursor:'pointer' }} onClick={()=>onNavigate('campaigns')}>Ver todas →</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Campaña','Estado','Gasto','Impresiones','Clics','CTR','ROAS'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:SEC, borderBottom:'1px solid '+BRD }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top5.map((c,i) => (
              <tr key={c.id} style={{ borderBottom: i<4 ? '1px solid rgba(40,40,40,0.5)' : 'none' }}>
                <td style={{ padding:'12px 16px', fontSize:13 }}>{c.name}</td>
                <td style={{ padding:'12px 16px' }}><StatusBadge status={c.status} /></td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtCOP(c.spend)}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtNum(c.impressions)}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{c.clicks.toLocaleString('es-CO')}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{c.ctr}%</td>
                <td style={{ padding:'12px 16px' }}><RoasBar roas={c.roas} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA B — CAMPAÑAS
══════════════════════════════════════════════════════════════════════ */
function Campaigns() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('spend')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    let data = CAMPAIGNS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    data = [...data].sort((a,b) => sortDir==='desc' ? b[sortKey]-a[sortKey] : a[sortKey]-b[sortKey])
    return data
  }, [search, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d==='desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }) => sortKey===k ? (sortDir==='desc' ? ' ↓' : ' ↑') : ' ↕'

  const totalSpend = CAMPAIGNS.reduce((s,c)=>s+c.spend,0)
  const totalImpr  = CAMPAIGNS.reduce((s,c)=>s+c.impressions,0)
  const totalClicks= CAMPAIGNS.reduce((s,c)=>s+c.clicks,0)

  return (
    <div style={S.content}>
      <SectionHeader title="Campañas" />

      {/* KPI summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <KpiCard label="Gasto Total" value={fmtCOP(totalSpend)} sub="todas las campañas" change={12.4} />
        <KpiCard label="Impresiones" value={fmtNum(totalImpr)} sub="total período" change={8.9} />
        <KpiCard label="Clics Totales" value={fmtNum(totalClicks)} sub="total período" change={11.2} />
        <KpiCard label="Campañas Activas" value={CAMPAIGNS.filter(c=>c.status==='ACTIVE').length.toString()} sub={`de ${CAMPAIGNS.length} totales`} />
      </div>

      {/* Tabla */}
      <div style={{ background:CRD, border:'1px solid '+BRD, borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid '+BRD }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Todas las Campañas</span>
          <input
            type="text"
            placeholder="Buscar campaña..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            style={{
              background:BG, border:'1px solid '+BRD, borderRadius:6,
              padding:'6px 12px', color:TXT, fontSize:13, outline:'none', width:220,
            }}
          />
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {[
                  ['name','Campaña'],['status','Estado'],['spend','Gasto'],
                  ['impressions','Impresiones'],['clicks','Clics'],
                  ['ctr','CTR'],['cpc','CPC'],['roas','ROAS'],
                ].map(([k,h])=>(
                  <th key={k} onClick={()=>handleSort(k)}
                    style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600,
                      letterSpacing:'0.06em', textTransform:'uppercase', color:SEC,
                      borderBottom:'1px solid '+BRD, cursor:'pointer', whiteSpace:'nowrap',
                    }}>
                    {h}<SortIcon k={k} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c,i) => (
                <tr key={c.id} style={{ borderBottom: i<filtered.length-1 ? '1px solid rgba(40,40,40,0.5)' : 'none' }}>
                  <td style={{ padding:'12px 16px', fontSize:13, maxWidth:220 }}>{c.name}</td>
                  <td style={{ padding:'12px 16px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtCOP(c.spend)}</td>
                  <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtNum(c.impressions)}</td>
                  <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{c.clicks.toLocaleString('es-CO')}</td>
                  <td style={{ padding:'12px 16px', ...MONO, fontSize:13, color: c.ctr>3 ? GR : c.ctr>2 ? AM : RE }}>{c.ctr}%</td>
                  <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtCOP(c.cpc)}</td>
                  <td style={{ padding:'12px 16px', minWidth:120 }}><RoasBar roas={c.roas} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA C — ANALÍTICA
══════════════════════════════════════════════════════════════════════ */
function Analytics() {
  const CURR = {
    spend: DAILY_DATA.reduce((s,d)=>s+d.spend,0),
    impressions: DAILY_DATA.reduce((s,d)=>s+d.impressions,0),
    clicks: DAILY_DATA.reduce((s,d)=>s+d.clicks,0),
    ctr: 3.15, cpc: 329, roas: 4.40,
  }

  const compareRows = [
    { metric:'Gasto Total',   curr:fmtCOP(CURR.spend),       prev:fmtCOP(PREV_PERIOD.spend),       chg:((CURR.spend-PREV_PERIOD.spend)/PREV_PERIOD.spend)*100 },
    { metric:'Impresiones',   curr:fmtNum(CURR.impressions),  prev:fmtNum(PREV_PERIOD.impressions),  chg:((CURR.impressions-PREV_PERIOD.impressions)/PREV_PERIOD.impressions)*100 },
    { metric:'Clics',         curr:fmtNum(CURR.clicks),       prev:fmtNum(PREV_PERIOD.clicks),       chg:((CURR.clicks-PREV_PERIOD.clicks)/PREV_PERIOD.clicks)*100 },
    { metric:'CTR',           curr:CURR.ctr+'%',              prev:PREV_PERIOD.ctr+'%',              chg:((CURR.ctr-PREV_PERIOD.ctr)/PREV_PERIOD.ctr)*100 },
    { metric:'CPC',           curr:fmtCOP(CURR.cpc),          prev:fmtCOP(PREV_PERIOD.cpc),          chg:((CURR.cpc-PREV_PERIOD.cpc)/PREV_PERIOD.cpc)*100 },
    { metric:'ROAS',          curr:CURR.roas+'x',             prev:PREV_PERIOD.roas+'x',             chg:((CURR.roas-PREV_PERIOD.roas)/PREV_PERIOD.roas)*100 },
  ]

  const roasByCampaign = CAMPAIGNS.map(c => ({
    name: c.name.split(' - ')[0],
    roas: c.roas,
    fill: c.roas > 4 ? GR : c.roas >= 2 ? AM : RE,
  }))

  return (
    <div style={S.content}>
      <SectionHeader title="Analítica de Rendimiento" />

      {/* Gráfico 1: Gasto vs ROAS doble eje */}
      <div style={{ ...S.chartCard, marginBottom:24 }}>
        <div style={S.chartTitle}>Gasto Diario vs ROAS — Doble Eje Y</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={DAILY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
            <XAxis dataKey="date" tick={{ fill:SEC, fontSize:11 }} interval={4} />
            <YAxis yAxisId="left" tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`} label={{ value:'Gasto USD', angle:-90, position:'insideLeft', fill:SEC, fontSize:11 }} />
            <YAxis yAxisId="right" orientation="right" domain={[0,8]} tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>v+'x'} label={{ value:'ROAS', angle:90, position:'insideRight', fill:SEC, fontSize:11 }} />
            <Tooltip contentStyle={TT_STYLE} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar yAxisId="left" dataKey="spend" name="Gasto" fill={AC} fillOpacity={0.7} />
            <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke={GR} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2: ROAS por campaña */}
      <div style={{ ...S.chartCard, marginBottom:24 }}>
        <div style={S.chartTitle}>ROAS por Campaña — Codificado por Color</div>
        <div style={{ marginBottom:12, display:'flex', gap:16, fontSize:12, color:SEC }}>
          <span style={{ color:GR }}>■ ROAS &gt; 4x (Excelente)</span>
          <span style={{ color:AM }}>■ ROAS 2–4x (Promedio)</span>
          <span style={{ color:RE }}>■ ROAS &lt; 2x (Bajo)</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={roasByCampaign} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
            <XAxis type="number" tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>v+'x'} />
            <YAxis type="category" dataKey="name" tick={{ fill:SEC, fontSize:11 }} width={140} />
            <Tooltip contentStyle={TT_STYLE} formatter={v=>[v+'x','ROAS']} />
            <Bar dataKey="roas" radius={[0,4,4,0]}>
              {roasByCampaign.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 3: Impresiones y Clics en el tiempo */}
      <div style={{ ...S.chartCard, marginBottom:24 }}>
        <div style={S.chartTitle}>Impresiones &amp; Clics a lo Largo del Tiempo</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={DAILY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
            <XAxis dataKey="date" tick={{ fill:SEC, fontSize:11 }} interval={4} />
            <YAxis yAxisId="impr" tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>fmtNum(v)} />
            <YAxis yAxisId="clks" orientation="right" tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>fmtNum(v)} />
            <Tooltip contentStyle={TT_STYLE} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Line yAxisId="impr" type="monotone" dataKey="impressions" name="Impresiones" stroke={AC} strokeWidth={2} dot={false} />
            <Line yAxisId="clks" type="monotone" dataKey="clicks" name="Clics" stroke={BL} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla comparativa */}
      <div style={{ background:CRD, border:'1px solid '+BRD, borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid '+BRD }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Período Actual vs Anterior</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Métrica','Período Actual','Período Anterior','Cambio'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:SEC, borderBottom:'1px solid '+BRD }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row,i)=>(
              <tr key={row.metric} style={{ borderBottom: i<compareRows.length-1 ? '1px solid rgba(40,40,40,0.5)':'none' }}>
                <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500 }}>{row.metric}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{row.curr}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13, color:SEC }}>{row.prev}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13, fontWeight:600, color: row.chg >= 0 ? GR : RE }}>
                  {row.chg >= 0 ? '↑' : '↓'} {Math.abs(row.chg).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA D — CREATIVIDADES
══════════════════════════════════════════════════════════════════════ */
function Creatives() {
  const [perfFilter, setPerfFilter] = useState('all')
  const [campFilter, setCampFilter] = useState('all')

  const campaigns = ['all', ...new Set(CREATIVES.map(c=>c.campaign))]

  const filtered = useMemo(() => {
    return CREATIVES.filter(c => {
      const perfOk = perfFilter === 'all'
        || (perfFilter === 'top' && c.roas > 5)
        || (perfFilter === 'avg' && c.roas >= 2 && c.roas <= 5)
        || (perfFilter === 'low' && c.roas < 2)
      const campOk = campFilter === 'all' || c.campaign === campFilter
      return perfOk && campOk
    })
  }, [perfFilter, campFilter])

  const perfBtns = [
    { k:'all', label:'Todos' },
    { k:'top', label:'🏆 Top (>5x)' },
    { k:'avg', label:'↗ Promedio (2–5x)' },
    { k:'low', label:'↘ Bajo (<2x)' },
  ]

  return (
    <div style={S.content}>
      <SectionHeader title="Biblioteca Creativa" />

      {/* Filtros */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <select
          value={campFilter}
          onChange={e=>setCampFilter(e.target.value)}
          style={{ background:CRD, border:'1px solid '+BRD, borderRadius:6, padding:'6px 12px', color:TXT, fontSize:12, outline:'none', cursor:'pointer' }}
        >
          {campaigns.map(c=><option key={c} value={c}>{c==='all'?'Todas las campañas':c}</option>)}
        </select>
        {perfBtns.map(b=>(
          <button key={b.k} onClick={()=>setPerfFilter(b.k)} style={{
            padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
            border: perfFilter===b.k ? '1px solid '+AC : '1px solid '+BRD,
            background: perfFilter===b.k ? ACD : CRD,
            color: perfFilter===b.k ? AC : SEC,
          }}>{b.label}</button>
        ))}
      </div>

      {/* Grid de creatividades */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {filtered.map(c => {
          const level = c.roas > 5 ? 'TOP' : c.roas >= 2 ? 'AVG' : 'LOW'
          return (
            <div key={c.id} style={{ background:CRD, border:'1px solid '+BRD, borderRadius:10, overflow:'hidden' }}>
              {/* Miniatura */}
              <div style={{ position:'relative', aspectRatio:'16/9', background:BRD, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>
                {c.emoji}
                <div style={{ position:'absolute', top:8, right:8 }}>
                  <PerfBadge roas={c.roas} />
                </div>
              </div>
              {/* Info */}
              <div style={{ padding:14 }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:12, lineHeight:1.4, color:TXT }}>{c.name}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    { label:'GASTO', value:fmtCOP(c.spend) },
                    { label:'IMPRESIONES', value:fmtNum(c.impressions) },
                    { label:'CTR', value:c.ctr+'%' },
                    { label:'ROAS', value:c.roas+'x' },
                  ].map(m=>(
                    <div key={m.label}>
                      <div style={{ fontSize:10, color:SEC, textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</div>
                      <div style={{ fontSize:15, fontWeight:600, ...MONO, color: m.label==='ROAS' ? (c.roas>4?GR:c.roas>=2?AM:RE) : TXT }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA E — AUDIENCIAS
══════════════════════════════════════════════════════════════════════ */
function Audiences() {
  const DEVICE_COLORS_LIST = [AC, BL, '#A78BFA']
  const ROAS_COLOR = (r) => r > 4 ? GR : r >= 3 ? AM : RE

  return (
    <div style={S.content}>
      <SectionHeader title="Información de Audiencia" />

      {/* Gráfico 1: Edad y Género (barras agrupadas) + Dispositivos (dona) */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:24 }}>
        <div style={S.chartCard}>
          <div style={S.chartTitle}>Distribución por Edad y Género (Impresiones)</div>
          <div style={{ marginBottom:12, display:'flex', gap:16, fontSize:12 }}>
            <span style={{ color:AC }}>■ Masculino</span>
            <span style={{ color:BL }}>■ Femenino</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={AGE_GENDER}>
              <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
              <XAxis dataKey="age" tick={{ fill:SEC, fontSize:11 }} />
              <YAxis tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>fmtNum(v)} />
              <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[fmtNum(v), n==='male'?'Masculino':'Femenino']} />
              <Bar dataKey="male" name="Masculino" fill={AC} fillOpacity={0.85} />
              <Bar dataKey="female" name="Femenino" fill={BL} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartCard}>
          <div style={S.chartTitle}>Desglose por Dispositivo</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={DEVICES} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {DEVICES.map((_, i) => <Cell key={i} fill={DEVICE_COLORS_LIST[i]} />)}
              </Pie>
              <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[v+'%',n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
            {DEVICES.map((d,i) => (
              <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:DEVICE_COLORS_LIST[i], display:'inline-block' }} />
                  {d.name}
                </span>
                <span style={{ ...MONO, fontWeight:600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico 3: Rendimiento por Placement */}
      <div style={{ ...S.chartCard, marginBottom:24 }}>
        <div style={S.chartTitle}>Rendimiento por Ubicación / Placement</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PLACEMENTS} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
            <XAxis type="number" tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>fmtCOP(v)} />
            <YAxis type="category" dataKey="name" tick={{ fill:SEC, fontSize:11 }} width={140} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>n==='spend'?[fmtCOP(v),'Gasto']:[v+'x','ROAS']} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="spend" name="Gasto" fill={AC} fillOpacity={0.75} radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla Top 10 países */}
      <div style={{ background:CRD, border:'1px solid '+BRD, borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid '+BRD }}>
          <span style={{ fontSize:13, fontWeight:600 }}>Top 10 Ubicaciones Geográficas (por Gasto)</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['#','País','Gasto','Impresiones','Clics','ROAS'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:SEC, borderBottom:'1px solid '+BRD }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GEO.map((g,i) => (
              <tr key={g.country} style={{ borderBottom: i<GEO.length-1 ? '1px solid rgba(40,40,40,0.5)':'none' }}>
                <td style={{ padding:'12px 16px', fontSize:13, color:SEC }}>{i+1}</td>
                <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500 }}>{g.country}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtCOP(g.spend)}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{fmtNum(g.impressions)}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13 }}>{g.clicks.toLocaleString('es-CO')}</td>
                <td style={{ padding:'12px 16px', ...MONO, fontSize:13, color:ROAS_COLOR(g.roas) }}>{g.roas}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PÁGINA F — PRESUPUESTO
══════════════════════════════════════════════════════════════════════ */
function Budget() {
  // Calcular ritmo: días transcurridos del mes = 16 de 30 = 53%
  const daysElapsed = 16
  const daysTotal = 30
  const timePct = (daysElapsed / daysTotal) * 100

  const budgetData = CAMPAIGNS.map(c => {
    const totalBudget = c.daily_budget * daysTotal
    const spentPct = (c.spend / totalBudget) * 100
    const remaining = totalBudget - c.spend
    const dailyAvg = c.spend / daysElapsed
    const projected = dailyAvg * daysTotal
    // Ritmo: si spentPct > timePct+10 → rápido, si < timePct-10 → lento, sino → bien
    const pace = spentPct > timePct + 10 ? 'fast' : spentPct < timePct - 10 ? 'slow' : 'on'
    return { ...c, totalBudget, spentPct, remaining, dailyAvg, projected, pace, timePct }
  })

  const activeBudgets = budgetData.filter(c=>c.status==='ACTIVE')

  // Datos para el gráfico de barras diarias con línea de presupuesto promedio
  const avgDailyBudget = DAILY_DATA.reduce((s,d)=>s+d.spend,0) / DAILY_DATA.length * 1.15
  const chartData = DAILY_DATA.map(d => ({ ...d, budget: avgDailyBudget }))

  const totalProjected = budgetData.reduce((s,c)=>s+c.projected,0)
  const totalBudget    = budgetData.reduce((s,c)=>s+c.totalBudget,0)
  const totalSpent     = budgetData.reduce((s,c)=>s+c.spend,0)
  const totalRemaining = totalBudget - totalSpent

  const paceColors = { on: GR, fast: '#FB923C', slow: BL }
  const paceLabels = { on: '✓ En ritmo', fast: '⚡ Rápido', slow: '🐢 Lento' }

  return (
    <div style={S.content}>
      <SectionHeader title="Seguimiento de Presupuesto" />

      {/* KPI summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <KpiCard label="Presupuesto Total" value={fmtCOP(totalBudget)} sub="todas las campañas" />
        <KpiCard label="Gastado" value={fmtCOP(totalSpent)} sub={`${((totalSpent/totalBudget)*100).toFixed(0)}% del total`} change={12.4} />
        <KpiCard label="Restante" value={fmtCOP(totalRemaining)} sub="presupuesto disponible" />
        <KpiCard label="Proyectado Fin de Mes" value={fmtCOP(totalProjected)} sub="basado en ritmo actual" />
      </div>

      {/* Gráfico de gasto diario + línea presupuesto */}
      <div style={{ ...S.chartCard, marginBottom:24 }}>
        <div style={S.chartTitle}>Gasto Diario vs Presupuesto Promedio Diario</div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRD} />
            <XAxis dataKey="date" tick={{ fill:SEC, fontSize:11 }} interval={4} />
            <YAxis tick={{ fill:SEC, fontSize:11 }} tickFormatter={v=>fmtCOP(v)} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[fmtCOP(v),n]} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="spend" name="Gasto Diario" fill={AC} fillOpacity={0.75} />
            <Line type="monotone" dataKey="budget" name="Presupuesto Promedio" stroke={AM} strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Grid de tarjetas de presupuesto por campaña */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {budgetData.map(c => (
          <div key={c.id} style={{ background:CRD, border:'1px solid '+BRD, borderRadius:10, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, lineHeight:1.3, maxWidth:160 }}>{c.name}</div>
                <div style={{ fontSize:10, color:SEC, marginTop:2 }}>Presupuesto Diario</div>
              </div>
              <span style={{ padding:'3px 8px', borderRadius:4, fontSize:11, fontWeight:600, background: c.pace==='on' ? GRD : c.pace==='fast' ? AMD : 'rgba(96,165,250,0.12)', color:paceColors[c.pace], border:'1px solid '+(c.pace==='on'?'rgba(74,222,128,0.25)':c.pace==='fast'?'rgba(251,191,36,0.25)':'rgba(96,165,250,0.25)') }}>
                {paceLabels[c.pace]}
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { label:'Presupuesto Total', value:fmtCOP(c.totalBudget) },
                { label:'Gastado', value:fmtCOP(c.spend) },
                { label:'Restante', value:fmtCOP(c.remaining) },
                { label:'Proyectado', value:fmtCOP(c.projected) },
              ].map(m=>(
                <div key={m.label}>
                  <div style={{ fontSize:10, color:SEC, textTransform:'uppercase', letterSpacing:'0.04em' }}>{m.label}</div>
                  <div style={{ fontSize:15, fontWeight:600, ...MONO }}>{m.value}</div>
                </div>
              ))}
            </div>
            {/* Barra de progreso */}
            <div style={{ marginBottom:6, display:'flex', justifyContent:'space-between', fontSize:11, color:SEC }}>
              <span>Progreso: {c.spentPct.toFixed(0)}%</span>
              <span>Tiempo: {c.timePct.toFixed(0)}%</span>
            </div>
            <div style={{ height:8, background:BRD, borderRadius:4, overflow:'hidden' }}>
              <div style={{ width:Math.min(c.spentPct,100)+'%', height:'100%', background:paceColors[c.pace], borderRadius:4, transition:'width 0.5s' }} />
            </div>
            <div style={{ marginTop:6, fontSize:11, color:SEC }}>
              Diario promedio: <span style={MONO}>{fmtCOP(Math.round(c.dailyAvg))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — APP
══════════════════════════════════════════════════════════════════════ */
const DATE_RANGES = [
  { label:'Últimos 7 días',  value:'7d' },
  { label:'Últimos 30 días', value:'30d' },
  { label:'Últimos 90 días', value:'90d' },
  { label:'Este mes',        value:'month' },
]

const NAV_ITEMS = [
  { id:'overview',   label:'Vista General', icon:'▦' },
  { id:'campaigns',  label:'Campañas',      icon:'◈' },
  { id:'analytics',  label:'Analítica',     icon:'↗' },
  { id:'creatives',  label:'Creatividades', icon:'▣' },
  { id:'audiences',  label:'Audiencias',    icon:'◉' },
  { id:'budget',     label:'Presupuesto',   icon:'◎' },
]

const PAGE_TITLES = {
  overview: 'Vista General', campaigns: 'Campañas',
  analytics: 'Analítica', creatives: 'Creatividades',
  audiences: 'Audiencias', budget: 'Presupuesto',
}

export default function App() {
  const [activePage, setActivePage] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  const renderPage = () => {
    const props = { onNavigate: setActivePage }
    switch (activePage) {
      case 'overview':   return <Overview {...props} />
      case 'campaigns':  return <Campaigns />
      case 'analytics':  return <Analytics />
      case 'creatives':  return <Creatives />
      case 'audiences':  return <Audiences />
      case 'budget':     return <Budget />
      default:           return <Overview {...props} />
    }
  }

  return (
    <div style={S.page}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoDot} />
          <span style={S.logoText}>Meta Ads</span>
        </div>
        {NAV_ITEMS.map(item => (
          <div key={item.id} style={S.navItem(activePage===item.id)} onClick={()=>setActivePage(item.id)}>
            <span style={S.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
        <div style={S.sidebarFooter}>{ACCOUNT.id}</div>
      </div>

      {/* Main */}
      <div style={S.main}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerTitle}>{PAGE_TITLES[activePage]}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={S.accountPill}>{ACCOUNT.name}</div>
            <div style={S.datePill}>
              <span>📅</span>
              <select
                value={dateRange}
                onChange={e=>setDateRange(e.target.value)}
                style={{ background:'transparent', border:'none', color:TXT, fontSize:13, outline:'none', cursor:'pointer' }}
              >
                {DATE_RANGES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}
