import React from 'react'
import { MAIN_MENU_STYLE_REACT } from '../styleConfig'
import EntryDetailModal from './EntryDetailModal'
import { supabase } from '../supabaseClient'

interface Props {
  entries: any[]
  selectedYear: number
  setSelectedYear: (v: number) => void
  selectedMonth: string
  setSelectedMonth: (v: string) => void
  years: number[]
  monthsInYear: number[]
  categories?: {id: number, name: string, user_id: string}[]
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
  monthsInYear,
  categories = []
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const filteredEntries = selectedCategory === 'all'
    ? entries
    : entries.filter(e => e.category === selectedCategory)
  const totalAmount = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
  const totalEntries = filteredEntries.length;

  // Paging state for report table
  const [page, setPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));
  React.useEffect(() => { setPage(1); }, [itemsPerPage, selectedCategory, selectedYear, selectedMonth]);
  const pagedEntries = filteredEntries.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const [detailEntry, setDetailEntry] = React.useState<any|null>(null);
  const [detailImages, setDetailImages] = React.useState<{url:string}[]>([]);

  // Khi click vào 1 bản ghi, show popup và load ảnh
  const handleShowDetail = async (entry: any) => {
    setDetailEntry(entry);
    // Lấy ảnh từ Supabase
    const { data, error } = await supabase
      .from('entry_images')
      .select('url')
      .eq('entry_id', entry.id);
    setDetailImages(!error && data ? data : []);
  };

  return (
    <div className="report-view" style={MAIN_MENU_STYLE_REACT}>
      <div style={{marginBottom:24,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
        <label style={{fontWeight:600, color:'#222'}}>Năm:</label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff',minWidth:90}}>
          {years.length === 0 && <option>{new Date().getFullYear()}</option>}
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <label style={{fontWeight:600, color:'#222'}}>Tháng:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff',minWidth:90}}>
          <option value="all">Tất cả</option>
          {monthsInYear.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {/* Filter theo danh mục */}
        <label style={{fontWeight:600, color:'#222'}}>Danh mục:</label>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff',minWidth:90}}>
          <option value="all">Tất cả</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <h2 style={{marginBottom:24,fontSize:26,fontWeight:800,color:'#2ecc40'}}>Báo cáo {selectedMonth === 'all' ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}`}</h2>
      <div style={{marginBottom:16, fontSize:18, fontWeight:600, color:'#222'}}>
        Tổng chi tiêu: {totalAmount.toLocaleString()}₫
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
              {pagedEntries.map((entry: any) => (
                <tr key={entry.id} style={{borderBottom:'1px solid #f0f0f0', cursor:'pointer'}} onClick={() => handleShowDetail(entry)}>
                  <td style={{padding:12, color:'#222'}}>{entry.category}</td>
                  <td style={{padding:12, color:'#222'}}>{entry.description}</td>
                  <td style={{padding:12, color:'#222'}}>{entry.amount.toLocaleString()}₫</td>
                  <td style={{padding:12, color:'#222'}}>{new Date(entry.date).toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEntries.length === 0 && <div style={{padding:24,textAlign:'center',color:'#aaa'}}>Không có giao dịch nào</div>}
        </div>
        {/* Paging controls for report table */}
        {totalEntries > 0 && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,margin:'18px 0'}}>
            <button onClick={()=>setPage(1)} disabled={page===1} style={{padding:'6px 12px',borderRadius:6}}>&laquo;</button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'6px 12px',borderRadius:6}}>&lsaquo;</button>
            <span style={{fontWeight:600}}>Trang</span>
            <select value={page} onChange={e=>setPage(Number(e.target.value))} style={{padding:'6px 10px',borderRadius:6}}>
              {Array.from({length: totalPages}, (_,i)=>i+1).map(p=>(<option key={p} value={p}>{p}</option>))}
            </select>
            <span style={{fontWeight:600}}>/ {totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:'6px 12px',borderRadius:6}}>&rsaquo;</button>
            <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} style={{padding:'6px 12px',borderRadius:6}}>&raquo;</button>
            <span style={{marginLeft:16}}>Hiển thị</span>
            <select value={itemsPerPage} onChange={e=>setItemsPerPage(Number(e.target.value))} style={{padding:'6px 10px',borderRadius:6}}>
              {[5,10,20,50,100].map(n=>(<option key={n} value={n}>{n}/trang</option>))}
            </select>
          </div>
        )}
      </div>
      {detailEntry && (
        <EntryDetailModal
          entry={detailEntry}
          images={detailImages}
          onClose={() => { setDetailEntry(null); }}
        />
      )}
    </div>
  )
}

// Pie chart component
function PieChart({ arcs }: { arcs: any[] }) {
  const radius = 90;
  const cx = 110, cy = 110;
  let acc = 0;
  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      <circle cx={cx} cy={cy} r={radius} fill="#fbeeea" />
      {arcs.map((arc, i) => {
        const startAngle = acc;
        const angle = arc.percent * 3.6;
        const endAngle = startAngle + angle;
        acc = endAngle;
        if (arc.percent === 0) return null;
        // Pie slice path
        const largeArc = angle > 180 ? 1 : 0;
        const start = polarToCartesian(cx, cy, radius, startAngle);
        const end = polarToCartesian(cx, cy, radius, endAngle);
        const d = [
          `M ${cx} ${cy}`,
          `L ${start.x} ${start.y}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
          'Z'
        ].join(' ');
        // Tính vị trí text phần trăm
        const midAngle = startAngle + angle / 2;
        const textPos = polarToCartesian(cx, cy, radius * 0.6, midAngle);
        return (
          <g key={arc.category}>
            <path d={d} fill={arc.color} />
            <text x={textPos.x} y={textPos.y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700" fill="#fff" style={{textShadow:'0 1px 4px #0008'}}>
              {arc.percent > 0 ? `${arc.percent}%` : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
function polarToCartesian(cx:number, cy:number, r:number, angle:number) {
  const rad = (angle-90) * Math.PI/180.0;
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad))
  };
}

export default ReportView;
