import React from 'react';

interface Entry {
  id: number;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  date: string; // ISO string
}

interface Props {
  entries: Entry[];
  year: number;
}

const COLORS = [
  '#2ecc40', '#f1c40f', '#e74c3c', '#2980b9', '#9b59b6', '#16a085', '#e67e22', '#34495e', '#8e44ad', '#27ae60', '#e67e22', '#f39c12'
];

const MonthlyStats: React.FC<Props> = ({ entries, year }) => {
  // Tính tổng chi tiêu từng tháng
  const monthlyTotals = Array(12).fill(0);
  entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year) {
      const month = d.getMonth(); // 0-11
      monthlyTotals[month] += e.amount || 0;
    }
  });

  const max = Math.max(...monthlyTotals, 1);

  return (
    <div className="monthly-stats" style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 16px #0001',margin:'0 auto',maxWidth:600}}>
      <h3 style={{marginBottom:24,fontWeight:800,color:'#2ecc40',fontSize:22,textAlign:'center'}}>Biểu đồ so sánh chi tiêu các tháng trong năm {year}</h3>
      <div style={{overflowX:'auto',paddingBottom:8}}>
        <svg width={600} height={260} viewBox="0 0 600 260">
          {/* Trục Y */}
          <line x1={40} y1={20} x2={40} y2={220} stroke="#bbb" strokeWidth={2} />
          {/* Trục X */}
          <line x1={40} y1={220} x2={580} y2={220} stroke="#bbb" strokeWidth={2} />
          {/* Cột từng tháng */}
          {monthlyTotals.map((total, i) => {
            const barHeight = (total / max) * 180;
            return (
              <g key={i}>
                <rect
                  x={55 + i * 43}
                  y={220 - barHeight}
                  width={30}
                  height={barHeight}
                  fill={COLORS[i % COLORS.length]}
                  rx={6}
                />
                <text x={70 + i * 43} y={235} textAnchor="middle" fontSize={15} fill="#222">{i+1}</text>
                <text x={70 + i * 43} y={220 - barHeight - 8} textAnchor="middle" fontSize={13} fill="#222">{total ? total.toLocaleString() : ''}</text>
              </g>
            );
          })}
          {/* Nhãn trục Y */}
          <text x={0} y={30} fontSize={13} fill="#888">{max.toLocaleString()}</text>
          <text x={0} y={220} fontSize={13} fill="#888">0</text>
        </svg>
      </div>
    </div>
  );
};

export default MonthlyStats;
