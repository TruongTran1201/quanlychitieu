import React, { useState } from 'react'
import { MAIN_MENU_STYLE_REACT } from '../styleConfig'
import { supabase } from '../supabaseClient'
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
  entryFilterCategory: string;
  setEntryFilterCategory: (cat: string) => void;
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
  setEntryFilterCategory
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
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterMonthYear, setFilterMonthYear] = useState('all');

  // Filter entries theo category và month
  const filteredEntries = entries.filter(e => {
    const matchCategory = entryFilterCategory === 'all' || e.category === entryFilterCategory;
    let matchMonthYear = true;
    if (filterMonthYear !== 'all') {
      const d = new Date(e.date);
      const [month, year] = filterMonthYear.split('/');
      matchMonthYear = (d.getMonth() + 1) === Number(month) && d.getFullYear() === Number(year);
    }
    return matchCategory && matchMonthYear;
  });

  const totalEntries = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / itemsPerPage));

  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pagedEntries = sortedEntries.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  React.useEffect(() => { setPage(1); }, [itemsPerPage, entryFilterCategory]);

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

  const monthYearOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'Tất cả' }];
    const allDates = entries.map(e => new Date(e.date));
    const uniqueMonthYears = Array.from(
      new Set(allDates.map(d => `${d.getMonth() + 1}/${d.getFullYear()}`))
    );
    uniqueMonthYears.sort((a, b) => {
      const [ma, ya] = a.split('/').map(Number);
      const [mb, yb] = b.split('/').map(Number);
      return yb !== ya ? yb - ya : mb - ma;
    });
    uniqueMonthYears.forEach(my => {
      const [month, year] = my.split('/');
      options.push({
        value: `${month}/${year}`,
        label: `Tháng ${month.padStart(2, '0')}/${year}`
      });
    });
    return options;
  }, [entries]);

  return (
    <div className="entry-manager" style={{
      ...MAIN_MENU_STYLE_REACT,
      maxWidth: 480,
      margin: '0 auto',
      padding: '12px 8px 32px 8px',
      boxSizing: 'border-box',
      minHeight: '100vh',
      width: '100vw',
    }}>
      <h3 style={{marginBottom:24,fontSize:22,fontWeight:800,color:'#2ecc40',textAlign:'center'}}>Nhập khoản chi</h3>
      <form onSubmit={addEntry} style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap',alignItems:'center',width:'100%'}}>
        <select value={category} onChange={e=>setCategory(e.target.value)} style={{flex:1,minWidth:120,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:15,color:'#222',background:'#fff',width:'100%'}}>
          {categories.length === 0 && <option value="">Chưa có danh mục</option>}
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input ref={descInputRef} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Mô tả" style={{flex:2,minWidth:120,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:15,color:'#222',background:'#fff',width:'100%'}} />
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Số tiền" type="number" style={{width:'100%',minWidth:90,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:15,color:'#222',background:'#fff'}} />
        <input value={date} onChange={e=>setDate(e.target.value)} type="datetime-local" style={{width:'100%',minWidth:120,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:15,color:'#222',background:'#fff'}} />
        <button type="submit" style={{padding:'10px 16px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:15,minWidth:90,width:'100%'}}>Thêm</button>
      </form>
      <div style={{display:'flex',gap:16,alignItems:'flex-end',marginBottom:14,flexWrap:'wrap',justifyContent:'center',width:'100%'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',minWidth:120,flex:1}}>
          <label style={{fontWeight:600,color:'#222',marginBottom:4}}>Danh mục</label>
          <select value={entryFilterCategory} onChange={e=>setEntryFilterCategory(e.target.value)} style={{padding:8,borderRadius:6,minWidth:100,width:'100%'}}>
            <option value="all">Tất cả</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',minWidth:120,flex:1}}>
          <label style={{fontWeight:600,color:'#222',marginBottom:4}}>Tháng/Năm</label>
          <select value={filterMonthYear} onChange={e=>setFilterMonthYear(e.target.value)} style={{padding:8,borderRadius:6,minWidth:100,width:'100%'}}>
            {monthYearOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
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
              {pagedEntries.map(entry => (
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
          {/* Paging controls for entry table */}
          {totalEntries > 0 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,margin:'18px 0'}}>
              <button onClick={()=>setPage(1)} disabled={page===1} style={{padding:'6px 12px',borderRadius:6}}>&laquo;</button>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'6px 12px',borderRadius:6}}>&lsaquo;</button>
              <span style={{fontWeight:600}}>Trang</span>
              <select value={page} onChange={e=>setPage(Number(e.target.value))} style={{padding:'6px 10px',borderRadius:6}}>
                {Array.from({length: totalPages}, (_,i)=>i+1).map(p=>(<option key={p} value={p}>{p}</option>))}
              </select>
              <span style={{fontWeight:600}}>/ {totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{padding:'6px 12px',borderRadius:6}}>&rsaquo;</button>
              <button onClick={()=>setPage(totalPages)} disabled={page===totalPages} style={{padding:'6px 12px',borderRadius:6}}>&raquo;</button>
              <span style={{marginLeft:16}}>Hiển thị</span>
              <select value={itemsPerPage} onChange={e=>setItemsPerPage(Number(e.target.value))} style={{padding:'6px 10px',borderRadius:6}}>
                {[5,10,20,50,100].map(n=>(<option key={n} value={n}>{n}/trang</option>))}
              </select>
            </div>
          )}
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
