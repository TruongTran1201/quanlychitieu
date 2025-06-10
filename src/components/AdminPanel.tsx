import React from 'react'

interface AdminPanelProps {
  allUsers: any[]
  rolesList: {id: string, name: string, description: string}[]
  deleteRoleFromUser: (userId: string, roleId: string) => void
  addRoleToUser: (userId: string, roleId: string) => void
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, rolesList, deleteRoleFromUser, addRoleToUser }) => (
  <div className="admin-panel" style={{background:'#fff',borderRadius:16,padding:32,marginBottom:32,boxShadow:'0 2px 16px #0001', color:'#222'}}>
    <h2 style={{fontSize:26,fontWeight:800,color:'#2ecc40',marginBottom:24}}>Quản trị người dùng</h2>
    <div className="user-roles">
      {allUsers.map(u => (
        <div key={u.user_id} className="user-role-item" style={{display:'flex',alignItems:'center',gap:16,marginBottom:16,background:'#f8f8fa',borderRadius:8,padding:16}}>
          <div className="user-email" style={{flex:2,fontWeight:600,color:'#222'}}>{u.users?.email || u.user_id}</div>
          <div className="user-role" style={{flex:2}}>
            {u.role_id ? (
              <span className="role-assigned" style={{color:'#2980b9',fontWeight:700}}>{u.roles?.name}</span>
            ) : (
              <span className="role-undefined" style={{color:'#aaa'}}>Chưa phân quyền</span>
            )}
          </div>
          <div className="role-actions" style={{flex:1}}>
            {u.role_id ? (
              <button className="remove-role-btn" style={{padding:'8px 16px',borderRadius:6,background:'#e74c3c',color:'#fff',border:'none',fontWeight:600}} onClick={() => deleteRoleFromUser(u.user_id, u.role_id)}>Xóa quyền</button>
            ) : (
              <button className="assign-role-btn" style={{padding:'8px 16px',borderRadius:6,background:'#2ecc40',color:'#fff',border:'none',fontWeight:600}} onClick={() => addRoleToUser(u.user_id, rolesList[0]?.id)}>Gán quyền mặc định</button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default AdminPanel;
