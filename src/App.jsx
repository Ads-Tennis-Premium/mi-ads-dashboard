import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart,
} from 'recharts'

/* ── COLORES ─────────────────────────────────────── */
const AC   = '#8d60ca'
const ACL  = '#b899e8'
const ACD  = 'rgba(141,96,202,0.14)'
const GR   = '#4ade80'
const GRD  = 'rgba(74,222,128,0.13)'
const AM   = '#fbbf24'
const AMD  = 'rgba(251,191,36,0.13)'
const RE   = '#f87171'
const RED  = 'rgba(248,113,113,0.13)'
const BL   = '#60a5fa'
const TEA  = '#2dd4bf'
const PNK  = '#f472b6'
const BG   = '#0d0d0d'
const SRF  = '#0f0f0f'
const CRD  = '#161616'
const BOR  = 'rgba(255,255,255,0.07)'
const BOR2 = 'rgba(255,255,255,0.13)'
const MUT  = '#666'
const MUT2 = '#999'

/* ── HELPERS ─────────────────────────────────────── */
const safeNum = (n, fb=0) => (typeof n==='number' && isFinite(n) ? n : fb)
const safeF   = (n, d=2)  => safeNum(n).toFixed(d)
const fmt     = n => new Intl.NumberFormat('es-CO').format(Math.round(safeNum(n)))
const fmtCOP  = n => '$'+fmt(n)
const fmtM    = n => {
  const v = safeNum(n)
  if (v>=1e6) return '$'+(v/1e6).toFixed(1)+'M'
  if (v>=1e3) return '$'+(v/1e3).toFixed(0)+'K'
  return '$'+Math.round(v)
}

/* ── DATOS GLOBALES ──────────────────────────────── */
const GL = {
  spend:63679593, impressions:6144998, clicks:193510,
  ctr:3.149065, cpc:329.08, roas:4.40486,
  purchases:989, add_to_cart:9584, initiate_checkout:4236,
  reach:2180000, frequency:2.82, cpm:10360,
  revenue:280375887, cpr:64387, conv_rate:0.511,
}
const PREV = { spend:55373559, roas:4.04, ctr:2.86 }

/* ── DATOS DIARIOS (deltas fijos, no random) ─────── */
const DAILY = (()=>{
  const D=[
    [0.88,0.92],[1.12,1.05],[0.95,0.98],[1.08,1.10],[0.75,0.82],
    [1.20,1.15],[1.05,1.08],[0.92,0.90],[1.15,1.12],[0.85,0.88],
    [1.18,1.20],[0.78,0.80],[1.10,1.08],[0.96,0.94],[1.22,1.18],
    [0.88,0.85],[1.05,1.02],[1.14,1.16],[0.82,0.84],[1.08,1.06],
    [0.90,0.92],[1.25,1.22],[0.72,0.75],[1.16,1.14],[1.02,1.00],
    [0.88,0.90],[1.10,1.08],[0.94,0.96],[1.18,1.15],[0.86,0.88],
  ]
  const s=new Date('2026-03-16')
  return D.map(([r,r2],i)=>{
    const d=new Date(s); d.setDate(d.getDate()+i)
    const spend=Math.round(2122653*r)
    const imp=Math.round(204833*r2)
    const clk=Math.round(6450*r2)
    return {
      date:`${d.getDate()}/${d.getMonth()+1}`,
      spend, impressions:imp, clicks:clk,
      ctr:parseFloat((clk/imp*100).toFixed(2)),
      cpc:Math.round(spend/clk),
      cpm:Math.round(spend/imp*1000),
    }
  })
})()

/* ── SEMANALES PRE-CALCULADOS ────────────────────── */
const WEEKLY = (()=>{
  const w=[],[],[],[]
  const wks=[w[0]=[],w[1]=[],w[2]=[],w[3]=[]]
  DAILY.forEach((d,i)=>wks[Math.min(Math.floor(i/7),3)].push(d))
  return wks.map((wk,i)=>{
    const n=wk.length||1
    return {
      week:`Sem ${i+1}`,
      spend: Math.round(wk.reduce((s,d)=>s+d.spend,0)),
      clicks:Math.round(wk.reduce((s,d)=>s+d.clicks,0)),
      impressions:Math.round(wk.reduce((s,d)=>s+d.impressions,0)),
      cpc:  Math.round(wk.reduce((s,d)=>s+d.cpc,0)/n),
      ctr:  parseFloat((wk.reduce((s,d)=>s+d.ctr,0)/n).toFixed(2)),
      cpm:  Math.round(wk.reduce((s,d)=>s+d.cpm,0)/n),
    }
  })
})()

/* ── CAMPAÑAS ────────────────────────────────────── */
const CAMPAIGNS=[
  {id:1,name:'Interacción - Perfil IG - Aumento Seguidores',status:'ACTIVE', budget:200, spend:665000,    impressions:73316,   reach:52000,  clicks:4690,  ctr:6.39,cpc:142,cpm:9070,  frequency:1.41,purchases:8,  cpr:83125,roas:1.20},
  {id:2,name:'Prospección - Calzado Nike / Adidas',          status:'ACTIVE', budget:800, spend:29100000, impressions:2800000, reach:980000, clicks:92000, ctr:3.28,cpc:316,cpm:10393,frequency:2.86,purchases:421,cpr:69121,roas:4.22},
  {id:3,name:'Remarketing - Carrito Abandonado',             status:'ACTIVE', budget:500, spend:18200000, impressions:1240000, reach:310000, clicks:38000, ctr:3.06,cpc:479,cpm:14677,frequency:4.00,purchases:398,cpr:45729,roas:6.18},
  {id:4,name:'Retención - Clientes Frecuentes',              status:'PAUSED', budget:400, spend:16000000, impressions:1500000, reach:420000, clicks:54000, ctr:3.60,cpc:296,cpm:10667,frequency:3.57,purchases:162,cpr:98765,roas:3.48},
]

