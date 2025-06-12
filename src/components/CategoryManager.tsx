import React from 'react'
import { MAIN_MENU_STYLE_REACT } from '../styleConfig'

interface Category {
  id: number
  name: string
  group: string
  user_id: string
}

interface Props {
  categories: Category[]
  addCategory: (e: React.FormEvent) => void
  deleteCategory: (id: number) => void
  catName: string
  setCatName: (v: string) => void
  catGroup: string
  setCatGroup: (v: string) => void
  catEditId: number | null
  catEditName: string
  setCatEditName: (v: string) => void
  catEditGroup: string
  setCatEditGroup: (v: string) => void
  startEditCategory: (id: number, name: string, group: string) => void
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
  catGroup,
  setCatGroup,
  catEditId,
  catEditName,
  setCatEditName,
  catEditGroup,
  setCatEditGroup,
  startEditCategory,
  saveEditCategory,
  cancelEditCategory,
  catInputRef
}) => (
  <div className="category-manager" style={MAIN_MENU_STYLE_REACT}>
    <h3 style={{marginBottom:24,fontSize:24,fontWeight:800,color:'#2ecc40',textAlign:'center'}}>Quản lý danh mục</h3>
    <form onSubmit={addCategory} style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
      <input ref={catInputRef} value={catName} onChange={e=>setCatName(e.target.value)} placeholder="Tên danh mục" style={{flex:1,minWidth:120,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
      <input value={catGroup} onChange={e=>setCatGroup(e.target.value)} placeholder="Nhóm" style={{flex:1,minWidth:100,padding:12,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
      <button type="submit" style={{padding:'12px 18px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:16,minWidth:90}}>Thêm</button>
    </form>
    <ul style={{listStyle:'none',padding:0,margin:0}}>
      {categories.map(cat => (
        <li key={cat.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
          {catEditId === cat.id ? (
            <>
              <input value={catEditName} onChange={e=>setCatEditName(e.target.value)} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} />
              <input value={catEditGroup} onChange={e=>setCatEditGroup(e.target.value)} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #ccc',fontSize:16, color:'#222', background:'#fff'}} placeholder="Nhóm" />
              <button onClick={saveEditCategory} style={{padding:'10px 18px',borderRadius:8,background:'#3498db',color:'#fff',border:'none',fontWeight:600}}>Lưu</button>
              <button onClick={cancelEditCategory} style={{padding:'10px 18px',borderRadius:8,background:'#aaa',color:'#fff',border:'none',fontWeight:600}}>Hủy</button>
            </>
          ) : (
            <>
              <span style={{flex:1,fontSize:16, color:'#222'}}>{cat.name}</span>
              <span style={{flex:1,fontSize:15, color:'#888'}}>{cat.group}</span>
              <button onClick={()=>startEditCategory(cat.id,cat.name,cat.group)} style={{padding:'10px 18px',borderRadius:8,background:'#f1c40f',color:'#fff',border:'none',fontWeight:600}}>Sửa</button>
              <button onClick={()=>deleteCategory(cat.id)} style={{padding:'10px 18px',borderRadius:8,background:'#e74c3c',color:'#fff',border:'none',fontWeight:600}}>Xóa</button>
            </>
          )}
        </li>
      ))}
    </ul>
  </div>
)

export default CategoryManager
