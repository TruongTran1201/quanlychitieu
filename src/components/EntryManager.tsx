import React, { useState } from 'react'
import { MAIN_MENU_STYLE_REACT } from '../styleConfig'
import EntryDetailModal from './EntryDetailModal'

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
  descInputRef
}) => {
  const [editId, setEditId] = useState<number|null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [detailEntry, setDetailEntry] = useState<Entry|null>(null)

  const startEdit = (entry: Entry) => {
    setEditId(entry.id)
    setEditDesc(entry.description)
    setEditAmount(entry.amount.toString())
    setEditDate(entry.date)
  }
  const cancelEdit = () => {
    setEditId(null)
    setEditDesc('')
    setEditAmount('')
    setEditDate('')
  }
  const handleEditSave = () => {
    if (!editDesc.trim() || !editAmount.trim() || isNaN(Number(editAmount))) return
    // Gọi hàm updateEntry từ props nếu có, hoặc emit event
    if (typeof (window as any).updateEntry === 'function') {
      (window as any).updateEntry(editId, editDesc, Number(editAmount), editDate)
    }
    cancelEdit()
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="entry-manager" style={MAIN_MENU_STYLE_REACT}>
      <h3 style={{marginBottom:24,fontSize:24,fontWeight:800,color:'#2ecc40',textAlign:'center'}}>Nhập khoản chi</h3>
      <form onSubmit={addEntry} style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{flex:1,minWidth:120,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}}>
          {categories.length === 0 && <option value="">Chưa có danh mục</option>}
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input ref={descInputRef} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Mô tả" style={{flex:2,minWidth:120,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Số tiền" type="number" style={{width:110,minWidth:90,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
        <input value={date} onChange={e=>setDate(e.target.value)} type="datetime-local" style={{width:180,minWidth:120,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
        <button type="submit" style={{padding:'12px 18px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:16,minWidth:90}}>Thêm</button>
      </form>
      {loading ? <div>Đang tải...</div> : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',background:'#fafbfc',borderRadius:8,overflow:'hidden',boxShadow:'0 1px 8px #0001', color:'#222', minWidth:480}}>
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
                <tr key={entry.id} style={{borderBottom:'1px solid #f0f0f0', cursor:'pointer'}} onClick={() => setDetailEntry(entry)}>
                  <td style={{padding:12, color:'#222'}}>{entry.category}</td>
                  <td style={{padding:12, color:'#222'}}>
                    {editId === entry.id ? (
                      <input value={editDesc} onChange={e=>setEditDesc(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc'}} />
                    ) : entry.description}
                  </td>
                  <td style={{padding:12, color:'#222'}}>
                    {editId === entry.id ? (
                      <input value={editAmount} onChange={e=>setEditAmount(e.target.value)} type="number" style={{width:100,padding:8,borderRadius:6,border:'1px solid #ccc'}} />
                    ) : entry.amount.toLocaleString() + '₫'}
                  </td>
                  <td style={{padding:12, color:'#222'}}>
                    {editId === entry.id ? (
                      <input value={editDate.replace('T', ' ').slice(0, 16)} type="datetime-local" style={{width:180,padding:8,borderRadius:6,border:'1px solid #ccc'}} disabled />
                    ) : (entry.date.replace('T', ' ').slice(0, 16).replace(' ', 'T'))}
                  </td>
                  <td style={{padding:12}}>
                    {editId === entry.id ? (
                      <>
                        <button onClick={handleEditSave} style={{padding:'8px 16px',borderRadius:6,background:'#2ecc40',color:'#fff',border:'none',fontWeight:600,marginRight:8}}>Lưu</button>
                        <button onClick={cancelEdit} style={{padding:'8px 16px',borderRadius:6,background:'#aaa',color:'#fff',border:'none',fontWeight:600}}>Hủy</button>
                      </>
                    ) : (
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <button onClick={e => {e.stopPropagation(); startEdit(entry);}} title="Sửa" style={{background:'none',border:'none',padding:4,cursor:'pointer',borderRadius:4,transition:'background 0.2s'}}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="14.5" width="16" height="3" rx="1.5" fill="#f1c40f"/>
                            <path d="M14.85 3.15a1.5 1.5 0 0 1 2.12 2.12l-8.2 8.2-2.12.01.01-2.12 8.19-8.2z" fill="#f1c40f" stroke="#b7950b" strokeWidth="1.2"/>
                          </svg>
                        </button>
                        <button onClick={e => {e.stopPropagation(); deleteEntry(entry.id);}} title="Xóa" style={{background:'none',border:'none',padding:4,cursor:'pointer',borderRadius:4,transition:'background 0.2s'}}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="9" fill="#e74c3c"/>
                            <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && <div style={{padding:24,textAlign:'center',color:'#aaa'}}>Chưa có dữ liệu</div>}
        </div>
      )}
      {detailEntry && (
        <EntryDetailModal entry={detailEntry} onClose={() => setDetailEntry(null)} />
      )}
    </div>
  )
}

export default EntryManager
