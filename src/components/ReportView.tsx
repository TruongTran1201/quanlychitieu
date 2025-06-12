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
  categories?: {id: number, name: string, group: string, user_id: string}[]
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
  const [selectedGroup, setSelectedGroup] = React.useState<string>('all')
  const groupList = Array.from(new Set(categories.map(c => c.group))).filter(Boolean)
  const filteredEntries = selectedGroup === 'all'
    ? entries
    : entries.filter(e => {
        const cat = categories.find(c => c.name === e.category)
        return cat && cat.group === selectedGroup
      })
  const totalAmount = filteredEntries.reduce((sum, e) => sum + (e.amount || 0), 0)
  const totalEntries = filteredEntries.length;

  // Paging state for report table
  const [page, setPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));
  React.useEffect(() => { setPage(1); }, [itemsPerPage, selectedGroup, selectedYear, selectedMonth]);
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

  // Pie chart data: tổng chi tiêu theo từng danh mục
  const groupSums = filteredEntries.reduce((acc: Record<string, number>, e) => {
    const cat = categories.find(c => c.name === e.category)
    const group = cat?.group || 'Khác'
    acc[group] = (acc[group] || 0) + (e.amount || 0)
    return acc
  }, {});
  const sumTotal = Object.values(groupSums).reduce((a, b) => a + b, 0);
  const arcs = Object.entries(groupSums).map(([group, amount], i) => ({
    category: group,
    value: amount,
    percent: sumTotal ? Math.round((amount / sumTotal) * 100) : 0,
    color: COLORS[i % COLORS.length]
  }));

  // FilterBar style đồng bộ với EntryFilterBar
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedYear(Number(e.target.value));
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMonth(e.target.value);

  return (
    <div className="report-view" style={MAIN_MENU_STYLE_REACT}>
      <h2 style={{marginBottom:24,fontSize:26,fontWeight:800,color:'#2ecc40'}}>Báo cáo {selectedMonth === 'all' ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}`}</h2>
      {/* Pie chart tổng chi tiêu theo danh mục */}
      {arcs.length > 0 && sumTotal > 0 && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,gap:32,flexWrap:'wrap'}}>
          <PieChart arcs={arcs} />
          <div>
            {arcs.map(arc => (
              <div key={arc.category} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                <span style={{minWidth:38,height:24,borderRadius:6,background:arc.color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:15,position:'relative',padding:'0 8px'}}>
                  {arc.percent > 0 ? arc.percent + '%' : ''}
                </span>
                <span style={{fontWeight:600,color:'#222',whiteSpace:'normal',wordBreak:'break-word',maxWidth:'none'}}>{arc.category}</span>
                <span style={{color:'#888',marginLeft:8,whiteSpace:'normal',wordBreak:'break-word',maxWidth:'none'}}>{formatMoneyShort(arc.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{marginBottom:16, fontSize:18, fontWeight:600, color:'#222'}}>
        Tổng chi tiêu: {totalAmount.toLocaleString()}₫
      </div>
      {/* FilterBar style đồng bộ EntryFilterBar */}
      <div style={{marginBottom:24,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="report-year" style={{fontWeight:600,color:'#222',marginBottom:4,fontSize:15}}>Năm</label>
          <select id="report-year" value={selectedYear} onChange={handleYearChange} style={{padding:8,borderRadius:6,minWidth:90}}>
            {years.length === 0 && <option>{new Date().getFullYear()}</option>}
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="report-month" style={{fontWeight:600,color:'#222',marginBottom:4,fontSize:15}}>Tháng</label>
          <select id="report-month" value={selectedMonth} onChange={handleMonthChange} style={{padding:8,borderRadius:6,minWidth:90}}>
            <option value="all">Tất cả</option>
            {monthsInYear.map(m => <option key={m} value={m}>{`Tháng ${m}`}</option>)}
          </select>
        </div>
        <div style={{display:'flex',flexDirection:'column'}}>
          <label htmlFor="report-group" style={{fontWeight:600,color:'#222',marginBottom:4,fontSize:15}}>Nhóm</label>
          <select id="report-group" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} style={{padding:8,borderRadius:6,minWidth:120}}>
            <option value="all">Tất cả</option>
            {groupList.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
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
      {arcs.map(arc => {
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
        return (
          <g key={arc.category}>
            <path d={d} fill={arc.color} />
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

// Hàm format số tiền sang dạng k/tr
function formatMoneyShort(amount: number): string {
  if (amount >= 1_000_000) {
    const tr = Math.floor(amount / 1_000_000);
    const k = Math.floor((amount % 1_000_000) / 1000);
    return k > 0 ? `${tr}tr${k}k` : `${tr}tr`;
  }
  if (amount >= 1000) {
    return `${Math.floor(amount / 1000)}k`;
  }
  return amount.toString();
}

export default ReportView;
