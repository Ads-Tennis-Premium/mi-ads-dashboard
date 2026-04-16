import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart
} from 'recharts'

/* ─── COLORES ─────────────────────────────────────────────── */
const C = {
  accent:      '#8d60ca',
  accentLight: '#b899e8',
  green:       '#4ade80',
  amber:       '#fbbf24',
  red:         '#f87171',
  blue:        '#60a5fa',
  card:        '#161616',
  border:      'rgba(255,255,255,0.07)',
  muted:       '#777',
}

/* ─── DATOS GLOBALES ──────────────────────────────────────── */
const GLOBAL = {
  spend:             63679593,
  impressions:       6144998,
  clicks:            193510,
  ctr:               3.149065,
  cpc:               329.08,
  roas:              4.40486,
  purchases:         989,
  add_to_cart:       9584,
  initiate_checkout: 4236,
}

/* ─── GENERADOR DE DATOS DIARIOS ──────────────────────────── */
function genDaily() {
  const rows = []
  const startDate = new Date('2026-03-16')
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    const r  = 0.65 + Math.random() * 0.70
    const r2 = 0.75 + Math.random() * 0.50
    rows.push({
      date:        label,
      spend:       Math.round(2122653 * r),
      impressions: Math.round(204833  * r2),
      clicks:      Math.round(6450    * r2),
      ctr:         parseFloat((3.15 * (0.75 + Math.random() * 0.5)).toFixed(2)),
      cpc:         Math.round(329 * (0.80 + Math.random() * 0.4)),
    })
  }
  return rows
}

const DAILY = genDaily()

/* ─── AGRUPADOR SEMANAL SEGURO ────────────────────────────── */
// Usa Math.min(..., 3) para que con 30 días el índice nunca supere 3.
// Sin esto, floor(28/7)=4 → wks[4] es undefined → .push() lanza TypeError.
function groupByWeek(rows) {
  const wks = [[], [], [], []]
  ;(rows ?? []).forEach((d, i) => {
    const idx = Math.min(Math.floor(i / 7), 3)
    wks[idx].push(d)
  })
  return wks
}

const CAMPAIGNS = [
  { id: 1, name: 'Interacción - Perfil IG - Aumento Seguidores', status: 'ACTIVE',  budget: 200,  spend: 665,      impressions: 23316,   clicks: 1490,  ctr: 6.39, cpc: 446 },
  { id: 2, name: 'Prospección - Calzado Nike / Adidas',          status: 'ACTIVE',  budget: 800,  spend: 29100000, impressions: 2800000, clicks: 92000, ctr: 3.28, cpc: 316 },
  { id: 3, name: 'Remarketing - Carrito Abandonado',             status: 'ACTIVE',  budget: 500,  spend: 18200000, impressions: 1240000, clicks: 38000, ctr: 3.06, cpc: 479 },
  { id: 4, name: 'Retención - Clientes Frecuentes',              status: 'PAUSED',  budget: 400,  spend: 16000000, impressions: 1500000, clicks: 54000, ctr: 3.60, cpc: 296 },
]

const ADS = [
  { id: 1, name: 'Presentación / Imagen / Nike V2K Combinan Con Todo', type: 'imagen',   spend: 88000,  impressions: 551,  clicks: 13, ctr: 2.36, emoji: '👟' },
  { id: 2, name: 'Presentación / Video / TT - VO041 - Unboxing',       type: 'video',    spend: 273000, impressions: 1532, clicks: 42, ctr: 2.74, emoji: '🎬' },
  { id: 3, name: 'Catálogo / Carrusel / New Balance 574 Serie',         type: 'carrusel', spend: 145000, impressions: 980,  clicks: 31, ctr: 3.16, emoji: '🛍️' },
  { id: 4, name: 'Story / Video / Puma x Vans Flash Sale',              type: 'video',    spend: 159000, impressions: 2100, clicks: 61, ctr: 2.9,  emoji: '⚡' },
]

const FUNNEL = [
  { label: 'Impresiones', value: 6144998, pct: 100   },
  { label: 'Clics',       value: 193510,  pct: 3.15  },
  { label: 'Add to Cart', value: 9584,    pct: 0.156 },
  { label: 'Checkout',    value: 4236,    pct: 0.069 },
  { label: 'Compras',     value: 989,     pct: 0.016 },
]

