import React from 'react';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  minAmount: string;
  setMinAmount: (v: string) => void;
  maxAmount: string;
  setMaxAmount: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
}

const AdvancedFilterBar: React.FC<Props> = ({ search, setSearch, minAmount, setMinAmount, maxAmount, setMaxAmount, fromDate, setFromDate, toDate, setToDate }) => (
  <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm mô tả/ghi chú" style={{padding:8,borderRadius:6,border:'1px solid #ccc',minWidth:120}} />
    <input value={minAmount} onChange={e=>setMinAmount(e.target.value)} placeholder="Tối thiểu" type="number" style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:90}} />
    <input value={maxAmount} onChange={e=>setMaxAmount(e.target.value)} placeholder="Tối đa" type="number" style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:90}} />
    <input value={fromDate} onChange={e=>setFromDate(e.target.value)} type="date" style={{padding:8,borderRadius:6,border:'1px solid #ccc'}} />
    <input value={toDate} onChange={e=>setToDate(e.target.value)} type="date" style={{padding:8,borderRadius:6,border:'1px solid #ccc'}} />
  </div>
);

export default AdvancedFilterBar;
