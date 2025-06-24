import React from 'react';
import * as XLSX from 'xlsx';

interface Entry {
  id: number;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const ExportExcel: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  const handleExport = () => {
    const wsData = [
      ['ID', 'Danh mục', 'Mô tả', 'Số tiền', 'Ngày'],
      ...entries.map(e => [
        e.id,
        e.category,
        e.description || '',
        e.amount,
        e.date.replace('T', ' ').slice(0, 16)
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ChiTieu');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const h = pad(now.getHours());
    const min = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    const filename = `quanlychitieu-${y}${m}${d}-${h}${min}${s}.xlsx`;
    XLSX.writeFile(wb, filename);
  };
  return (
    <button onClick={handleExport} style={{marginBottom:16,padding:'10px 18px',borderRadius:8,background:'#27ae60',color:'#fff',border:'none',fontWeight:700,fontSize:16,minWidth:120,cursor:'pointer'}}>
      Xuất Excel
    </button>
  );
};

export default ExportExcel;