/* ── ANUNCIOS ────────────────────────────────────── */
const ADS=[
  {id:1,name:'Presentación / Imagen / Nike V2K Combinan Con Todo',type:'imagen',  spend:88000, impressions:8551, clicks:213,ctr:2.49,cpm:10290,emoji:'👟'},
  {id:2,name:'Presentación / Video / TT - VO041 - Unboxing',      type:'video',   spend:273000,impressions:26532,clicks:842,ctr:3.17,cpm:10290,emoji:'🎬'},
  {id:3,name:'Catálogo / Carrusel / New Balance 574 Serie',        type:'carrusel',spend:145000,impressions:13980,clicks:418,ctr:2.99,cpm:10372,emoji:'🛍️'},
  {id:4,name:'Story / Video / Puma x Vans Flash Sale',             type:'video',   spend:159000,impressions:21000,clicks:630,ctr:3.00,cpm:7571, emoji:'⚡'},
]

/* ── AUDIENCIAS ──────────────────────────────────── */
const AGE_DATA=[
  {age:'18-24',spend:11800000,clicks:39450,conv:142,ctr:3.57},
  {age:'25-34',spend:21900000,clicks:67820,conv:378,ctr:3.07},
  {age:'35-44',spend:15200000,clicks:42260,conv:274,ctr:2.86},
  {age:'45-54',spend:9400000, clicks:26430,conv:138,ctr:3.59},
  {age:'55+',  spend:5200000, clicks:11820,conv:57, ctr:3.21},
]
const GENDER_DATA=[
  {name:'Masculino',value:58,spend:36934163,clicks:112236,ctr:3.24},
  {name:'Femenino', value:42,spend:26745430,clicks:81274, ctr:3.04},
]
const CITY_DATA=[
  {city:'Bogotá',      spend:19103877,clicks:58053,conv:297},
  {city:'Medellín',    spend:12735918,clicks:38702,conv:198},
  {city:'Cali',        spend:10188734,clicks:30961,conv:158},
  {city:'Barranquilla',spend:6367959, clicks:19351,conv:99},
  {city:'Cartagena',   spend:3820775, clicks:11610,conv:59},
]

/* ── PLACEMENTS ──────────────────────────────────── */
const PLACE=[
  {name:'Facebook Feed',    spend:19103877,impressions:1843499,clicks:60987,ctr:3.31,cpm:10363,roas:4.10},
  {name:'Instagram Feed',   spend:15919898,impressions:1536249,clicks:53183,ctr:3.46,cpm:10363,roas:4.82},
  {name:'Instagram Reels',  spend:12735918,impressions:1228999,clicks:42572,ctr:3.46,cpm:10363,roas:4.61},
  {name:'Instagram Stories',spend:9551938, impressions:921749, clicks:22019,ctr:2.39,cpm:10363,roas:3.55},
  {name:'Facebook Stories', spend:6367959, impressions:614499, clicks:14749,ctr:2.40,cpm:10363,roas:3.20},
]

/* ── HEATMAP ─────────────────────────────────────── */
const HDAYS =['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const HHOURS=['6h','8h','10h','12h','14h','16h','18h','20h','22h']
const HBASE=[
  [2.1,2.3,3.1,3.4,3.2,2.8,2.2,2.5,1.8],
  [2.0,2.4,3.3,3.5,3.4,3.0,2.6,2.7,1.9],
  [2.2,2.5,3.5,3.8,3.6,3.1,2.8,3.0,2.0],
  [2.1,2.3,3.2,3.6,3.5,3.2,3.0,3.1,2.1],
  [2.3,2.6,3.4,3.9,3.7,3.4,3.2,3.3,2.3],
  [1.8,2.0,2.5,3.0,3.8,4.1,4.2,3.8,2.5],
  [1.6,1.9,2.3,2.8,3.5,3.9,4.0,3.5,2.2],
]

/* ── EMBUDO ──────────────────────────────────────── */
const FUNNEL=[
  {label:'Impresiones',value:6144998,pct:100},
  {label:'Clics',      value:193510, pct:3.15},
  {label:'Add to Cart',value:9584,   pct:0.156},
  {label:'Checkout',   value:4236,   pct:0.069},
  {label:'Compras',    value:989,    pct:0.016},
]

/* ── BENCHMARKS ──────────────────────────────────── */
const BM={ctr:2.5,cpc:500,roas:3.0,cpm:12000,freq:3.5,cpr:80000}

/* ── TOOLTIP RECHARTS ────────────────────────────── */
function ChartTip({active,payload,label,formatter}){
  if(!active||!payload?.length) return null
  return (
    <div style={{background:'#1a1a1a',border:`1px solid ${BOR2}`,borderRadius:6,padding:'8px 12px',fontSize:11,color:'#ccc',maxWidth:200}}>
      <p style={{color:MUT2,marginBottom:4}}>{label??''}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p?.color??AC,marginBottom:2}}>
          {p?.name}: {formatter?formatter(p?.value):safeF(p?.value??0)}
        </p>
      ))}
    </div>
  )
}

