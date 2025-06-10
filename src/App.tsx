import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './hooks/useAuth';
import { useEntries } from './hooks/useEntries';
import { useCategories } from './hooks/useCategories';
import { useRoles } from './hooks/useRoles';
import EntryFilterBar from './components/EntryFilterBar';
import CategoryManager from './components/CategoryManager';
import EntryManager from './components/EntryManager';
import ReportView from './components/ReportView';
import AdminPanel from './components/AdminPanel';

function App() {
  // Auth
  const auth = useAuth();
  // Tab state
  const [activeTab, setActiveTab] = useState<'category' | 'entry' | 'report' | 'admin'>('entry');
  // Entries
  const entriesState = useEntries(auth.user);
  // Categories
  const categoriesState = useCategories(auth.user, entriesState.category, entriesState.setCategory);
  // Roles
  const rolesState = useRoles(auth.user, activeTab);

  // Filter/search state for EntryManager
  const [entryFilterCategory, setEntryFilterCategory] = useState<string>('all');
  const [entryFilterMonth, setEntryFilterMonth] = useState<string>('all');
  const entryMonths = Array.from(new Set(entriesState.entries.map(e => new Date(e.date).getMonth() + 1))).sort((a, b) => a - b);

  // Paging state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const filteredPagedEntries = [...entriesState.entries]
    .filter(e => (entryFilterCategory === 'all' || e.category === entryFilterCategory))
    .filter(e => (entryFilterMonth === 'all' || new Date(e.date).getMonth() + 1 === Number(entryFilterMonth)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const filteredTotalEntries = entriesState.entries.filter(e => (entryFilterCategory === 'all' || e.category === entryFilterCategory)).filter(e => (entryFilterMonth === 'all' || new Date(e.date).getMonth() + 1 === Number(entryFilterMonth))).length;
  const filteredTotalPages = Math.max(1, Math.ceil(filteredTotalEntries / itemsPerPage));
  useEffect(() => { setPage(1); }, [entryFilterCategory, entryFilterMonth, itemsPerPage]);

  // Các state cho báo cáo (ReportView)
  const years = Array.from(new Set(entriesState.entries.map(e => new Date(e.date).getFullYear()))).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(() => years[0] || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const monthsInYear = Array.from(new Set(entriesState.entries.filter(e => new Date(e.date).getFullYear() === selectedYear).map(e => new Date(e.date).getMonth() + 1))).sort((a, b) => a - b);
  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
      setSelectedMonth('all');
    }
  }, [years.join(','), selectedYear]);
  useEffect(() => {
    if (selectedMonth !== 'all' && !monthsInYear.includes(Number(selectedMonth))) {
      setSelectedMonth('all');
    }
  }, [selectedYear, monthsInYear.join(','), selectedMonth]);
  const filteredEntries = entriesState.entries.filter(e => {
    const year = new Date(e.date).getFullYear();
    const month = new Date(e.date).getMonth() + 1;
    if (year !== selectedYear) return false;
    if (selectedMonth === 'all') return true;
    return month === Number(selectedMonth);
  });

  if (auth.showHome) {
    return (
      <div className="homepage" style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'#222'}}>
        <h1 style={{fontSize:48,marginBottom:16,color:'#2ecc40',fontWeight:900,letterSpacing:1}}>Quản lý chi tiêu</h1>
        <p style={{fontSize:22,marginBottom:40,color:'#fff',fontWeight:400}}>Quản lý chi tiêu cá nhân</p>
        <div style={{background:'#fff',padding:40,borderRadius:16,boxShadow:'0 4px 32px #0002',minWidth:340}}>
          <form className="auth-form" onSubmit={auth.handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={auth.authEmail}
              onChange={e => auth.setAuthEmail(e.target.value)}
              required
              style={{width:'100%',padding:14,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:17}}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={auth.authPassword}
              onChange={e => auth.setAuthPassword(e.target.value)}
              required
              style={{width:'100%',padding:14,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:17}}
            />
            <div className="auth-actions" style={{display:'flex',flexDirection:'column',gap:10,marginBottom:10}}>
              <button type="submit" className="auth-btn" style={{padding:'12px 0',borderRadius:8,background:'#2ecc40',color:'#fff',border:'none',fontSize:18,fontWeight:700,letterSpacing:1}}>{auth.isSignUp ? 'Đăng ký' : 'Đăng nhập'}</button>
              <button type="button" className="switch-auth-btn" style={{background:'none',border:'none',color:'#2ecc40',textDecoration:'underline',fontSize:15}} onClick={() => auth.setIsSignUp(!auth.isSignUp)}>
                {auth.isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
              </button>
            </div>
            {auth.authError && <div className="auth-error" style={{color:'#e74c3c',marginBottom:8}}>{auth.authError}</div>}
            {auth.signUpNotice && <div className="sign-up-notice" style={{color:'#2ecc40',marginBottom:8}}>{auth.signUpNotice}</div>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app" style={{minHeight:'100vh',background:'#f6f8fa',fontFamily:'Segoe UI,Roboto,sans-serif'}}>
      <div style={{width:'100%',maxWidth:900,minWidth:0,margin:'0 auto',padding:'48px 8px',position:'relative',boxSizing:'border-box'}}>
        {/* User info top right */}
        {/* User info top right */}
<div className="user-info-bar">
  {auth.user && (
    <>
      <span className="user-email">{auth.user.email}</span>
      <button className="logout-btn" onClick={auth.handleLogout}>Đăng xuất</button>
    </>
  )}
</div>
<h2 className="main-title">Quản lý chi tiêu</h2>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32}}>
          <select
            id="main-menu"
            value={activeTab}
            onChange={e => setActiveTab(e.target.value as 'entry'|'report'|'category'|'admin')}
            style={{padding:14,borderRadius:8,border:'none',fontSize:18,background:'#fff',color:'#222',fontWeight:600,boxShadow:'0 2px 8px #0001',outline:'none',cursor:'pointer',minWidth:160}}
          >
            <option value="entry">📝 Nhập chi tiêu</option>
            <option value="report">📊 Báo cáo</option>
            {rolesState.roleName === 'SuperAdmin' && (
              <option value="admin">⚙️ Quản trị</option>
            )}
            {(rolesState.roleName === 'SuperAdmin' || rolesState.roleName.includes('Category')) && (
              <option value="category">📁 Danh mục</option>
            )}
          </select>
        </div>
        <div style={{width:'100%',maxWidth:600,margin:'0 auto'}}>
          {activeTab === 'entry' && (
            <>
              {/* Filter controls */}
              <EntryFilterBar
                categories={categoriesState.categories.map(({ id, name }) => ({ id: id.toString(), name }))}
                entryMonths={entryMonths}
                entryFilterCategory={entryFilterCategory}
                setEntryFilterCategory={setEntryFilterCategory}
                entryFilterMonth={entryFilterMonth}
                setEntryFilterMonth={setEntryFilterMonth}
              />
              {entriesState.entryNotice && (
                <div style={{marginBottom:12, color: entriesState.entryNotice.includes('thành công') ? '#2ecc40' : '#e74c3c', fontWeight:600}}>
                  {entriesState.entryNotice}
                </div>
              )}
              {entriesState.loading && (
                <div style={{marginBottom:12, color:'#888'}}>Đang tải dữ liệu...</div>
              )}
              <EntryManager
                entries={filteredPagedEntries}
                loading={entriesState.loading}
                addEntry={entriesState.addEntry}
                deleteEntry={entriesState.deleteEntry}
                category={entriesState.category}
                setCategory={entriesState.setCategory}
                description={entriesState.description}
                setDescription={entriesState.setDescription}
                amount={entriesState.amount}
                setAmount={entriesState.setAmount}
                date={entriesState.date}
                setDate={entriesState.setDate}
                categories={categoriesState.categories}
                descInputRef={entriesState.descInputRef as React.RefObject<HTMLInputElement>}
              />
              {/* Paging controls */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,margin:'18px 0'}}>
                <button onClick={()=>setPage(1)} disabled={page===1} style={{padding:'6px 12px',borderRadius:6}}>«</button>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'6px 12px',borderRadius:6}}>‹</button>
                <span style={{fontWeight:600}}>Trang</span>
                <select value={page} onChange={e=>setPage(Number(e.target.value))} style={{padding:'6px 10px',borderRadius:6}}>
                  {Array.from({length: filteredTotalPages}, (_,i)=>i+1).map(p=>(<option key={p} value={p}>{p}</option>))}
                </select>
                <span style={{fontWeight:600}}>/ {filteredTotalPages}</span>
                <button onClick={()=>setPage(p=>Math.min(filteredTotalPages,p+1))} disabled={page===filteredTotalPages} style={{padding:'6px 12px',borderRadius:6}}>›</button>
                <button onClick={()=>setPage(filteredTotalPages)} disabled={page===filteredTotalPages} style={{padding:'6px 12px',borderRadius:6}}>»</button>
                <span style={{marginLeft:16}}>Hiển thị</span>
                <select value={itemsPerPage} onChange={e=>setItemsPerPage(Number(e.target.value))} style={{padding:'6px 10px',borderRadius:6}}>
                  {[5,10,20,50,100].map(n=>(<option key={n} value={n}>{n}/trang</option>))}
                </select>
              </div>
            </>
          )}
          {activeTab === 'report' && (
            <ReportView
              entries={[...filteredEntries].sort((a, b) => b.date.localeCompare(a.date))}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              years={years}
              monthsInYear={monthsInYear}
              categories={categoriesState.categories}
            />
          )}
          {activeTab === 'category' && (rolesState.roleName === 'SuperAdmin' || rolesState.roleName.includes('Category')) && (
            <>
              {categoriesState.categoryNotice && (
                <div style={{marginBottom:12, color: categoriesState.categoryNotice.includes('thành công') ? '#2ecc40' : '#e74c3c', fontWeight:600}}>
                  {categoriesState.categoryNotice}
                </div>
              )}
              <CategoryManager
                categories={categoriesState.categories}
                addCategory={categoriesState.addCategory}
                deleteCategory={categoriesState.deleteCategory}
                catName={categoriesState.catName}
                setCatName={categoriesState.setCatName}
                catEditId={categoriesState.catEditId}
                catEditName={categoriesState.catEditName}
                setCatEditName={categoriesState.setCatEditName}
                startEditCategory={categoriesState.startEditCategory}
                saveEditCategory={categoriesState.saveEditCategory}
                cancelEditCategory={categoriesState.cancelEditCategory}
                catInputRef={categoriesState.catInputRef as React.RefObject<HTMLInputElement>}
              />
            </>
          )}
          {activeTab === 'admin' && rolesState.roleName === 'SuperAdmin' && (
            <AdminPanel
              allUsers={rolesState.allUsers}
              rolesList={rolesState.rolesList}
              deleteRoleFromUser={rolesState.deleteRoleFromUser}
              addRoleToUser={rolesState.addRoleToUser}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
