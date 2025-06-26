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
  <div style={{marginBottom:16, maxWidth:420, width:'100%'}}>
    <div style={{display:'flex', justifyContent:'center', width:'100%', marginBottom:10}}>
      <input 
        value={search} 
        onChange={e=>setSearch(e.target.value)} 
        placeholder="Tìm mô tả" 
        style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:'100%', maxWidth:420, boxSizing:'border-box'}} 
      />
    </div>
    <div style={{display:'flex', gap:12, justifyContent:'center', width:'100%'}}>
      <input 
        value={minAmount} 
        onChange={e=>setMinAmount(e.target.value)} 
        placeholder="Tìm các khoản chi lớn hơn" 
        type="number" 
        style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:'50%', minWidth:80, boxSizing:'border-box'}} 
      />
      <input 
        value={maxAmount} 
        onChange={e=>setMaxAmount(e.target.value)} 
        placeholder="Tìm khoản chi nhỏ hơn" 
        type="number" 
        style={{padding:8,borderRadius:6,border:'1px solid #ccc',width:'50%', minWidth:80, boxSizing:'border-box'}} 
      />
    </div>
  </div>
);

export default AdvancedFilterBar;
