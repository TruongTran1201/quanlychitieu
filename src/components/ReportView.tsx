import React from 'react'

interface Props {
  entries: any[]
  selectedYear: number
  setSelectedYear: (v: number) => void
  selectedMonth: string
  setSelectedMonth: (v: string) => void
  years: number[]
  monthsInYear: number[]
}

// Thêm Gauge chart
function getCategoryStats(entries: any[]) {
  const total = entries.reduce((sum, e) => sum + e.amount, 0)
  const byCat: {[cat: string]: number} = {}
  entries.forEach(e => {
    byCat[e.category] = (byCat[e.category] || 0) + e.amount
  })
  const stats = Object.entries(byCat).map(([cat, amount]) => ({
    category: cat,
    amount,
    percent: total > 0 ? Math.round(amount / total * 100) : 0
  }))
  return { total, stats }
}

const COLORS = [
  '#e74c3c', '#f1c40f', '#2ecc40', '#2980b9', '#9b59b6', '#16a085', '#e67e22', '#34495e', '#8e44ad', '#27ae60'
]

const ReportView: React.FC<Props> = ({
  entries,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  years,
  monthsInYear
}) => {
  const { stats } = getCategoryStats(entries)
  // Tạo dữ liệu cho gauge chart
  let offset = 0
  const arcs = stats.map((s, i) => {
    const start = offset
    const end = offset + s.percent * 3.6 // 1% = 3.6 độ
    offset = end
    return { ...s, color: COLORS[i % COLORS.length], start, end }
  })
  // Sắp xếp entries theo ngày giảm dần (mới nhất lên đầu)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return (
    <div style={{background:'#fff',borderRadius:16,padding:32,marginBottom:32,boxShadow:'0 2px 16px #0001', color:'#222'}}>
      <div style={{marginBottom:24,display:'flex',alignItems:'center',gap:24}}>
        <label style={{fontWeight:600, color:'#222'}}>Năm:</label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}}>
          {years.length === 0 && <option>{new Date().getFullYear()}</option>}
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <label style={{fontWeight:600, color:'#222'}}>Tháng:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}}>
          <option value="all">Tất cả</option>
          {monthsInYear.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <h2 style={{marginBottom:24,fontSize:26,fontWeight:800,color:'#2ecc40'}}>Báo cáo {selectedMonth === 'all' ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}`}</h2>
      <div style={{marginBottom:16, fontSize:18, fontWeight:600, color:'#222'}}>
        Tổng chi tiêu: {entries.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}₫
      </div>
      <div style={{display:'flex',gap:32,marginBottom:32,alignItems:'center'}}>
        <div style={{position:'relative',width:220,height:220}}>
          <svg width={220} height={220} viewBox="0 0 220 220">
            <circle cx={110} cy={110} r={90} fill="#fbeeea" />
            {arcs.map((arc) => (
              arc.percent > 0 && (
                <path
                  key={arc.category}
                  d={describeArc(110, 110, 90, arc.start, arc.end)}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={22}
                  strokeLinecap="round"
                />
              )
            ))}
          </svg>
        </div>
        <div style={{flex:1}}>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {arcs.map(arc => (
              <li key={arc.category} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <span style={{display:'inline-block',width:18,height:18,borderRadius:4,background:arc.color}}></span>
                <span style={{fontWeight:700}}>{arc.category}</span>
                <span style={{color:'#888'}}>{arc.amount.toLocaleString()}₫</span>
                <span style={{color:'#888'}}>{arc.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div style={{marginTop:24}}>
        <h4 style={{marginBottom:12,fontWeight:700,fontSize:18, color:'#222'}}>Chi tiết giao dịch</h4>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fafbfc',borderRadius:8,overflow:'hidden',boxShadow:'0 1px 8px #0001', color:'#222'}}>
            <thead>
              <tr style={{background:'#f5f6fa'}}>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Danh mục</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Mô tả</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Số tiền</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry: any) => (
                <tr key={entry.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                  <td style={{padding:12, color:'#222'}}>{entry.category}</td>
                  <td style={{padding:12, color:'#222'}}>{entry.description}</td>
                  <td style={{padding:12, color:'#222'}}>{entry.amount.toLocaleString()}₫</td>
                  <td style={{padding:12, color:'#222'}}>{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && <div style={{padding:24,textAlign:'center',color:'#aaa'}}>Không có giao dịch nào</div>}
        </div>
      </div>
    </div>
  )
}

// Hàm vẽ cung tròn SVG
function describeArc(cx:number, cy:number, r:number, startAngle:number, endAngle:number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ')
}
function polarToCartesian(cx:number, cy:number, r:number, angle:number) {
  const rad = (angle-90) * Math.PI/180.0
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad))
  }
}

export default ReportView;
