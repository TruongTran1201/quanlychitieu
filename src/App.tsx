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

  // Đồng bộ tab với path trên trình duyệt
  useEffect(() => {
    // Đọc path khi load
    const path = window.location.pathname.replace(/^\//, '');
    if (['entry', 'report', 'category', 'admin'].includes(path)) {
      setActiveTab(path as any);
    }
  }, []);
  useEffect(() => {
    // Đổi path khi đổi tab
    window.history.pushState({}, '', '/' + activeTab);
  }, [activeTab]);

  // Helper kiểm tra quyền
  const hasRole = (role: string) => rolesState.roleName.split(',').includes(role) || rolesState.roleName === 'SuperAdmin';

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
    <div className="app" style={{ minHeight: '100vh', background: '#f6f8fa', fontFamily: 'Segoe UI,Roboto,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 900, minWidth: 0, margin: '0 auto', padding: '48px 8px', position: 'relative', boxSizing: 'border-box' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <select
            id="main-menu"
            value={activeTab}
            onChange={e => setActiveTab(e.target.value as 'entry' | 'report' | 'category' | 'admin')}
            style={{ padding: 14, borderRadius: 8, border: 'none', fontSize: 18, background: '#fff', color: '#222', fontWeight: 600, boxShadow: '0 2px 8px #0001', outline: 'none', cursor: 'pointer', minWidth: 160 }}
          >
            <option value="entry">📝 Nhập chi tiêu</option>
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
            <EntryManager
              entries={filteredEntries} // Sửa lại: truyền toàn bộ danh sách đã lọc, không slice ở ngoài
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
              entryFilterMonth={entryFilterMonth}
              setEntryFilterMonth={setEntryFilterMonth}
              entryMonths={entryMonths}
            />
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
        </div>
      </div>
    </div>
  )
}

export default App
