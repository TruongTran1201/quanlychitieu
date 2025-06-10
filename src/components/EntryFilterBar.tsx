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
      <label>
        <span style={{marginRight:8}}>Danh mục:</span>
        <select
          value={entryFilterCategory}
          onChange={e => setEntryFilterCategory(e.target.value)}
          style={{padding:8,borderRadius:6}}
        >
          <option value="all">Tất cả</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span style={{marginRight:8}}>Tháng:</span>
        <select
          value={entryFilterMonth}
          onChange={e => setEntryFilterMonth(e.target.value)}
          style={{padding:8,borderRadius:6}}
        >
          <option value="all">Tất cả</option>
          {entryMonths.map(m => (
            <option key={m} value={m}>{`Tháng ${m}`}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default EntryFilterBar;