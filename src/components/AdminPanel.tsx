import React, { useState, useEffect } from 'react'
import { MAIN_MENU_STYLE_REACT } from '../styleConfig'

interface AdminPanelProps {
  allUsers: any[]
  rolesList: {id: string, name: string, description: string}[]
  deleteRoleFromUser: (userId: string, roleId: string) => void
  addRoleToUser: (userId: string, roleId: string) => void
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, rolesList, deleteRoleFromUser, addRoleToUser }) => {
  // State cho popup thêm quyền
  const [showAddRole, setShowAddRole] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const handleAddRole = () => {
    if (selectedUser && selectedRole) {
      addRoleToUser(selectedUser, selectedRole)
      setShowAddRole(false)
      setSelectedUser('')
      setSelectedRole('')
    }
  }

  // Paging state for admin user list
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalUsers = allUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));
  useEffect(() => { setPage(1); }, [itemsPerPage, allUsers.length]);
  const pagedUsers = allUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="admin-panel" style={MAIN_MENU_STYLE_REACT}>
      <h2 style={{fontSize:24,fontWeight:800,color:'#2ecc40',marginBottom:24, textAlign:'center'}}>Quản trị người dùng</h2>
      <button
        style={{marginBottom:24,padding:'10px 20px',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontWeight:700,fontSize:16,cursor:'pointer',minWidth:120}}
        onClick={() => setShowAddRole(v => !v)}
      >
        {showAddRole ? 'Đóng' : 'Thêm quyền'}
      </button>
      {showAddRole && (
        <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:24}}>
          <select
            style={{padding:'10px 14px',borderRadius:6,border:'1px solid #ccc',fontSize:16,minWidth:180}}
            value={selectedUser}
            onChange={e => {
              setSelectedUser(e.target.value)
              setSelectedRole('')
            }}
          >
            <option value="">Chọn người dùng...</option>
            {/* Lấy user duy nhất theo user_id, nhưng hiển thị tên + các quyền hiện có */}
            {Array.from(new Map(allUsers.map(u => [u.user_id, u])).values()).map(u => {
              // Lấy tất cả role name của user này
              const userRoles = allUsers.filter(x => x.user_id === u.user_id && x.roles?.name).map(x => x.roles.name).join(', ')
              return (
                <option key={u.user_id} value={u.user_id}>
                  {u.user_email || u.user_id}{userRoles ? ` (${userRoles})` : ''}
                </option>
              )
            })}
          </select>
          {/* Dropdown role: chỉ show các role mà user chưa có */}
          {selectedUser && (
            <select
              style={{padding:'10px 14px',borderRadius:6,border:'1px solid #ccc',fontSize:16,minWidth:180}}
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              key={selectedUser}
            >
              <option value="">Chọn quyền...</option>
              {rolesList.filter(role =>
                !allUsers.some(u => u.user_id === selectedUser && u.role_id === role.id)
              ).map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          )}
          <button
            style={{padding:'10px 20px',borderRadius:8,background:'#2980b9',color:'#fff',border:'none',fontWeight:700,fontSize:16,cursor:'pointer'}}
            onClick={handleAddRole}
            disabled={!selectedUser || !selectedRole}
          >
            Xác nhận
          </button>
        </div>
      )}
      <div className="user-roles">
        {/* Hiển thị theo user_id + role_id để đảm bảo key luôn unique */}
        {pagedUsers.map((u, idx) => (
          <div key={u.user_id + '-' + (u.role_id || idx)} className="user-role-item" style={{display:'flex',alignItems:'center',gap:16,marginBottom:16,background:'#f8f8fa',borderRadius:8,padding:16}}>
            <div className="user-email" style={{flex:2,fontWeight:600,color:'#222'}}>{u.user_email || u.user_id}</div>
            <div className="user-role" style={{flex:2}}>
              {u.role_id ? (
                <span className="role-assigned" style={{color:'#2980b9',fontWeight:700}}>{u.roles?.name}</span>
              ) : (
                <span className="role-undefined" style={{color:'#aaa'}}>Chưa phân quyền</span>
              )}
            </div>
            <div className="role-actions" style={{flex:2, display:'flex', gap:8, alignItems:'center'}}>
              <select
                style={{padding:'8px 12px',borderRadius:6,border:'1px solid #ccc',fontSize:15}}
                defaultValue={u.role_id || ''}
                onChange={e => addRoleToUser(u.user_id, e.target.value)}
              >
                <option value="">Chọn quyền...</option>
                {rolesList.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {u.role_id ? (
                <button className="remove-role-btn" style={{padding:'8px 16px',borderRadius:6,background:'#e74c3c',color:'#fff',border:'none',fontWeight:600}} onClick={() => deleteRoleFromUser(u.user_id, u.role_id)}>Xóa quyền</button>
              ) : null}
            </div>
          </div>
        ))}
        {/* Paging controls for admin user list */}
        {totalUsers > 0 && (
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
    </div>
  )
}

export default AdminPanel
