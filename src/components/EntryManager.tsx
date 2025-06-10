import React from 'react'

export interface Entry {
  id: number
  user_id: string
  category: string
  description: string
  amount: number
  date: string // ISO string
}

interface Props {
  entries: Entry[]
  loading: boolean
  addEntry: (e: React.FormEvent) => void
  deleteEntry: (id: number) => void
  category: string
  setCategory: (v: string) => void
  description: string
  setDescription: (v: string) => void
  amount: string
  setAmount: (v: string) => void
  date: string
  setDate: (v: string) => void
  categories: {id: number, name: string, user_id: string}[] // Thêm prop categories
  descInputRef?: React.RefObject<HTMLInputElement>; // Thêm prop descInputRef
}

const EntryManager: React.FC<Props> = ({
  entries,
  loading,
  addEntry,
  deleteEntry,
  category,
  setCategory,
  description,
  setDescription,
  amount,
  setAmount,
  date,
  setDate,
  categories,
  descInputRef // Nhận prop descInputRef
}) => {
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{background:'#fff',borderRadius:16,padding:32,marginBottom:32,boxShadow:'0 2px 16px #0001', color:'#222'}}>
      <h3 style={{marginBottom:24,fontSize:26,fontWeight:800,color:'#2ecc40'}}>Nhập khoản chi</h3>
      <form onSubmit={addEntry} style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{flex:1,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}}>
          {categories.length === 0 && <option value="">Chưa có danh mục</option>}
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input ref={descInputRef} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Mô tả" style={{flex:2,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Số tiền" type="number" style={{width:140,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
        <input value={date} onChange={e=>setDate(e.target.value)} type="date" style={{width:170,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
        <button type="submit" style={{padding:'12px 24px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:16}}>Thêm</button>
      </form>
      {loading ? <div>Đang tải...</div> : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fafbfc',borderRadius:8,overflow:'hidden',boxShadow:'0 1px 8px #0001', color:'#222'}}>
            <thead>
              <tr style={{background:'#f5f6fa'}}>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Danh mục</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Mô tả</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Số tiền</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Ngày</th>
                <th style={{padding:12,borderBottom:'1px solid #eee',fontWeight:700, color:'#222'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(entry => (
                <tr key={entry.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                  <td style={{padding:12, color:'#222'}}>{entry.category}</td>
                  <td style={{padding:12, color:'#222'}}>{entry.description}</td>
                  <td style={{padding:12, color:'#222'}}>{entry.amount.toLocaleString()}₫</td>
                  <td style={{padding:12, color:'#222'}}>{entry.date}</td>
                  <td style={{padding:12}}>
                    <button onClick={()=>deleteEntry(entry.id)} style={{padding:'8px 16px',borderRadius:6,background:'#e74c3c',color:'#fff',border:'none',fontWeight:600}}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && <div style={{padding:24,textAlign:'center',color:'#aaa'}}>Chưa có dữ liệu</div>}
        </div>
      )}
    </div>
  )
}

export default EntryManager
