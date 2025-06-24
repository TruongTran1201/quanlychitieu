import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './hooks/useAuth';
import { useEntries } from './hooks/useEntries';
import { useCategories } from './hooks/useCategories';
import { useRoles } from './hooks/useRoles';
import CategoryManager from './components/CategoryManager';
import EntryManager from './components/EntryManager';
import ReportView from './components/ReportView';
import AdminPanel from './components/AdminPanel';
import MonthlyStats from './components/MonthlyStats';
import ExportExcel from './components/ExportCSV';
import AdvancedFilterBar from './components/AdvancedFilterBar';
import PieCategoryChart from './components/PieCategoryChart';

function App() {
  // Auth
  const auth = useAuth();
  // Tab state
  const [activeTab, setActiveTab] = useState<'category' | 'entry' | 'report' | 'admin' | 'stats'>('entry');
  // Entries
  const entriesState = useEntries(auth.user);
  // Categories
  const categoriesState = useCategories(auth.user, entriesState.category, entriesState.setCategory);
  // Roles
  const rolesState = useRoles(auth.user, activeTab);

  // Filter/search state for EntryManager
  const [entryFilterCategory, setEntryFilterCategory] = useState<string>('all');

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

  // State cho lọc nâng cao
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  // const [fromDate, setFromDate] = useState('');
  // const [toDate, setToDate] = useState('');

  // Lọc nâng cao cho entries
  const advancedFilteredEntries = filteredEntries.filter(e => {
    const matchSearch = !search || (e.description?.toLowerCase().includes(search.toLowerCase()));
    const matchMin = !minAmount || e.amount >= Number(minAmount);
    const matchMax = !maxAmount || e.amount <= Number(maxAmount);
    // Bỏ lọc theo fromDate, toDate
    return matchSearch && matchMin && matchMax;
  });

  // Helper kiểm tra quyền
  const hasRole = (role: string) => rolesState.roleName.split(',').includes(role) || rolesState.roleName === 'SuperAdmin';

  // State cho dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  if (auth.showHome) {
    return (
      <div className="homepage" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#222' }}>
        <h1 style={{ fontSize: 48, marginBottom: 16, color: '#2ecc40', fontWeight: 900, letterSpacing: 1 }}>Quản lý chi tiêu</h1>
        <p style={{ fontSize: 22, marginBottom: 40, color: '#fff', fontWeight: 400 }}>Quản lý chi tiêu cá nhân</p>
        <div style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 32px #0002', minWidth: 340 }}>
          <form className="auth-form" onSubmit={auth.handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={auth.authEmail}
              onChange={e => auth.setAuthEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 14, marginBottom: 16, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={auth.authPassword}
              onChange={e => auth.setAuthPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 14, marginBottom: 16, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
            />
            <div className="auth-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
              <button type="submit" className="auth-btn" style={{ padding: '12px 0', borderRadius: 8, background: '#2ecc40', color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{auth.isSignUp ? 'Đăng ký' : 'Đăng nhập'}</button>
              <button type="button" className="switch-auth-btn" style={{ background: 'none', border: 'none', color: '#2ecc40', textDecoration: 'underline', fontSize: 15 }} onClick={() => auth.setIsSignUp(!auth.isSignUp)}>
                {auth.isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
              </button>
            </div>
            {auth.authError && <div className="auth-error" style={{ color: '#e74c3c', marginBottom: 8 }}>{auth.authError}</div>}
            {auth.signUpNotice && <div className="sign-up-notice" style={{ color: '#2ecc40', marginBottom: 8 }}>{auth.signUpNotice}</div>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`app${darkMode ? ' dark-mode' : ''}`} style={{ minHeight: '100vh', background: darkMode ? '#181a1b' : '#f6f8fa', fontFamily: 'Segoe UI,Roboto,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 900, minWidth: 0, margin: '0 auto', padding: '48px 8px', position: 'relative', boxSizing: 'border-box' }}>
        {/* Dark mode toggle */}
        <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 3, padding: 8 }}>
          <button onClick={() => setDarkMode(d => !d)} style={{ background: 'none', border: 'none', color: darkMode ? '#2ecc40' : '#222', fontSize: 22, cursor: 'pointer', fontWeight: 700 }} title="Chuyển chế độ sáng/tối">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
        {/* User info top right */}
        <div className="user-info-bar">
          {auth.user && (
            <>
              <span className="user-email" style={{ color: '#222', fontWeight: 600 }}>{auth.user.email}</span>
              <button className="logout-btn" onClick={auth.handleLogout}>Đăng xuất</button>
            </>
          )}
        </div>
        <h2 className="main-title">Quản lý chi tiêu</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <select
            id="main-menu"
            value={activeTab}
            onChange={e => setActiveTab(e.target.value as any)}
            style={{ padding: 14, borderRadius: 8, border: 'none', fontSize: 18, background: '#fff', color: '#222', fontWeight: 600, boxShadow: '0 2px 8px #0001', outline: 'none', cursor: 'pointer', minWidth: 160 }}
          >
            <option value="entry">📝 Nhập chi tiêu</option>
            <option value="stats">📈 Thống kê</option>
            {hasRole('Report') && (
              <option value="report">📊 Báo cáo</option>
            )}
            {hasRole('SuperAdmin') && (
              <option value="admin">⚙️ Quản trị</option>
            )}
            {hasRole('Category') && (
              <option value="category">📁 Danh mục</option>
            )}
          </select>
        </div>
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          {activeTab === 'entry' && (
            <>
              <ExportExcel entries={advancedFilteredEntries} />
              <EntryManager
                entries={advancedFilteredEntries}
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
                entryFilterCategory={entryFilterCategory}
                setEntryFilterCategory={setEntryFilterCategory}
              />
              <AdvancedFilterBar
                search={search} setSearch={setSearch}
                minAmount={minAmount} setMinAmount={setMinAmount}
                maxAmount={maxAmount} setMaxAmount={setMaxAmount}
              />
            </>
          )}
          {activeTab === 'report' && hasRole('Report') && (
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
          {activeTab === 'report' && !hasRole('Report') && (
            <div style={{ color: '#e74c3c', textAlign: 'center', margin: '32px 0', fontWeight: 700, fontSize: 18 }}>Bạn không có quyền truy cập mục này.</div>
          )}
          {activeTab === 'category' && hasRole('Category') && (
            <CategoryManager
              categories={categoriesState.categories}
              addCategory={categoriesState.addCategory}
              deleteCategory={categoriesState.deleteCategory}
              catName={categoriesState.catName}
              setCatName={categoriesState.setCatName}
              catGroup={categoriesState.catGroup}
              setCatGroup={categoriesState.setCatGroup}
              catEditId={categoriesState.catEditId}
              catEditName={categoriesState.catEditName}
              setCatEditName={categoriesState.setCatEditName}
              catEditGroup={categoriesState.catEditGroup}
              setCatEditGroup={categoriesState.setCatEditGroup}
              startEditCategory={categoriesState.startEditCategory}
              saveEditCategory={categoriesState.saveEditCategory}
              cancelEditCategory={() => {
                categoriesState.setCatEditId(null);
                categoriesState.setCatEditName('');
                categoriesState.setCatEditGroup('');
              }}
              entries={entriesState.entries}
            />
          )}
          {activeTab === 'category' && !hasRole('Category') && (
            <div style={{ color: '#e74c3c', textAlign: 'center', margin: '32px 0', fontWeight: 700, fontSize: 18 }}>Bạn không có quyền truy cập mục này.</div>
          )}
          {activeTab === 'admin' && hasRole('SuperAdmin') && (
            <AdminPanel
              allUsers={rolesState.allUsers}
              rolesList={rolesState.rolesList}
              deleteRoleFromUser={rolesState.deleteRoleFromUser}
              addRoleToUser={rolesState.addRoleToUser}
            />
          )}
          {activeTab === 'admin' && !hasRole('SuperAdmin') && (
            <div style={{ color: '#e74c3c', textAlign: 'center', margin: '32px 0', fontWeight: 700, fontSize: 18 }}>Bạn không có quyền truy cập mục này.</div>
          )}
          {activeTab === 'stats' && (
            <div style={{marginBottom:24}}>
              <label htmlFor="stats-year" style={{fontWeight:600,marginRight:8}}>Năm:</label>
              <select id="stats-year" value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))} style={{padding:8,borderRadius:6,minWidth:80}}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <MonthlyStats entries={entriesState.entries} year={selectedYear} />
              <PieCategoryChart entries={entriesState.entries.filter(e => new Date(e.date).getFullYear() === selectedYear)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
