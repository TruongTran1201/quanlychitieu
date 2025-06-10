import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [showHome, setShowHome] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpNotice, setSignUpNotice] = useState('');

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) setShowHome(false);
    else setShowHome(true);
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSignUpNotice('');
    if (isSignUp) {
      const { data: signUpData, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
      else {
        setSignUpNotice('Đăng ký thành công! Hãy kiểm tra email và xác nhận để hoàn tất.');
        // Gán role mặc định cho user mới
        const userId = signUpData?.user?.id;
        if (userId) {
          const { data: roles } = await supabase.from('roles').select('id,name');
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
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowHome(true);
  };

  return {
    user, showHome, authEmail, setAuthEmail, authPassword, setAuthPassword, authError, isSignUp, setIsSignUp, signUpNotice, handleAuth, handleLogout, setUser
  };
}
