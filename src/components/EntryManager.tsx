import React, { useState } from 'react'
import { MAIN_MENU_STYLE_REACT } from '../styleConfig'
import { supabase } from '../supabaseClient'
import EntryDetailModal from './EntryDetailModal'
import EntryFilterBar from './EntryFilterBar'

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
  entryFilterCategory: string;
  setEntryFilterCategory: (cat: string) => void;
  entryFilterMonth: string;
  setEntryFilterMonth: (month: string) => void;
  entryMonths: number[];
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
  descInputRef,
  entryFilterCategory,
  setEntryFilterCategory,
  entryFilterMonth,
  setEntryFilterMonth,
  entryMonths
}) => {
  const [editId, setEditId] = useState<number|null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCategory, setEditCategory] = useState('');
  const [imageModalEntry, setImageModalEntry] = useState<Entry|null>(null);
  const [imageFiles, setImageFiles] = useState<FileList|null>(null);
  const [uploading, setUploading] = useState(false);
  const [detailEntry, setDetailEntry] = useState<Entry|null>(null);
  const [detailImages, setDetailImages] = useState<{url:string}[]>([]);
  const [saveImageNotice, setSaveImageNotice] = useState<string>('');

  const startEdit = (entry: Entry) => {
    setEditId(entry.id)
    setEditDesc(entry.description)
    setEditAmount(entry.amount.toString())
    setEditDate(entry.date)
    setEditCategory(entry.category)
  }
  const cancelEdit = () => {
    setEditId(null)
    setEditDesc('')
    setEditAmount('')
    setEditDate('')
    setEditCategory('')
  }
  const handleEditSave = () => {
    if (!editDesc.trim() || !editAmount.trim() || isNaN(Number(editAmount))) return
    // Gọi hàm updateEntry từ props nếu có, hoặc emit event
    if (typeof (window as any).updateEntry === 'function') {
      (window as any).updateEntry(editId, editCategory, editDesc, Number(editAmount), editDate)
    }
    cancelEdit()
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Khi click vào 1 bản ghi, show popup và load ảnh
  const handleShowDetail = async (entry: Entry) => {
    setDetailEntry(entry);
    const { data, error } = await supabase
      .from('entry_images')
      .select('url')
      .eq('entry_id', entry.id);
    setDetailImages(!error && data ? data : []);
  };

  // Hủy sửa khi click ra ngoài bảng
  React.useEffect(() => {
    if (editId !== null) {
      const handleClick = (e: MouseEvent) => {
        const table = document.getElementById('entry-table');
        if (table && !table.contains(e.target as Node)) {
          cancelEdit();
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [editId]);

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
      <EntryFilterBar
        categories={categories.map(({id, name}) => ({id: id.toString(), name}))}
        entryMonths={entryMonths}
        entryFilterCategory={entryFilterCategory}
        setEntryFilterCategory={setEntryFilterCategory}
        entryFilterMonth={entryFilterMonth}
        setEntryFilterMonth={setEntryFilterMonth}
      />
      {loading ? <div>Đang tải...</div> : (
        <div style={{overflowX:'auto'}}>
          <table id="entry-table" style={{width:'100%',borderCollapse:'collapse',background:'#fafbfc',borderRadius:8,overflow:'hidden',boxShadow:'0 1px 8px #0001', color:'#222', minWidth:480}}>
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
                <tr
                  key={entry.id}
                  style={{borderBottom:'1px solid #f0f0f0', cursor:'pointer'}}
                  onClick={() => {
                    if (editId !== entry.id) handleShowDetail(entry);
                  }}
                >
                  <td style={{padding:12, color:'#222'}}>
                    {editId === entry.id ? (
                      <select value={editCategory} onChange={e=>setEditCategory(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc'}}>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    ) : entry.category}
                  </td>
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
                      <div style={{position:'relative'}} onClick={e => e.stopPropagation()}>
                        <select
                          style={{padding:'6px 28px 6px 10px',borderRadius:6,border:'1px solid #ccc',fontSize:15,background:'#fff',color:'#222',cursor:'pointer'}}
                          defaultValue=""
                          onChange={e => {
                            if (e.target.value === 'add-image') setImageModalEntry(entry);
                            if (e.target.value === 'edit') startEdit(entry);
                            if (e.target.value === 'delete') deleteEntry(entry.id);
                            e.target.value = '';
                          }}
                        >
                          <option value="" disabled>Chọn thao tác</option>
                          <option value="add-image">Thêm hình ảnh</option>
                          <option value="edit">Sửa khoản chi</option>
                          <option value="delete">Xóa khoản chi</option>
                        </select>
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
      {saveImageNotice && (
        <div style={{margin:'12px 0',color:'#2ecc40',fontWeight:600,textAlign:'center'}}>{saveImageNotice}</div>
      )}
      {imageModalEntry && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setImageModalEntry(null)}>
          <div style={{background:'#fff',borderRadius:12,padding:32,minWidth:320,maxWidth:'90vw',boxShadow:'0 4px 32px #0002',color:'#222',position:'relative'}} onClick={e=>e.stopPropagation()}>
            <button style={{position:'absolute',top:12,right:12,background:'none',border:'none',fontSize:22,color:'#e74c3c',cursor:'pointer'}} onClick={()=>setImageModalEntry(null)} title="Đóng">×</button>
            <h3 style={{marginBottom:18,fontWeight:800,color:'#2ecc40',fontSize:20}}>Thêm hình ảnh cho khoản chi</h3>
            <div style={{marginBottom:16}}>
              <input type="file" multiple accept="image/*" onChange={e=>setImageFiles(e.target.files)} />
            </div>
            <button
              style={{padding:'10px 18px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:16,minWidth:90}}
              onClick={async () => {
                if (!imageFiles || !imageModalEntry) return;
                setUploading(true);
                let success = true;
                for (let i = 0; i < imageFiles.length; i++) {
                  const file = imageFiles[i];
                  const filePath = `entry_${imageModalEntry.id}/${Date.now()}_${file.name}`;
                  const { error: uploadError } = await supabase.storage.from('entry-images').upload(filePath, file);
                  if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('entry-images').getPublicUrl(filePath);
                    await supabase.from('entry_images').insert({ entry_id: imageModalEntry.id, url: urlData.publicUrl });
                  } else {
                    success = false;
                  }
                }
                setUploading(false);
                setImageFiles(null);
                setImageModalEntry(null);
                setSaveImageNotice(success ? 'Lưu ảnh thành công!' : 'Có lỗi khi lưu một số ảnh!');
                setTimeout(() => setSaveImageNotice(''), 2500);
              }}
              disabled={uploading || !imageFiles || imageFiles.length === 0}
            >{uploading ? 'Đang tải...' : 'Lưu ảnh'}</button>
          </div>
        </div>
      )}
      {detailEntry && (
        <EntryDetailModal entry={detailEntry} images={detailImages} onClose={() => setDetailEntry(null)} />
      )}
    </div>
  )
}

export default EntryManager