/* ── SECCIÓN: VISTA GENERAL ──────────────────────── */
function OverviewSection(){
  const [tip,setTip]=useState(null)

  const KPIS1=[
    {k:'invest',  label:'Inversión Total',  value:'$63.7M',           sub:'COP · 30 días',       subC:MUT2, tip:'Total gastado en Meta Ads en el período seleccionado.'},
    {k:'roas',    label:'ROAS',             value:'4.40x',             sub:'↑ vs período anterior',subC:GR,  tip:'Ingresos por cada peso invertido. Meta saludable: > 3.0x.',trend:'+'+((GL.roas-PREV.roas)/PREV.roas*100).toFixed(1)+'%'},
    {k:'purch',   label:'Compras',          value:fmt(GL.purchases),   sub:'↑ omni_purchase',      subC:GR,  tip:'Compras atribuidas (ventana 7 días clic + 1 día vista).'},
    {k:'ctr',     label:'CTR Promedio',     value:'3.15%',             sub:'↑ sobre benchmark',    subC:GR,  tip:'% que hacen clic. Benchmark e-commerce: 1.5–3%.', trend:'+'+((GL.ctr-PREV.ctr)/PREV.ctr*100).toFixed(1)+'%'},
  ]
  const KPIS2=[
    {k:'reach',   label:'Alcance (Reach)',   value:'2.18M',            sub:'personas únicas',     tip:'Personas únicas que vieron tus anuncios al menos una vez.'},
    {k:'freq',    label:'Frecuencia',        value:safeF(GL.frequency),sub:'impresiones/persona', tip:'> 4 puede generar fatiga publicitaria. Ideal: 2–4.'},
    {k:'cpm',     label:'CPM',              value:fmtM(GL.cpm),        sub:'COP por mil impr.',   tip:'Costo por 1,000 impresiones. Refleja competencia en subastas.'},
    {k:'cpc',     label:'CPC Promedio',      value:'$329',             sub:'COP por clic',        tip:'Costo promedio por clic = Spend / Clics.'},
    {k:'cpr',     label:'Costo por Compra', value:fmtM(GL.cpr),        sub:'COP / compra',        tip:'Cuánto cuesta generar una compra = Spend / Compras.'},
    {k:'rev',     label:'Revenue Estimado', value:fmtM(GL.revenue),    sub:'COP (ROAS × Spend)',  tip:'Ingresos estimados = Spend × ROAS.',subC:GR},
    {k:'conv',    label:'Tasa Conversión',  value:'0.51%',             sub:'clics → compras',     tip:'% de clics que resultan en compra = Compras / Clics × 100.'},
    {k:'atc',     label:'Add to Cart',      value:fmt(GL.add_to_cart), sub:'↑ alto engagement',   tip:'Añadieron al carrito. Alta intención de compra.',subC:GR},
  ]

  const FCOL=['rgba(141,96,202,1)','rgba(141,96,202,.75)','rgba(141,96,202,.55)','rgba(141,96,202,.38)','rgba(74,222,128,.85)']
  const PCOL=[AC,BL,GR]
  const evts=[
    {name:'Add to Cart',value:GL.add_to_cart},
    {name:'Checkout',   value:GL.initiate_checkout},
    {name:'Compras',    value:GL.purchases},
  ]

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:10}}>
        {KPIS1.map(k=>(
          <div key={k.k} style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:14,position:'relative'}} onMouseLeave={()=>setTip(null)}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.5px'}}>{k.label}</span>
              <span onMouseEnter={()=>setTip(k.k)} style={{width:14,height:14,borderRadius:'50%',border:`1px solid ${BOR2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:MUT,cursor:'default',flexShrink:0}}>i</span>
            </div>
            <div style={{fontSize:21,fontWeight:500,color:'#e8e8e8'}}>
              {k.trend&&<span style={{fontSize:11,color:GR,marginRight:4}}>{k.trend}</span>}
              {k.value}
            </div>
            <div style={{fontSize:11,marginTop:3,color:k.subC??MUT2}}>{k.sub}</div>
            {tip===k.k&&<div style={{position:'absolute',top:0,right:22,zIndex:99,background:'#222',border:`1px solid ${BOR2}`,borderRadius:6,padding:'8px 10px',fontSize:11,color:'#bbb',width:180,lineHeight:1.5,pointerEvents:'none'}}>{k.tip}</div>}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
        {KPIS2.map(k=>(
          <div key={k.k} style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:14,position:'relative'}} onMouseLeave={()=>setTip(null)}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.5px'}}>{k.label}</span>
              <span onMouseEnter={()=>setTip(k.k)} style={{width:14,height:14,borderRadius:'50%',border:`1px solid ${BOR2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:MUT,cursor:'default',flexShrink:0}}>i</span>
            </div>
            <div style={{fontSize:19,fontWeight:500,color:'#e8e8e8'}}>{k.value}</div>
            <div style={{fontSize:11,marginTop:3,color:k.subC??MUT2}}>{k.sub}</div>
            {tip===k.k&&<div style={{position:'absolute',top:0,right:22,zIndex:99,background:'#222',border:`1px solid ${BOR2}`,borderRadius:6,padding:'8px 10px',fontSize:11,color:'#bbb',width:180,lineHeight:1.5,pointerEvents:'none'}}>{k.tip}</div>}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:10}}>
        <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>Gasto diario — 30 días (COP)</div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={DAILY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
              <XAxis dataKey="date" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} interval={4}/>
              <YAxis yAxisId="l" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={fmtM} width={52}/>
              <YAxis yAxisId="r" orientation="right" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v+'%'} width={30}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar yAxisId="l" dataKey="spend" name="Spend" fill={AC} fillOpacity={0.8} radius={[2,2,0,0]} barSize={7}/>
              <Line yAxisId="r" type="monotone" dataKey="ctr" name="CTR" stroke={AM} strokeWidth={1.5} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>Embudo de conversión</div>
          {FUNNEL.map((f,i)=>(
            <div key={f.label} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:11}}>
                <span style={{color:MUT2}}>{f.label}</span>
                <span style={{fontWeight:500}}>{fmt(f.value)}</span>
              </div>
              <div style={{background:'rgba(255,255,255,.06)',borderRadius:3,height:5}}>
                <div style={{width:`${Math.max(f.pct,1.5)}%`,height:5,borderRadius:3,background:FCOL[i]}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>CTR diario (%)</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={DAILY}>
              <defs>
                <linearGradient id="gctr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACL} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={ACL} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
              <XAxis dataKey="date" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} interval={5}/>
              <YAxis tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v+'%'} width={32}/>
              <Tooltip content={<ChartTip formatter={v=>safeF(v)+'%'}/>}/>
              <Area type="monotone" dataKey="ctr" name="CTR" stroke={ACL} fill="url(#gctr)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>Distribución de eventos</div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <ResponsiveContainer width={120} height={130}>
              <PieChart>
                <Pie data={evts} dataKey="value" innerRadius={35} outerRadius={56} paddingAngle={3}>
                  {evts.map((_,i)=><Cell key={i} fill={PCOL[i]}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {evts.map((e,i)=>(
                <div key={e.name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontSize:12}}>
                  <div style={{width:8,height:8,borderRadius:2,background:PCOL[i],flexShrink:0}}/>
                  <span style={{color:MUT2,flex:1}}>{e.name}</span>
                  <span style={{fontWeight:500}}>{fmt(e.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SECCIÓN: CAMPAÑAS ───────────────────────────── */
function CampaignsSection(){
  const [sortCol,setSortCol]=useState('spend')
  const [sortDir,setSortDir]=useState(-1)
  const [filter,setFilter]=useState('ALL')

  const sorted=useMemo(()=>{
    const list=(CAMPAIGNS??[]).filter(c=>filter==='ALL'||c.status===filter)
    return [...list].sort((a,b)=>{
      const av=typeof a[sortCol]==='string'?a[sortCol]:safeNum(a[sortCol])
      const bv=typeof b[sortCol]==='string'?b[sortCol]:safeNum(b[sortCol])
      return typeof av==='string'?av.localeCompare(bv)*sortDir:(av-bv)*sortDir
    })
  },[sortCol,sortDir,filter])

  const tgl=col=>col===sortCol?setSortDir(d=>d*-1):(setSortCol(col),setSortDir(-1))
  const arr=col=>sortCol===col?(sortDir===-1?' ↓':' ↑'):' ↕'

  const th=(col,right)=>({
    padding:'7px 10px',fontSize:10,textAlign:right?'right':'left',
    color:sortCol===col?AC:MUT,borderBottom:`1px solid ${BOR}`,
    fontWeight:400,textTransform:'uppercase',letterSpacing:'.4px',
    cursor:'pointer',whiteSpace:'nowrap',
  })
  const td=(right)=>({
    padding:'8px 10px',borderBottom:'1px solid rgba(255,255,255,.04)',
    color:'#ccc',fontSize:11,whiteSpace:'nowrap',textAlign:right?'right':'left',
  })
  const mc=(val,good,bad,lower)=>{
    if(lower) return val<=good?GR:val>=bad?RE:'#ccc'
    return val>=good?GR:val<=bad?RE:'#ccc'
  }

  const activeCnt=CAMPAIGNS.filter(c=>c.status==='ACTIVE').length
  const budgetSum=CAMPAIGNS.filter(c=>c.status==='ACTIVE').reduce((s,c)=>s+c.budget,0)

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
        {[
          {label:'Campañas Activas',  value:String(activeCnt),  sub:`de ${CAMPAIGNS.length} totales`,subC:GR},
          {label:'CTR más alto',      value:'6.39%',            sub:'Perfil IG',subC:GR},
          {label:'Mejor ROAS',        value:'6.18x',            sub:'Remarketing',subC:GR},
          {label:'Presup. activo/día',value:fmtCOP(budgetSum),  sub:'COP combinado',subC:MUT2},
        ].map(k=>(
          <div key={k.label} style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:14}}>
            <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:21,fontWeight:500,color:'#e8e8e8'}}>{k.value}</div>
            <div style={{fontSize:11,marginTop:3,color:k.subC}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>
        {['ALL','ACTIVE','PAUSED'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:'4px 12px',borderRadius:4,fontSize:11,cursor:'pointer',
            background:filter===f?AC:'transparent',
            color:filter===f?'#fff':MUT2,
            border:`1px solid ${filter===f?AC:BOR2}`,
            transition:'all .1s',
          }}>
            {f==='ALL'?'Todas':f}
          </button>
        ))}
        <span style={{marginLeft:'auto',fontSize:11,color:MUT}}>
          {sorted.length} campaña{sorted.length!==1?'s':''}
        </span>
      </div>

      <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:980}}>
            <thead>
              <tr>
                {[
                  ['name','Campaña',false],['status','Estado',false],
                  ['spend','Spend',true],['impressions','Impr.',true],
                  ['clicks','Clics',true],['ctr','CTR',true],
                  ['cpc','CPC',true],['cpm','CPM',true],
                  ['frequency','Freq.',true],['purchases','Compras',true],
                  ['cpr','CPR',true],['roas','ROAS',true],
                ].map(([col,lbl,r])=>(
                  <th key={col} style={th(col,r)} onClick={()=>tgl(col)}>{lbl}{arr(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c,idx)=>(
                <tr key={c.id??idx}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.025)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                  <td style={{...td(false),maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</td>
                  <td style={td(false)}>
                    <span style={{display:'inline-block',padding:'2px 7px',borderRadius:3,fontSize:10,fontWeight:600,
                      background:c.status==='ACTIVE'?GRD:AMD,color:c.status==='ACTIVE'?GR:AM}}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{...td(true),color:AC,fontWeight:600}}>{fmtCOP(c.spend)}</td>
                  <td style={td(true)}>{fmt(c.impressions)}</td>
                  <td style={td(true)}>{fmt(c.clicks)}</td>
                  <td style={{...td(true),color:mc(c.ctr,BM.ctr,BM.ctr*.7,false),fontWeight:600}}>{safeF(c.ctr)}%</td>
                  <td style={{...td(true),color:mc(c.cpc,BM.cpc,BM.cpc*1.2,true),fontWeight:600}}>${fmt(c.cpc)}</td>
                  <td style={{...td(true),color:mc(c.cpm,BM.cpm,BM.cpm*1.2,true),fontWeight:600}}>${fmt(c.cpm)}</td>
                  <td style={{...td(true),color:mc(c.frequency,BM.freq,BM.freq,true),fontWeight:600}}>{safeF(c.frequency)}</td>
                  <td style={td(true)}>{fmt(c.purchases)}</td>
                  <td style={{...td(true),color:mc(c.cpr,BM.cpr,BM.cpr*1.3,true),fontWeight:600}}>{fmtM(c.cpr)}</td>
                  <td style={{...td(true),color:mc(c.roas,BM.roas,BM.roas*.7,false),fontWeight:600}}>{safeF(c.roas)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:'9px 12px',borderTop:`1px solid ${BOR}`,display:'flex',gap:16,fontSize:10,color:MUT}}>
          <span><span style={{color:GR,fontWeight:600}}>Verde</span> = sobre benchmark</span>
          <span><span style={{color:RE,fontWeight:600}}>Rojo</span> = bajo benchmark</span>
          <span>CTR &gt;{BM.ctr}% · CPC &lt;${fmt(BM.cpc)} · ROAS &gt;{BM.roas}x · Freq &lt;{BM.freq}</span>
        </div>
      </div>
    </div>
  )
}

/* ── SECCIÓN: ANALÍTICA ──────────────────────────── */
function AnalyticsSection(){
  const compareData=WEEKLY.map((w,i)=>({
    ...w,
    spendPrev: Math.round(w.spend*(0.82+i*0.04)),
    roasCurr:  parseFloat((3.8+i*0.2).toFixed(2)),
    roasPrev:  parseFloat((3.3+i*0.18).toFixed(2)),
  }))

  const heatColor=v=>{
    const t=Math.min(Math.max((v-1.6)/(4.2-1.6),0),1)
    const r=Math.round(141+(74-141)*t)
    const g=Math.round(96+(222-96)*t)
    const b=Math.round(202+(128-202)*t)
    return `rgba(${r},${g},${b},0.85)`
  }

  const cs={background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}
  const ts={fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div style={cs}>
          <div style={ts}>Spend vs Clics por semana</div>
          <ResponsiveContainer width="100%" height={210}>
            <ComposedChart data={WEEKLY} margin={{top:5,right:10,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
              <XAxis dataKey="week" tick={{fill:MUT,fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis yAxisId="l" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={fmtM} width={55}/>
              <YAxis yAxisId="r" orientation="right" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={52}/>
              <Tooltip content={<ChartTip/>}/>
              <Legend wrapperStyle={{fontSize:10,color:MUT2,paddingTop:8}}/>
              <Bar yAxisId="l" dataKey="spend" name="Spend (COP)" fill={AC} fillOpacity={0.8} radius={[4,4,0,0]} barSize={32}/>
              <Line yAxisId="r" type="monotone" dataKey="clicks" name="Clics" stroke={BL} strokeWidth={2.5} dot={{fill:BL,r:5}} strokeDasharray="5 3"/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={cs}>
          <div style={ts}>CPC promedio por semana (COP)</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={WEEKLY} barSize={36} margin={{top:5,right:10,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
              <XAxis dataKey="week" tick={{fill:MUT,fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>'$'+v} width={50}/>
              <Tooltip content={<ChartTip formatter={v=>'$'+fmt(v)+' COP'}/>}/>
              <Bar dataKey="cpc" name="CPC" radius={[5,5,0,0]}>
                {WEEKLY.map((_,i)=><Cell key={i} fill={AC} fillOpacity={0.5+i*0.12}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div style={cs}>
          <div style={ts}>Impresiones diarias</div>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={DAILY} margin={{top:5,right:10,bottom:5,left:0}}>
              <defs>
                <linearGradient id="gimp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GR} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={GR} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
              <XAxis dataKey="date" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} interval={4}/>
              <YAxis tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>(safeNum(v)/1000).toFixed(0)+'K'} width={38}/>
              <Tooltip content={<ChartTip formatter={fmt}/>}/>
              <Area type="monotone" dataKey="impressions" name="Impresiones" stroke={GR} fill="url(#gimp)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={cs}>
          <div style={ts}>CTR diario (%)</div>
          <ResponsiveContainer width="100%" height={155}>
            <LineChart data={DAILY} margin={{top:5,right:10,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
              <XAxis dataKey="date" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} interval={4}/>
              <YAxis tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v+'%'} domain={['auto','auto']} width={34}/>
              <Tooltip content={<ChartTip formatter={v=>safeF(v)+'%'}/>}/>
              <Line type="monotone" dataKey="ctr" name="CTR" stroke={AM} strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{...cs,marginBottom:10}}>
        <div style={ts}>Spend y ROAS — actual vs período anterior</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:10}}>
          {[
            {label:'Spend actual',  color:AC},
            {label:'Spend anterior',color:'rgba(141,96,202,.35)'},
            {label:'ROAS actual',   color:GR},
            {label:'ROAS anterior', color:AM},
          ].map(l=>(
            <div key={l.label} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:MUT2}}>
              <div style={{width:9,height:9,borderRadius:2,background:l.color}}/>
              {l.label}
            </div>
          ))}
          <div style={{marginLeft:'auto',fontSize:11,color:GR}}>
            Spend ↑ {((GL.spend-PREV.spend)/PREV.spend*100).toFixed(1)}% vs período anterior
          </div>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <ComposedChart data={compareData} margin={{top:5,right:10,bottom:5,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
            <XAxis dataKey="week" tick={{fill:MUT,fontSize:11}} tickLine={false} axisLine={false}/>
            <YAxis yAxisId="l" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={fmtM} width={55}/>
            <YAxis yAxisId="r" orientation="right" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v+'x'} width={34}/>
            <Tooltip content={<ChartTip/>}/>
            <Bar yAxisId="l" dataKey="spend"     name="Spend actual"   fill={AC}                    fillOpacity={0.85} radius={[4,4,0,0]} barSize={18}/>
            <Bar yAxisId="l" dataKey="spendPrev" name="Spend anterior" fill="rgba(141,96,202,.35)" radius={[4,4,0,0]} barSize={18}/>
            <Line yAxisId="r" type="monotone" dataKey="roasCurr" name="ROAS actual"   stroke={GR} strokeWidth={2} dot={{fill:GR,r:4}}/>
            <Line yAxisId="r" type="monotone" dataKey="roasPrev" name="ROAS anterior" stroke={AM} strokeWidth={2} dot={{fill:AM,r:4}} strokeDasharray="4 3"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={cs}>
        <div style={ts}>Heatmap CTR — hora del día × día de la semana</div>
        <div style={{fontSize:10,color:MUT,marginBottom:12}}>Púrpura = CTR bajo · Verde = CTR alto</div>
        <div style={{overflowX:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:`56px repeat(${HHOURS.length},1fr)`,gap:3,minWidth:480}}>
            <div/>
            {HHOURS.map(h=>(
              <div key={h} style={{textAlign:'center',fontSize:10,color:MUT,paddingBottom:4}}>{h}</div>
            ))}
            {HDAYS.map((day,di)=>(
              <React.Fragment key={day}>
                <div style={{fontSize:11,color:MUT2,lineHeight:'28px'}}>{day}</div>
                {HHOURS.map((hr,hi)=>{
                  const v=HBASE[di][hi]
                  return (
                    <div key={hr} title={`${day} ${hr}: CTR ${v.toFixed(2)}%`}
                      style={{height:28,borderRadius:4,background:heatColor(v),display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'rgba(255,255,255,.75)',cursor:'default'}}>
                      {v.toFixed(1)}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SECCIÓN: AUDIENCIAS ─────────────────────────── */
function AudiencesSection(){
  const cs={background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}
  const ts={fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}
  const GC=[AC,BL]

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
        {[
          {label:'Alcance total', value:'2.18M',  sub:'personas únicas'},
          {label:'Frecuencia',    value:'2.82',   sub:'veces / persona'},
          {label:'Segmento top',  value:'25-34',  sub:'mayor volumen',subC:GR},
          {label:'Ciudad top',    value:'Bogotá', sub:'30% del spend'},
        ].map(k=>(
          <div key={k.label} style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:14}}>
            <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:20,fontWeight:500,color:'#e8e8e8'}}>{k.value}</div>
            <div style={{fontSize:11,marginTop:3,color:k.subC??MUT2}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:10}}>
        <div style={cs}>
          <div style={ts}>Rendimiento por grupo de edad</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={AGE_DATA} margin={{top:5,right:10,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false}/>
              <XAxis dataKey="age" tick={{fill:MUT,fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis yAxisId="l" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={fmtM} width={55}/>
              <YAxis yAxisId="r" orientation="right" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>v+'%'} width={32}/>
              <Tooltip content={<ChartTip/>}/>
              <Legend wrapperStyle={{fontSize:10,color:MUT2,paddingTop:8}}/>
              <Bar yAxisId="l" dataKey="spend" name="Spend" fill={AC} fillOpacity={0.8} radius={[4,4,0,0]} barSize={22}/>
              <Bar yAxisId="l" dataKey="conv"  name="Compras" fill={GR} fillOpacity={0.7} radius={[4,4,0,0]} barSize={22}/>
              <Line yAxisId="r" type="monotone" dataKey="ctr" name="CTR %" stroke={AM} strokeWidth={2.5} dot={{fill:AM,r:4}}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={cs}>
          <div style={ts}>Distribución por género</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={GENDER_DATA} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={4} startAngle={90} endAngle={450}>
                {GENDER_DATA.map((_,i)=><Cell key={i} fill={GC[i]}/>)}
              </Pie>
              <Tooltip formatter={v=>v+'%'} contentStyle={{background:'#1a1a1a',border:`1px solid ${BOR2}`,fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
            {GENDER_DATA.map((g,i)=>(
              <div key={g.name} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <div style={{width:7,height:7,borderRadius:1,background:GC[i]}}/>
                <span style={{color:MUT2,flex:1}}>{g.name}</span>
                <span style={{fontWeight:600}}>{g.value}%</span>
                <span style={{color:MUT,fontSize:10}}>{fmtM(g.spend)}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:14}}>
            <div style={{fontSize:10,color:MUT,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:8}}>CTR por género</div>
            {GENDER_DATA.map((g,i)=>(
              <div key={g.name} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                  <span style={{color:MUT2}}>{g.name}</span>
                  <span style={{color:g.ctr>=BM.ctr?GR:'#ccc'}}>{g.ctr.toFixed(2)}%</span>
                </div>
                <div style={{background:'rgba(255,255,255,.06)',borderRadius:3,height:4}}>
                  <div style={{width:`${(g.ctr/5)*100}%`,height:4,borderRadius:3,background:GC[i]}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={cs}>
        <div style={ts}>Top 5 ciudades — spend, clics y conversiones</div>
        <ResponsiveContainer width="100%" height={210}>
          <ComposedChart data={CITY_DATA} layout="vertical" margin={{top:5,right:50,bottom:5,left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false}/>
            <XAxis type="number" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={fmtM}/>
            <YAxis dataKey="city" type="category" tick={{fill:MUT2,fontSize:11}} tickLine={false} axisLine={false} width={90}/>
            <Tooltip content={<ChartTip/>}/>
            <Legend wrapperStyle={{fontSize:10,color:MUT2}}/>
            <Bar dataKey="spend"  name="Spend" fill={AC} fillOpacity={0.8} radius={[0,4,4,0]} barSize={12}/>
            <Bar dataKey="clicks" name="Clics" fill={BL} fillOpacity={0.6} radius={[0,4,4,0]} barSize={12}/>
            <Line type="monotone" dataKey="conv" name="Compras" stroke={GR} strokeWidth={2} dot={{fill:GR,r:5}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── SECCIÓN: PLACEMENTS ─────────────────────────── */
function PlacementsSection(){
  const totalSpend=PLACE.reduce((s,p)=>s+p.spend,0)
  const PLC=[AC,BL,TEA,AM,PNK]
  const cs={background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}
  const ts={fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
        {[
          {label:'Mejor ROAS',      value:'4.82x', sub:'Instagram Feed',     subC:GR},
          {label:'Mayor CTR',       value:'3.46%', sub:'IG Feed + IG Reels', subC:GR},
          {label:'Mayor inversión', value:'FB Feed',sub:'30% del spend total',subC:MUT2},
        ].map(k=>(
          <div key={k.label} style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:14}}>
            <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>{k.label}</div>
            <div style={{fontSize:21,fontWeight:500,color:'#e8e8e8'}}>{k.value}</div>
            <div style={{fontSize:11,marginTop:4,color:k.subC}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
        <div style={{padding:'12px 14px',borderBottom:`1px solid ${BOR}`}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px'}}>Rendimiento por placement</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:640}}>
            <thead>
              <tr>
                {['Placement','Spend','% Total','Impr.','Clics','CTR','CPM','ROAS'].map((h,i)=>(
                  <th key={h} style={{padding:'8px 12px',fontSize:10,color:MUT,borderBottom:`1px solid ${BOR}`,fontWeight:400,textTransform:'uppercase',letterSpacing:'.4px',textAlign:i>0?'right':'left',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLACE.map((p,i)=>{
                const pct=(p.spend/totalSpend*100).toFixed(1)
                return (
                  <tr key={i}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.025)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                    <td style={{padding:'9px 12px',borderBottom:'1px solid rgba(255,255,255,.04)',fontSize:12,color:'#ccc',fontWeight:500}}>
                      <span style={{display:'inline-flex',alignItems:'center',gap:7}}>
                        <span style={{width:7,height:7,borderRadius:1,background:PLC[i],flexShrink:0,display:'inline-block'}}/>
                        {p.name}
                      </span>
                    </td>
                    {[
                      {v:fmtCOP(p.spend),c:AC},
                      {v:pct+'%',c:'#aaa'},
                      {v:fmt(p.impressions),c:'#aaa'},
                      {v:fmt(p.clicks),c:'#aaa'},
                      {v:safeF(p.ctr)+'%',c:p.ctr>=BM.ctr?GR:RE},
                      {v:fmtM(p.cpm),c:p.cpm<=BM.cpm?GR:RE},
                      {v:p.roas.toFixed(2)+'x',c:p.roas>=BM.roas?GR:RE},
                    ].map((cell,j)=>(
                      <td key={j} style={{padding:'9px 12px',borderBottom:'1px solid rgba(255,255,255,.04)',fontSize:12,color:cell.c,textAlign:'right',fontWeight:cell.c!=='#aaa'?600:400}}>
                        {cell.v}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={cs}>
          <div style={ts}>Distribución de spend</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={PLACE} dataKey="spend" nameKey="name" innerRadius={38} outerRadius={58} paddingAngle={3}>
                  {PLACE.map((_,i)=><Cell key={i} fill={PLC[i]}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {PLACE.map((p,i)=>(
                <div key={p.name} style={{display:'flex',alignItems:'center',gap:6,marginBottom:6,fontSize:11}}>
                  <div style={{width:7,height:7,borderRadius:1,background:PLC[i],flexShrink:0}}/>
                  <span style={{color:MUT2,flex:1,fontSize:10}}>{p.name.replace('Facebook','FB').replace('Instagram','IG')}</span>
                  <span style={{fontWeight:600}}>{(p.spend/totalSpend*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={cs}>
          <div style={ts}>CTR y ROAS por placement</div>
          <ResponsiveContainer width="100%" height={168}>
            <ComposedChart
              data={PLACE.map(p=>({...p,name:p.name.replace('Facebook','FB').replace('Instagram','IG')}))}
              layout="vertical"
              margin={{top:5,right:40,bottom:5,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false}/>
              <XAxis type="number" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} width={82}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="ctr"  name="CTR %"  fill={AC} fillOpacity={0.8} radius={[0,3,3,0]} barSize={10}/>
              <Bar dataKey="roas" name="ROAS x" fill={GR} fillOpacity={0.7} radius={[0,3,3,0]} barSize={10}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ── SECCIÓN: CREATIVIDADES ──────────────────────── */
function CreativesSection(){
  const chartData=ADS.map(a=>({
    name:(a.name??'').split('/')?.[2]?.trim()||(a.name??'').substring(0,18)||'Sin nombre',
    spend:Math.round(safeNum(a.spend)/1000),
    impressions:safeNum(a.impressions),
    ctr:safeNum(a.ctr),
  }))

  return (
    <div>
      <div style={{fontSize:12,color:MUT,marginBottom:14}}>{ADS.length} creatividades · act_1043322110399302</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:14}}>
        {ADS.map((a,idx)=>(
          <div key={a.id??idx} style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,overflow:'hidden'}}>
            <div style={{height:88,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(141,96,202,.07)',borderBottom:`1px solid ${BOR}`,fontSize:34}}>
              {a.emoji??'📦'}
            </div>
            <div style={{padding:12}}>
              <p style={{fontSize:11,color:'#ccc',marginBottom:8,lineHeight:1.4}}>{a.name}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:5}}>
                {[
                  {l:'Spend',v:fmtM(a.spend)},
                  {l:'Impr.', v:fmt(a.impressions)},
                  {l:'Clics', v:fmt(a.clicks)},
                  {l:'CTR',   v:safeF(a.ctr)+'%',c:a.ctr>=BM.ctr?GR:'#e8e8e8'},
                  {l:'CPM',   v:fmtM(a.cpm)},
                ].map(m=>(
                  <div key={m.l} style={{background:'rgba(255,255,255,.04)',borderRadius:4,padding:'5px 6px'}}>
                    <div style={{fontSize:9,color:MUT}}>{m.l}</div>
                    <div style={{fontSize:12,fontWeight:500,color:m.c??'#e8e8e8'}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:8}}>
                <span style={{padding:'2px 8px',borderRadius:3,background:ACD,color:ACL,fontSize:10}}>{a.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
        <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>Comparativo creatividades</div>
        <ResponsiveContainer width="100%" height={210}>
          <ComposedChart data={chartData} layout="vertical" margin={{top:5,right:40,bottom:5,left:10}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false}/>
            <XAxis type="number" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false}/>
            <YAxis dataKey="name" type="category" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} width={115}/>
            <Tooltip content={<ChartTip/>}/>
            <Bar dataKey="spend"       name="Spend (miles COP)" fill={AC} fillOpacity={0.75} radius={[0,4,4,0]} barSize={14}/>
            <Bar dataKey="impressions" name="Impresiones"       fill={BL} fillOpacity={0.6}  radius={[0,4,4,0]} barSize={14}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── SECCIÓN: PRESUPUESTO ────────────────────────── */
function BudgetSection(){
  const cumulative=useMemo(()=>{
    let acc=0
    return DAILY.map(d=>{acc+=safeNum(d.spend);return{date:d.date,value:acc}})
  },[])

  const radarData=[
    {metric:'CTR',       value:Math.round((GL.ctr/5)*100)},
    {metric:'ROAS',      value:Math.round((GL.roas/5)*100)},
    {metric:'Conversión',value:Math.round(GL.conv_rate*100)},
    {metric:'Frecuencia',value:Math.round((1-(GL.frequency-1)/4)*100)},
    {metric:'CPM efic.', value:Math.round((1-GL.cpm/20000)*100)},
  ]

  const spend=safeNum(GL.spend)
  const dailyAvg=Math.round(spend/30)
  const pacing=Math.min(Math.round((spend/(dailyAvg*30||1))*100),100)
  const revenue=spend*safeNum(GL.roas)

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>Pacing del período</div>
          <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:18}}>
            <div>
              <div style={{fontSize:10,color:MUT,marginBottom:2}}>ROAS actual</div>
              <div style={{fontSize:38,fontWeight:500,color:AC,lineHeight:1}}>
                4.40x
                <span style={{fontSize:12,color:GR,marginLeft:6}}>↑ {((GL.roas-PREV.roas)/PREV.roas*100).toFixed(1)}%</span>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:MUT,marginBottom:6}}>Spend ejecutado ({pacing}%)</div>
              <div style={{background:'rgba(255,255,255,.06)',borderRadius:4,height:8}}>
                <div style={{width:`${pacing}%`,height:8,borderRadius:4,background:GR}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:MUT,marginTop:4}}>
                <span>{fmtM(spend)}</span>
                <span>~{fmtM(dailyAvg*30)} esperado</span>
              </div>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${BOR}`,paddingTop:12}}>
            {[
              {l:'Días del período',       v:'30 / 30',               c:'#ccc'},
              {l:'Promedio diario',         v:fmtCOP(dailyAvg)+' COP', c:'#ccc'},
              {l:'Spend total',             v:fmtCOP(spend)+' COP',    c:'#ccc'},
              {l:'Revenue (ROAS × Spend)', v:fmtM(revenue)+' COP',    c:GR},
              {l:'Margen estimado',         v:fmtM(revenue-spend)+' COP',c:GR},
            ].map(r=>(
              <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.04)',fontSize:12}}>
                <span style={{color:MUT}}>{r.l}</span>
                <span style={{fontWeight:500,color:r.c}}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
          <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:6}}>Radar de eficiencia (0–100)</div>
          <div style={{fontSize:10,color:MUT,marginBottom:10,lineHeight:1.5}}>CTR / ROAS / Conversión / Frecuencia (inv.) / CPM (inv.)</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{top:10,right:20,bottom:10,left:20}}>
              <PolarGrid stroke="rgba(255,255,255,.1)"/>
              <PolarAngleAxis dataKey="metric" tick={{fill:MUT2,fontSize:11}}/>
              <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:MUT,fontSize:8}} axisLine={false} tickCount={4}/>
              <Radar name="Performance" dataKey="value" stroke={AC} fill={AC} fillOpacity={0.25} strokeWidth={2.5} dot={{fill:AC,r:4}}/>
              <Tooltip contentStyle={{background:'#1a1a1a',border:`1px solid ${BOR2}`,fontSize:11}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background:CRD,border:`1px solid ${BOR}`,borderRadius:8,padding:16}}>
        <div style={{fontSize:11,color:MUT,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:14}}>Gasto acumulado — 30 días (COP)</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={cumulative} margin={{top:5,right:10,bottom:5,left:0}}>
            <defs>
              <linearGradient id="gcum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AM} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={AM} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
            <XAxis dataKey="date" tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} interval={4}/>
            <YAxis tick={{fill:MUT,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={fmtM} width={55}/>
            <Tooltip content={<ChartTip formatter={fmtCOP}/>}/>
            <Area type="monotone" dataKey="value" name="Acumulado" stroke={AM} fill="url(#gcum)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── APP PRINCIPAL ───────────────────────────────── */
const NAV=[
  {id:'overview',   label:'Vista General', icon:'▦'},
  {id:'campaigns',  label:'Campañas',       icon:'◈'},
  {id:'analytics',  label:'Analítica',      icon:'↗'},
  {id:'audiences',  label:'Audiencias',     icon:'◎'},
  {id:'placements', label:'Placements',     icon:'⊞'},
  {id:'creatives',  label:'Creatividades',  icon:'▣'},
  {id:'budget',     label:'Presupuesto',    icon:'◉'},
]

export default function App(){
  const [active,setActive]=useState('overview')

  return (
    <div style={{display:'flex',height:'100vh',background:BG,overflow:'hidden'}}>

      <div style={{width:188,minWidth:188,background:SRF,borderRight:`1px solid ${BOR}`,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px 14px 20px',display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:26,height:26,borderRadius:7,background:ACD,border:`1px solid ${AC}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:ACL,fontWeight:700}}>M</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'#e8e8e8'}}>Meta Ads</div>
            <div style={{fontSize:10,color:MUT}}>Dashboard</div>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto'}}>
          {NAV.map(s=>{
            const on=active===s.id
            return (
              <div key={s.id} onClick={()=>setActive(s.id)}
                style={{display:'flex',alignItems:'center',gap:9,padding:'9px 14px',fontSize:13,cursor:'pointer',
                  color:on?AC:MUT2,background:on?ACD:'transparent',
                  borderLeft:`2px solid ${on?AC:'transparent'}`,transition:'all .1s'}}
                onMouseEnter={e=>{if(!on){e.currentTarget.style.color='#ddd';e.currentTarget.style.background='rgba(255,255,255,.04)'}}}
                onMouseLeave={e=>{if(!on){e.currentTarget.style.color=MUT2;e.currentTarget.style.background='transparent'}}}>
                <span style={{fontSize:13,width:15,textAlign:'center',flexShrink:0}}>{s.icon}</span>
                {s.label}
              </div>
            )
          })}
        </div>

        <div style={{padding:'12px 14px',borderTop:`1px solid ${BOR}`}}>
          <div style={{fontSize:9,color:MUT,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:3}}>Cuenta</div>
          <div style={{fontSize:9,color:'#444',wordBreak:'break-all',lineHeight:1.4}}>act_1043322110399302</div>
        </div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{background:SRF,borderBottom:`1px solid ${BOR}`,padding:'0 20px',height:46,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:14,fontWeight:500,color:'#e8e8e8'}}>{NAV.find(s=>s.id===active)?.label??''}</span>
            <span style={{fontSize:10,color:GR,background:GRD,padding:'2px 8px',borderRadius:3}}>ROAS 4.40x ↑</span>
            <span style={{fontSize:10,color:AM,background:AMD,padding:'2px 8px',borderRadius:3}}>CTR 3.15%</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{background:ACD,border:`1px solid rgba(141,96,202,.3)`,borderRadius:4,padding:'3px 9px',fontSize:11,color:ACL}}>Tennispremium</span>
            <span style={{background:CRD,border:`1px solid ${BOR2}`,borderRadius:5,padding:'4px 10px',fontSize:11,color:'#aaa'}}>📅 Mar 16 – Abr 14, 2026</span>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'18px 20px'}}>
          {active==='overview'   && <OverviewSection/>}
          {active==='campaigns'  && <CampaignsSection/>}
          {active==='analytics'  && <AnalyticsSection/>}
          {active==='audiences'  && <AudiencesSection/>}
          {active==='placements' && <PlacementsSection/>}
          {active==='creatives'  && <CreativesSection/>}
          {active==='budget'     && <BudgetSection/>}
        </div>
      </div>
    </div>
  )
}
