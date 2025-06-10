import React from 'react'

interface Category {
  id: number
  name: string
  user_id: string
}

interface Props {
  categories: Category[]
  addCategory: (e: React.FormEvent) => void
  deleteCategory: (id: number) => void
  catName: string
  setCatName: (v: string) => void
  catEditId: number | null
  catEditName: string
  setCatEditName: (v: string) => void
  startEditCategory: (id: number, name: string) => void
  saveEditCategory: () => void
  cancelEditCategory: () => void
  catInputRef?: React.RefObject<HTMLInputElement>
}

const CategoryManager: React.FC<Props> = ({
  categories,
  addCategory,
  deleteCategory,
  catName,
  setCatName,
  catEditId,
  catEditName,
  setCatEditName,
  startEditCategory,
  saveEditCategory,
  cancelEditCategory,
  catInputRef
}) => (
  <div style={{background:'#fff',borderRadius:16,padding:32,marginBottom:32,boxShadow:'0 2px 16px #0001', color:'#222'}}>
    <h3 style={{marginBottom:24,fontSize:26,fontWeight:800,color:'#2ecc40'}}>Quản lý danh mục</h3>
    <form onSubmit={addCategory} style={{display:'flex',gap:12,marginBottom:20}}>
      <input ref={catInputRef} value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Thêm danh mục mới" style={{flex:1,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
      <button type="submit" style={{padding:'12px 24px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:16}}>Thêm</button>
    </form>
    <ul style={{listStyle:'none',padding:0,margin:0}}>
      {categories.map(cat => (
        <li key={cat.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
          {catEditId === cat.id ? (
            <>
              <input value={catEditName} onChange={e=>setCatEditName(e.target.value)} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
              <button onClick={saveEditCategory} style={{padding:'10px 18px',borderRadius:8,background:'#3498db',color:'#fff',border:'none',fontWeight:600}}>Lưu</button>
              <button onClick={cancelEditCategory} style={{padding:'10px 18px',borderRadius:8,background:'#aaa',color:'#fff',border:'none',fontWeight:600}}>Hủy</button>
            </>
          ) : (
            <>
              <span style={{flex:1,fontSize:16, color:'#222'}}>{cat.name}</span>
              <button onClick={()=>startEditCategory(cat.id,cat.name)} style={{padding:'10px 18px',borderRadius:8,background:'#f1c40f',color:'#fff',border:'none',fontWeight:600}}>Sửa</button>
              <button onClick={()=>deleteCategory(cat.id)} style={{padding:'10px 18px',borderRadius:8,background:'#e74c3c',color:'#fff',border:'none',fontWeight:600}}>Xóa</button>
            </>
          )}
        </li>
      ))}
    </ul>
  </div>
)

export default CategoryManager