/* ─── HELPERS SEGUROS ─────────────────────────────────────── */
// Evita NaN/Infinity propagándose a la UI
const safeNum   = (n, fallback = 0) => (typeof n === 'number' && isFinite(n) ? n : fallback)
const safeFixed = (n, dec = 2)      => safeNum(n).toFixed(dec)
const fmt       = (n)               => new Intl.NumberFormat('es-CO').format(Math.round(safeNum(n)))
const fmtCOP    = (n)               => '$' + fmt(n)
const fmtM      = (n) => {
  const v = safeNum(n)
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000)     return '$' + (v / 1_000).toFixed(0)     + 'K'
  return '$' + Math.round(v)
}

/* ─── TOOLTIP CUSTOM ──────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1e1e1e', border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#ccc',
    }}>
      <p style={{ marginBottom: 4, color: '#999' }}>{label ?? ''}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p?.color ?? C.accent }}>
          {p?.name ?? ''}: {formatter ? formatter(p?.value) : (p?.value ?? '—')}
        </p>
      ))}
    </div>
  )
}

/* ─── COMPONENTES BASE ────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, ...style }}>
    {children}
  </div>
)

const CardTitle = ({ children }) => (
  <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
    {children}
  </p>
)

const Badge = ({ active }) => (
  <span style={{
    display: 'inline-block', padding: '2px 7px', borderRadius: 3, fontSize: 10, fontWeight: 500,
    background: active ? 'rgba(74,222,128,.12)' : 'rgba(251,191,36,.12)',
    color:      active ? C.green : C.amber,
  }}>
    {active ? 'ACTIVE' : 'PAUSED'}
  </span>
)

const KPI = ({ label, value, sub, subColor }) => (
  <Card>
    <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 500 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, marginTop: 4, color: subColor ?? C.muted }}>{sub}</div>}
  </Card>
)

/* ─── SECCIÓN: VISTA GENERAL ──────────────────────────────── */
function OverviewSection() {
  // groupByWeek asegura que el índice siempre esté entre 0 y 3
  const weekly = useMemo(() => {
    const wks = groupByWeek(DAILY)
    return wks.map((w, i) => {
      const len = w.length || 1 // nunca divide por cero
      return {
        week:  `Sem ${i + 1}`,
        spend: Math.round(w.reduce((s, d) => s + safeNum(d?.spend), 0) / len),
        ctr:   parseFloat((w.reduce((s, d) => s + safeNum(d?.ctr), 0) / len).toFixed(2)),
      }
    })
  }, [])

  const eventsData = [
    { name: 'Add to Cart', value: safeNum(GLOBAL.add_to_cart) },
    { name: 'Checkout',    value: safeNum(GLOBAL.initiate_checkout) },
    { name: 'Compras',     value: safeNum(GLOBAL.purchases) },
  ]
  const PIE_COLORS = [C.accent, C.blue, C.green]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        <KPI label="Inversión Total" value="$63.7M"                  sub="COP · 30 días" />
        <KPI label="ROAS"            value="4.40x"                   sub="↑ omni_purchase"   subColor={C.green} />
        <KPI label="Compras"         value={fmt(GLOBAL.purchases)}   sub="↑ conversiones"    subColor={C.green} />
        <KPI label="CTR Promedio"    value="3.15%"                   sub="↑ sobre benchmark" subColor={C.green} />
        <KPI label="Impresiones"     value="6.14M"                   sub="últimos 30 días" />
        <KPI label="Clics"           value={fmt(GLOBAL.clicks)}      sub="total período" />
        <KPI label="CPC Promedio"    value="$329"                    sub="COP por clic" />
        <KPI label="Add to Cart"     value={fmt(GLOBAL.add_to_cart)} sub="↑ alto engagement" subColor={C.green} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <CardTitle>Gasto diario — últimos 30 días (COP)</CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DAILY} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={fmtM} />
              <Tooltip content={<CustomTooltip formatter={fmtCOP} />} />
              <Bar dataKey="spend" name="Spend" fill={C.accent} radius={[2, 2, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Embudo de conversión</CardTitle>
          {(FUNNEL ?? []).map((f, i) => {
            const colors = ['rgba(141,96,202,1)','rgba(141,96,202,.75)','rgba(141,96,202,.55)','rgba(141,96,202,.38)','rgba(74,222,128,.8)']
            const pct = safeNum(f?.pct, 2)
            return (
              <div key={f?.label ?? i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: C.muted }}>{f?.label ?? '—'}</span>
                  <span style={{ fontWeight: 500 }}>{fmt(f?.value)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 3, height: 5 }}>
                  <div style={{ width: `${Math.max(pct, 2)}%`, height: 5, borderRadius: 3, background: colors[i] ?? C.accent }} />
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card>
          <CardTitle>CTR diario (%)</CardTitle>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={DAILY}>
              <defs>
                <linearGradient id="ctrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accentLight} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.accentLight} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} />
              <Tooltip content={<CustomTooltip formatter={v => safeFixed(v) + '%'} />} />
              <Area type="monotone" dataKey="ctr" name="CTR" stroke={C.accentLight} fill="url(#ctrGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Eventos de conversión</CardTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={eventsData} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={3}>
                  {eventsData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i] ?? C.accent} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {eventsData.map((e, i) => (
                <div key={e?.name ?? i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] ?? C.accent, flexShrink: 0 }} />
                  <span style={{ color: C.muted, flex: 1 }}>{e?.name ?? '—'}</span>
                  <span style={{ fontWeight: 500 }}>{fmt(e?.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ─── SECCIÓN: CAMPAÑAS ───────────────────────────────────── */
function CampaignsSection() {
  const [sortCol, setSortCol] = useState('spend')
  const [sortDir, setSortDir] = useState(-1)

  const sorted = useMemo(() => {
    // filter(Boolean) descarta cualquier entrada null/undefined en el array
    const safe = (CAMPAIGNS ?? []).filter(Boolean)
    return [...safe].sort((a, b) => {
      // Columnas de texto: comparación con localeCompare
      if (typeof a?.[sortCol] === 'string') {
        return (a[sortCol] ?? '').localeCompare(b?.[sortCol] ?? '') * sortDir
      }
      // Columnas numéricas: safeNum evita NaN en la resta
      return (safeNum(a?.[sortCol]) - safeNum(b?.[sortCol])) * sortDir
    })
  }, [sortCol, sortDir])

  const toggleSort = (col) => {
    if (col === sortCol) setSortDir(d => d * -1)
    else { setSortCol(col); setSortDir(-1) }
  }

  const thStyle = (col) => ({
    padding: '8px 12px', textAlign: 'left', fontSize: 11,
    color: sortCol === col ? C.accent : C.muted,
    borderBottom: `1px solid ${C.border}`, fontWeight: 400,
    textTransform: 'uppercase', letterSpacing: '.4px', cursor: 'pointer', whiteSpace: 'nowrap',
  })
  const tdStyle = {
    padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,.04)',
    color: '#ccc', fontSize: 12, whiteSpace: 'nowrap',
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <KPI label="Campañas Activas"        value="3"      sub="de 4 totales"           subColor={C.green} />
        <KPI label="CTR más alto"            value="6.39%"  sub="↑ Instagram Seguidores" subColor={C.green} />
        <KPI label="Presupuesto diario total" value="$1,900" sub="COP combinado" />
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '.5px' }}>Campañas</p>
          <p style={{ fontSize: 10, color: C.muted }}>Haz clic en las columnas para ordenar</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={thStyle('name')}        onClick={() => toggleSort('name')}>Campaña</th>
                <th style={thStyle('status')}      onClick={() => toggleSort('status')}>Estado</th>
                <th style={{ ...thStyle('budget'),      textAlign: 'right' }} onClick={() => toggleSort('budget')}>Presup./día</th>
                <th style={{ ...thStyle('spend'),       textAlign: 'right' }} onClick={() => toggleSort('spend')}>
                  Spend {sortCol === 'spend' ? (sortDir === -1 ? '↓' : '↑') : '↕'}
                </th>
                <th style={{ ...thStyle('impressions'), textAlign: 'right' }} onClick={() => toggleSort('impressions')}>Impresiones</th>
                <th style={{ ...thStyle('clicks'),      textAlign: 'right' }} onClick={() => toggleSort('clicks')}>Clics</th>
                <th style={{ ...thStyle('ctr'),         textAlign: 'right' }} onClick={() => toggleSort('ctr')}>
                  CTR {sortCol === 'ctr' ? (sortDir === -1 ? '↓' : '↑') : '↕'}
                </th>
                <th style={{ ...thStyle('cpc'),         textAlign: 'right' }} onClick={() => toggleSort('cpc')}>CPC</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, idx) => (
                <tr
                  key={c?.id ?? idx}
                  style={{ cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.025)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td style={{ ...tdStyle, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c?.name ?? '—'}
                  </td>
                  <td style={tdStyle}><Badge active={c?.status === 'ACTIVE'} /></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>${fmt(c?.budget)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: C.accent, fontWeight: 500 }}>{fmtCOP(c?.spend)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(c?.impressions)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(c?.clicks)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: C.green }}>{safeFixed(c?.ctr)}%</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>${fmt(c?.cpc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

/* ─── SECCIÓN: ANALÍTICA ──────────────────────────────────── */
function AnalyticsSection() {
  const weeklyData = useMemo(() => {
    const wks = groupByWeek(DAILY) // índice siempre 0–3
    return wks.map((w, i) => {
      const len = w.length || 1   // divide por cero imposible
      return {
        week:        `Sem ${i + 1}`,
        spend:       Math.round(w.reduce((s, d) => s + safeNum(d?.spend), 0)),
        clicks:      Math.round(w.reduce((s, d) => s + safeNum(d?.clicks), 0)),
        cpc:         Math.round(w.reduce((s, d) => s + safeNum(d?.cpc), 0) / len),
        impressions: Math.round(w.reduce((s, d) => s + safeNum(d?.impressions), 0)),
      }
    })
  }, [])

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <CardTitle>Spend vs Clics por semana</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left"  tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={fmtM} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar  yAxisId="left"  dataKey="spend"  name="Spend" fill={C.accent} fillOpacity={0.75} radius={[4,4,0,0]} barSize={28} />
              <Line yAxisId="right" dataKey="clicks" name="Clics" type="monotone" stroke={C.blue} strokeWidth={2} dot={{ fill: C.blue, r: 4 }} strokeDasharray="4 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>CPC promedio por semana (COP)</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => '$' + v} />
              <Tooltip content={<CustomTooltip formatter={v => '$' + fmt(v) + ' COP'} />} />
              <Bar dataKey="cpc" name="CPC" radius={[5,5,0,0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={C.accent} fillOpacity={0.5 + i * 0.12} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ marginBottom: 12 }}>
        <CardTitle>Impresiones diarias</CardTitle>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={DAILY}>
            <defs>
              <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => (safeNum(v) / 1000).toFixed(0) + 'K'} />
            <Tooltip content={<CustomTooltip formatter={fmt} />} />
            <Area type="monotone" dataKey="impressions" name="Impresiones" stroke={C.green} fill="url(#impGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardTitle>CTR diario detallado (%)</CardTitle>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={DAILY}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => v + '%'} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip formatter={v => safeFixed(v) + '%'} />} />
            <Line type="monotone" dataKey="ctr" name="CTR" stroke={C.amber} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

/* ─── SECCIÓN: CREATIVIDADES ──────────────────────────────── */
function CreativesSection() {
  const chartData = useMemo(() =>
    (ADS ?? []).filter(Boolean).map(a => ({
      name:        (a?.name ?? '').split('/')?.[2]?.trim() || (a?.name ?? '').substring(0, 20) || 'Sin nombre',
      spend:       Math.round(safeNum(a?.spend) / 1000),
      ctr:         safeNum(a?.ctr),
      impressions: safeNum(a?.impressions),
    }))
  , [])

  return (
    <div>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
        {(ADS ?? []).length} creatividades · Campaña activa
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
        {(ADS ?? []).filter(Boolean).map((a, idx) => (
          <Card key={a?.id ?? idx} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(141,96,202,.07)', borderBottom: `1px solid ${C.border}`, fontSize: 36,
            }}>
              {a?.emoji ?? '📦'}
            </div>
            <div style={{ padding: 12 }}>
              <p style={{ fontSize: 11, color: '#ccc', marginBottom: 8, lineHeight: 1.4 }}>{a?.name ?? '—'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                {[
                  { l: 'Spend', v: fmtM(a?.spend) },
                  { l: 'Impr.', v: fmt(a?.impressions) },
                  { l: 'Clics', v: safeNum(a?.clicks) },
                  { l: 'CTR',   v: safeFixed(a?.ctr) + '%' },
                ].map(m => (
                  <div key={m.l} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 4, padding: '5px 7px' }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{m.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: m.l === 'CTR' ? C.green : '#e8e8e8' }}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 3, background: 'rgba(141,96,202,.15)', color: C.accent, fontSize: 10 }}>
                  {a?.type ?? 'ad'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Comparativo de creatividades — spend vs impresiones</CardTitle>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} width={110} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spend"       name="Spend (miles COP)" fill={C.accent} fillOpacity={0.75} radius={[0,4,4,0]} barSize={16} />
            <Bar dataKey="impressions" name="Impresiones"       fill={C.blue}   fillOpacity={0.6}  radius={[0,4,4,0]} barSize={16} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

/* ─── SECCIÓN: PRESUPUESTO ────────────────────────────────── */
function BudgetSection() {
  const cumulative = useMemo(() => {
    let acc = 0
    return (DAILY ?? []).map(d => {
      acc += safeNum(d?.spend) // safeNum evita que un spend=undefined convierta acc en NaN
      return { date: d?.date ?? '', value: acc }
    })
  }, [])

  const radarData = [
    { metric: 'CTR',        value: 63 },
    { metric: 'ROAS',       value: 88 },
    { metric: 'Conversión', value: 45 },
    { metric: 'Engagement', value: 92 },
    { metric: 'Alcance',    value: 71 },
  ]

  const spend    = safeNum(GLOBAL.spend)
  const dailyAvg = Math.round(spend / 30)
  const expected = (dailyAvg * 30) || 1  // evita división por cero
  const pacing   = Math.min(Math.round((spend / expected) * 100), 100)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <CardTitle>Pacing del período</CardTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>ROAS actual</div>
              <div style={{ fontSize: 40, fontWeight: 500, color: C.accent, lineHeight: 1 }}>4.40x</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>Spend ejecutado</div>
              <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 4, height: 8 }}>
                <div style={{ width: `${pacing}%`, height: 8, borderRadius: 4, background: C.green }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 4 }}>
                <span>{fmtM(spend)}</span>
                <span>~{fmtM(expected)} esperado</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            {[
              { l: 'Días transcurridos',       v: '30 / 30' },
              { l: 'Promedio diario',           v: fmtCOP(dailyAvg) + ' COP' },
              { l: 'Spend total',               v: fmtCOP(spend)    + ' COP' },
              { l: 'Ingresos estimados (ROAS)', v: fmtM(spend * safeNum(GLOBAL.roas)) + ' COP' },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 12 }}>
                <span style={{ color: C.muted }}>{r.l}</span>
                <span style={{ fontWeight: 500 }}>{r.v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Radar de eficiencia</CardTitle>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: C.muted, fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Performance" dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardTitle>Gasto acumulado — 30 días (COP)</CardTitle>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={cumulative}>
            <defs>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.amber} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.amber} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: C.muted, fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={fmtM} />
            <Tooltip content={<CustomTooltip formatter={fmtCOP} />} />
            <Area type="monotone" dataKey="value" name="Acumulado" stroke={C.amber} fill="url(#cumGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

/* ─── APP PRINCIPAL ───────────────────────────────────────── */
const SECTIONS = [
  { id: 'overview',   label: 'Vista General',  icon: '▦' },
  { id: 'campaigns',  label: 'Campañas',        icon: '◈' },
  { id: 'analytics',  label: 'Analítica',       icon: '↗' },
  { id: 'creatives',  label: 'Creatividades',   icon: '▣' },
  { id: 'budget',     label: 'Presupuesto',     icon: '◉' },
]

const SECTION_TITLES = {
  overview:  'Vista General',
  campaigns: 'Campañas',
  analytics: 'Analítica',
  creatives: 'Creatividades',
  budget:    'Presupuesto',
}

export default function App() {
  const [active, setActive] = useState('overview')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d0d0d', overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <div style={{
        width: 200, minWidth: 200, background: '#111',
        borderRight: '1px solid rgba(255,255,255,.07)',
        display: 'flex', flexDirection: 'column', padding: '16px 0',
      }}>
        <div style={{ padding: '12px 16px 24px', fontSize: 13, fontWeight: 500, color: '#8d60ca', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8d60ca' }} />
          Meta Ads
        </div>

        {SECTIONS.map(s => (
          <div
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', fontSize: 13, cursor: 'pointer',
              color:      active === s.id ? '#8d60ca' : '#777',
              background: active === s.id ? 'rgba(141,96,202,.12)' : 'transparent',
              borderLeft: `2px solid ${active === s.id ? '#8d60ca' : 'transparent'}`,
              transition: 'all .12s',
            }}
            onMouseEnter={e => { if (active !== s.id) { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'rgba(141,96,202,.06)' } }}
            onMouseLeave={e => { if (active !== s.id) { e.currentTarget.style.color = '#777'; e.currentTarget.style.background = 'transparent' } }}
          >
            <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{s.icon}</span>
            {s.label}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: 16, fontSize: 10, color: '#444', wordBreak: 'break-all' }}>
          act_1043322110399302
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <div style={{
          background: '#111', borderBottom: '1px solid rgba(255,255,255,.07)',
          padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{SECTION_TITLES[active] ?? ''}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(141,96,202,.15)', border: '1px solid rgba(141,96,202,.3)', borderRadius: 4, padding: '3px 8px', fontSize: 11, color: '#8d60ca' }}>
              Tennispremium
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#161616', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#ccc' }}>
              📅 Mar 16 – Abr 14, 2026
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {active === 'overview'  && <OverviewSection />}
          {active === 'campaigns' && <CampaignsSection />}
          {active === 'analytics' && <AnalyticsSection />}
          {active === 'creatives' && <CreativesSection />}
          {active === 'budget'    && <BudgetSection />}
        </div>
      </div>
    </div>
  )
}
