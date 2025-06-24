import React from 'react';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  minAmount: string;
  setMinAmount: (v: string) => void;
  maxAmount: string;
  setMaxAmount: (v: string) => void;
}

const AdvancedFilterBar: React.FC<Props> = ({ search, setSearch, minAmount, setMinAmount, maxAmount, setMaxAmount }) => (
  <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mô tả" style={{padding:8,borderRadius:6,border:'1px solid #ccc',minWidth:120}} />
    <input value={minAmount} onChange={e=>setMinAmount(e.target.value)} placeholder="Khoản chi từ" type="number" style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:90}} />
    <input value={maxAmount} onChange={e=>setMaxAmount(e.target.value)} placeholder="Khoản chi dưới" type="number" style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:90}} />
  </div>
);

export default AdvancedFilterBar;
