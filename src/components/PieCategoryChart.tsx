import React from 'react';

interface Entry {
  id: number;
  user_id: string;
  category: string;
  amount: number;
  date: string;
}

const COLORS = [
  '#e74c3c', '#f1c40f', '#2ecc40', '#2980b9', '#9b59b6', '#16a085', '#e67e22', '#34495e', '#8e44ad', '#27ae60', '#e67e22', '#f39c12'
];

function getCategoryStats(entries: Entry[]) {
  const stats: { [cat: string]: number } = {};
  let total = 0;
  entries.forEach(e => {
    stats[e.category] = (stats[e.category] || 0) + (e.amount || 0);
    total += e.amount || 0;
  });
  return { stats, total };
}

const PieCategoryChart: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  const { stats, total } = getCategoryStats(entries);
  const cats = Object.keys(stats);
  let acc = 0;
  return (
    <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #0001',margin:'24px auto',maxWidth:600}}>
      <h3 style={{marginBottom:24,fontWeight:800,color:'#2980b9',fontSize:20,textAlign:'center'}}>Tỷ lệ chi tiêu theo danh mục</h3>
      {total === 0 ? <div style={{textAlign:'center',color:'#aaa'}}>Không có dữ liệu</div> : (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:32,flexWrap:'wrap'}}>
          <svg width={220} height={220} viewBox="0 0 220 220">
            <circle cx={110} cy={110} r={90} fill="#fbeeea" />
            {cats.map((cat, i) => {
              const percent = stats[cat] / total;
              const angle = percent * 360;
              const startAngle = acc;
              const endAngle = acc + angle;
              acc = endAngle;
              if (percent === 0) return null;
              const rad = Math.PI / 180;
              const x1 = 110 + 90 * Math.cos((startAngle - 90) * rad);
              const y1 = 110 + 90 * Math.sin((startAngle - 90) * rad);
              const x2 = 110 + 90 * Math.cos((endAngle - 90) * rad);
              const y2 = 110 + 90 * Math.sin((endAngle - 90) * rad);
              const largeArc = angle > 180 ? 1 : 0;
              const d = [
                `M 110 110`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              return <path key={cat} d={d} fill={COLORS[i % COLORS.length]} />;
            })}
          </svg>
          <div>
            {cats.map((cat, i) => (
              <div key={cat} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{display:'inline-block',width:18,height:18,borderRadius:4,background:COLORS[i % COLORS.length]}}></span>
                <span style={{fontWeight:600}}>{cat}</span>
                <span style={{color:'#888'}}>{stats[cat].toLocaleString()}₫ ({((stats[cat]/total)*100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PieCategoryChart;
