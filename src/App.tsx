import { useState, useEffect, useRef } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import CategoryManager from './components/CategoryManager'
import EntryManager from './components/EntryManager'
import ReportView from './components/ReportView'
import AdminPanel from './components/AdminPanel'

export interface Entry {
  id: number
  user_id: string // Thêm user_id để phân biệt dữ liệu từng user
  category: string
  description: string
  amount: number
  date: string // ISO string
}

function getYear(date: string) {
  return new Date(date).getFullYear()
}
function getMonth(date: string) {
  return new Date(date).getMonth() + 1
}

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'category' | 'entry' | 'report' | 'admin'>('entry')
  const [rolesList, setRolesList] = useState<{id: string, name: string, description: string}[]>([])

  // Thông báo trạng thái thao tác
  const [entryNotice, setEntryNotice] = useState<string>('');
  const [categoryNotice, setCategoryNotice] = useState<string>('');

  // Ref cho input đầu tiên
  const descInputRef = useRef<HTMLInputElement>(null)
  const catInputRef = useRef<HTMLInputElement>(null)

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Load entries từ Supabase, chỉ lấy của user hiện tại
  useEffect(() => {
    if (!user) return
    (async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      if (!error && data) {
        setEntries(data as Entry[])
      }
      setLoading(false)
    })()
  }, [user])

  // Thêm entry (Supabase), chỉ cho phép nhập khoản chi
  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount.trim() || isNaN(Number(amount)) || !user) {
      setEntryNotice('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      if (descInputRef.current) descInputRef.current.focus();
      return;
    }
    setEntryNotice('');
    const entry = {
      user_id: user.id,
      category,
      description: description.trim(),
      amount: Number(amount),
      date: date
    }
    const { data, error } = await supabase
      .from('entries')
      .insert([entry])
      .select()
    if (!error && data && data[0]) {
      setEntries([data[0] as Entry, ...entries])
      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().slice(0, 10))
      setEntryNotice('Thêm khoản chi thành công!');
      if (descInputRef.current) descInputRef.current.focus();
    } else {
      setEntryNotice('Có lỗi xảy ra, vui lòng thử lại!');
    }
  }

  // Xóa entry (Supabase), chỉ xóa entry của user hiện tại
  const deleteEntry = async (id: number) => {
    if (!user) return
    if (!window.confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) return;
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) {
      setEntries(entries.filter(entry => entry.id !== id))
      setEntryNotice('Đã xóa khoản chi!');
    }
  }

  // Thêm state cho năm và tháng
  const years = Array.from(new Set(entries.map(e => getYear(e.date)))).sort((a, b) => b - a)
  const [selectedYear, setSelectedYear] = useState(() => years[0] || getYear(new Date().toISOString()))
  const [selectedMonth, setSelectedMonth] = useState<string>('all') // 'all' hoặc '1', '2', ...

  // Khi entries thay đổi, nếu selectedYear không còn trong danh sách thì cập nhật lại
  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0])
      setSelectedMonth('all')
    }
  }, [years.join(','), selectedYear])

  // Lấy danh sách tháng có dữ liệu trong năm đã chọn
  const monthsInYear = Array.from(new Set(entries.filter(e => getYear(e.date) === selectedYear).map(e => getMonth(e.date)))).sort((a, b) => a - b)

  // Khi đổi năm, nếu selectedMonth không còn trong danh sách thì reset về 'all'
  useEffect(() => {
    if (selectedMonth !== 'all' && !monthsInYear.includes(Number(selectedMonth))) {
      setSelectedMonth('all')
    }
  }, [selectedYear, monthsInYear.join(','), selectedMonth])

  // Lọc entries theo năm và tháng
  const filteredEntries = entries.filter(e => {
    const year = getYear(e.date)
    const month = getMonth(e.date)
    if (year !== selectedYear) return false
    if (selectedMonth === 'all') return true
    return month === Number(selectedMonth)
  })

  // Đăng nhập/Đăng ký
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpNotice, setSignUpNotice] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setSignUpNotice('')
    if (isSignUp) {
      const { data: signUpData, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword })
      if (error) setAuthError(error.message)
      else {
        setSignUpNotice('Đăng ký thành công! Hãy kiểm tra email và xác nhận để hoàn tất.');
        // Gán role mặc định cho user mới
        const userId = signUpData?.user?.id;
        if (userId) {
          // Lấy id của role Entry & Report
          const { data: roles } = await supabase.from('roles').select('id,name')
          const entryRole = roles?.find((r: any) => r.name === 'Entry')?.id;
          const reportRole = roles?.find((r: any) => r.name === 'Report')?.id;
          if (entryRole) {
            await supabase.from('user_roles').insert([{ user_id: userId, role_id: entryRole }]);
          }
          if (reportRole) {
            await supabase.from('user_roles').insert([{ user_id: userId, role_id: reportRole }]);
          }
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      if (error) setAuthError(error.message)
    }
  }

  // Thêm state để xác định có hiển thị homepage không
  const [showHome, setShowHome] = useState(true)

  // Khi user đăng nhập thành công thì ẩn homepage
  useEffect(() => {
    if (user) setShowHome(false)
    else setShowHome(true)
  }, [user])

  // Khi logout thì chuyển về homepage
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setEntries([])
    setShowHome(true)
  }

  // State cho categories
  const [categories, setCategories] = useState<{id: number, name: string, user_id: string}[]>([])
  const [catName, setCatName] = useState('')
  const [catEditId, setCatEditId] = useState<number|null>(null)
  const [catEditName, setCatEditName] = useState('')

  // Load categories từ Supabase, chỉ lấy của user hiện tại
  useEffect(() => {
    if (!user) return
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: true })
      if (!error && data) {
        setCategories(data)
        // Nếu category hiện tại không còn, set lại
        if (!data.find(c => c.name === category)) {
          setCategory(data[0]?.name || '')
        }
      }
    })()
  }, [user])

  // Thêm category
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim() || !user) {
      setCategoryNotice('Vui lòng nhập tên danh mục!');
      if (catInputRef.current) catInputRef.current.focus();
      return;
    }
    setCategoryNotice('');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: catName.trim(), user_id: user.id }])
      .select()
    if (!error && data && data[0]) {
      setCategories([...categories, data[0]])
      setCatName('')
      setCategoryNotice('Thêm danh mục thành công!');
      if (catInputRef.current) catInputRef.current.focus();
    } else {
      setCategoryNotice('Có lỗi xảy ra, vui lòng thử lại!');
    }
  }

  // Xóa category
  const deleteCategory = async (id: number) => {
    if (!user) return
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
      setCategoryNotice('Đã xóa danh mục!');
      // Nếu đang chọn category bị xóa, chuyển sang category đầu tiên
      if (categories.find(c => c.id === id)?.name === category) {
        setCategory(categories.filter(c => c.id !== id)[0]?.name || '')
      }
    }
  }

  // Sửa category
  const startEditCategory = (id: number, name: string) => {
    setCatEditId(id)
    setCatEditName(name)
  }
  const saveEditCategory = async () => {
    if (!catEditName.trim() || !user || catEditId === null) return
    const { data, error } = await supabase
      .from('categories')
      .update({ name: catEditName.trim() })
      .eq('id', catEditId)
      .eq('user_id', user.id)
      .select()
    if (!error && data && data[0]) {
      setCategories(categories.map(c => c.id === catEditId ? data[0] : c))
      // Nếu đang chọn category bị đổi tên, cập nhật lại
      if (category === categories.find(c => c.id === catEditId)?.name) {
        setCategory(data[0].name)
      }
      setCatEditId(null)
      setCatEditName('')
    }
  }
  const cancelEditCategory = () => {
    setCatEditId(null)
    setCatEditName('')
  }

  // Thêm state cho role và quyền user
  const [roleName, setRoleName] = useState<string>('')
  const [allUsers, setAllUsers] = useState<any[]>([])

  // Lấy danh sách roles
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('roles').select('id, name, description')
      setRolesList(data || [])
    })()
  }, [])

  // Lấy role hiện tại của user (join user_roles và roles)
  useEffect(() => {
    if (!user) return
    (async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id)
      if (!error && data) {
        // data là mảng các user_roles, mỗi phần tử có roles (object hoặc mảng)
        const roleNames: string[] = data
          .map((r: any) => {
            if (Array.isArray(r.roles)) return r.roles[0]?.name
            return r.roles?.name
          })
          .filter(Boolean)
        if (roleNames.includes('SuperAdmin')) {
          setRoleName('SuperAdmin')
        } else if (roleNames.length > 0) {
          setRoleName(roleNames[0])
        } else {
          setRoleName('')
        }
        // Nếu là SuperAdmin, lấy danh sách user để phân quyền
        if (roleNames.includes('SuperAdmin')) {
          const { data: users } = await supabase
            .from('user_roles')
            .select('id, user_id, role_id, roles(name)') // Đã bỏ users:user_id(email)
          setAllUsers(users || [])
        }
      } else {
        setRoleName('')
      }
    })()
  }, [user])

  // Thêm role cho user
  const addRoleToUser = async (userId: string, roleId: string) => {
    if (!user) return
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role_id: roleId }])
      .select()
    if (!error && data) {
      // Cập nhật lại danh sách người dùng nếu đang ở trang phân quyền
      if (activeTab === 'admin') {
        setAllUsers(allUsers.map(u => u.user_id === userId ? { ...u, role_id: roleId } : u))
      }
    }
  }

  // Xóa role của user
  const deleteRoleFromUser = async (userId: string, roleId: string) => {
    if (!user) return
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)
    if (!error) {
      // Cập nhật lại danh sách người dùng nếu đang ở trang phân quyền
      if (activeTab === 'admin') {
        setAllUsers(allUsers.map(u => u.user_id === userId ? { ...u, role_id: null } : u))
      }
    }
  }

  // Chuyển tab
  const switchTab = (tab: 'category' | 'entry' | 'report' | 'admin') => {
    setActiveTab(tab)
    // ĐÃ BỎ: Khi chuyển sang tab report, nếu chưa có entry nào thì tự động chuyển sang tab entry
    // if (tab === 'report' && entries.length === 0) {
    //   setActiveTab('entry')
    // }
  }

  if (showHome) {
    return (
      <div className="homepage" style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'#222'}}>
        <h1 style={{fontSize:48,marginBottom:16,color:'#2ecc40',fontWeight:900,letterSpacing:1}}>Quản lý chi tiêu</h1>
        <p style={{fontSize:22,marginBottom:40,color:'#fff',fontWeight:400}}>Quản lý chi tiêu cá nhân</p>
        <div style={{background:'#fff',padding:40,borderRadius:16,boxShadow:'0 4px 32px #0002',minWidth:340}}>
          <form className="auth-form" onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              required
              style={{width:'100%',padding:14,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:17}}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              required
              style={{width:'100%',padding:14,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:17}}
            />
            <div className="auth-actions" style={{display:'flex',flexDirection:'column',gap:10,marginBottom:10}}>
              <button type="submit" className="auth-btn" style={{padding:'12px 0',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontSize:18,fontWeight:700,letterSpacing:1}}>{isSignUp ? 'Đăng ký' : 'Đăng nhập'}</button>
              <button type="button" className="switch-auth-btn" style={{background:'none',border:'none',color:'#2ecc40',textDecoration:'underline',fontSize:15}} onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
              </button>
            </div>
            {authError && <div className="auth-error" style={{color:'#e74c3c',marginBottom:8}}>{authError}</div>}
            {signUpNotice && <div className="sign-up-notice" style={{color:'#2ecc40',marginBottom:8}}>{signUpNotice}</div>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app" style={{minHeight:'100vh',background:'#f6f8fa',fontFamily:'Segoe UI,Roboto,sans-serif'}}>
      <div style={{width:'100%',maxWidth:900,margin:'0 auto',padding:'48px 0',position:'relative'}}>
        {/* User info top right */}
        {user && (
          <div style={{position:'absolute',top:0,right:0,display:'flex',alignItems:'center',gap:12,zIndex:2}}>
            <span style={{fontWeight:600, color:'#222',fontSize:15}}>{user.email}</span>
            <button className="logout-btn" onClick={handleLogout} style={{padding:'10px 18px',borderRadius:6,background:'#e74c3c',color:'#fff',border:'none',fontWeight:600,fontSize:16}}>Đăng xuất</button>
          </div>
        )}
        <h2 style={{fontWeight:800,fontSize:32,letterSpacing:1,color:'#2ecc40',margin:'0 0 32px 0',textAlign:'center'}}>Quản lý chi tiêu</h2>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32}}>
          <select
            id="main-menu"
            value={activeTab}
            onChange={e => switchTab(e.target.value as 'entry'|'report'|'category'|'admin')}
            style={{padding:14,borderRadius:8,border:'none',fontSize:18,background:'#fff',color:'#222',fontWeight:600,boxShadow:'0 2px 8px #0001',outline:'none',cursor:'pointer'}}
          >
            <option value="entry">📝 Nhập chi</option>
            <option value="report">📊 Báo cáo</option>
            <option value="category">📁 Danh mục</option>
            {roleName === 'SuperAdmin' && (
              <option value="admin">⚙️ Quản trị</option>
            )}
          </select>
        </div>
        <div style={{width:'100%'}}>
          {activeTab === 'entry' && (
            <>
              {entryNotice && (
                <div style={{marginBottom:12, color: entryNotice.includes('thành công') ? '#2ecc40' : '#e74c3c', fontWeight:600}}>
                  {entryNotice}
                </div>
              )}
              {loading && (
                <div style={{marginBottom:12, color:'#888'}}>Đang tải dữ liệu...</div>
              )}
              <EntryManager
                entries={entries}
                loading={loading}
                addEntry={addEntry}
                deleteEntry={deleteEntry}
                category={category}
                setCategory={setCategory}
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                date={date}
                setDate={setDate}
                categories={categories}
                descInputRef={descInputRef as React.RefObject<HTMLInputElement>}
              />
            </>
          )}
          {activeTab === 'report' && (
            <ReportView
              entries={filteredEntries}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              years={years}
              monthsInYear={monthsInYear}
            />
          )}
          {activeTab === 'category' && (
            <>
              {categoryNotice && (
                <div style={{marginBottom:12, color: categoryNotice.includes('thành công') ? '#2ecc40' : '#e74c3c', fontWeight:600}}>
                  {categoryNotice}
                </div>
              )}
              <CategoryManager
                categories={categories}
                addCategory={addCategory}
                deleteCategory={deleteCategory}
                catName={catName}
                setCatName={setCatName}
                catEditId={catEditId}
                catEditName={catEditName}
                setCatEditName={setCatEditName}
                startEditCategory={startEditCategory}
                saveEditCategory={saveEditCategory}
                cancelEditCategory={cancelEditCategory}
                catInputRef={catInputRef as React.RefObject<HTMLInputElement>}
              />
            </>
          )}
          {activeTab === 'admin' && roleName === 'SuperAdmin' && (
            <AdminPanel
              allUsers={allUsers}
              rolesList={rolesList}
              deleteRoleFromUser={deleteRoleFromUser}
              addRoleToUser={addRoleToUser}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
