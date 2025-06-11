import React from 'react';

interface EntryFilterBarProps {
  categories: { id: string; name: string }[];
  entryMonths: number[];
  entryFilterCategory: string;
  setEntryFilterCategory: (cat: string) => void;
  entryFilterMonth: string;
  setEntryFilterMonth: (month: string) => void;
}

const EntryFilterBar: React.FC<EntryFilterBarProps> = ({
  categories,
  entryMonths,
  entryFilterCategory,
  setEntryFilterCategory,
  entryFilterMonth,
  setEntryFilterMonth,
}) => {
  return (
    <div style={{display:'flex',gap:16,marginBottom:18,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{display:'flex',flexDirection:'column'}}>
        <label htmlFor="filter-category" style={{fontWeight:600,color:'#222',marginBottom:4,fontSize:15}}>Lọc theo danh mục</label>
        <select
          id="filter-category"
          value={entryFilterCategory}
          onChange={e => setEntryFilterCategory(e.target.value)}
          style={{padding:8,borderRadius:6,minWidth:120}}
        >
          <option value="all">Tất cả</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div style={{display:'flex',flexDirection:'column'}}>
        <label htmlFor="filter-month" style={{fontWeight:600,color:'#222',marginBottom:4,fontSize:15}}>Lọc theo tháng</label>
        <select
          id="filter-month"
          value={entryFilterMonth}
          onChange={e => setEntryFilterMonth(e.target.value)}
          style={{padding:8,borderRadius:6,minWidth:100}}
        >
          <option value="all">Tất cả</option>
          {entryMonths.map(m => (
            <option key={m} value={m}>{`Tháng ${m}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EntryFilterBar;