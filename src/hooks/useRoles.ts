import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useRoles(user: any, activeTab: string) {
  const [roleName, setRoleName] = useState<string>('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<{id: string, name: string, description: string}[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('roles').select('id, name, description');
      setRolesList(data || []);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id);
      if (!error && data) {
        const roleNames: string[] = data
          .map((r: any) => {
            if (Array.isArray(r.roles)) return r.roles[0]?.name;
            return r.roles?.name;
          })
          .filter(Boolean);
        if (roleNames.includes('SuperAdmin')) {
          setRoleName('SuperAdmin');
        } else if (roleNames.length > 0) {
          setRoleName(roleNames.join(','));
        } else {
          setRoleName('');
        }
      } else {
        setRoleName('');
      }
    })();
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'admin') {
      (async () => {
        // Lấy tất cả user từ bảng users_ref
        const { data: userRefs } = await supabase
          .from('users_ref')
          .select('id, email');
        // Lấy tất cả user_roles
        const { data: users } = await supabase
          .from('user_roles')
          .select('id, user_id, role_id, roles(name)');
        // Gộp user_roles với userRefs để luôn có đủ user
        let usersWithEmail: any[] = [];
        if (userRefs) {
          usersWithEmail = userRefs.map(ref => {
            // Tìm tất cả role của user này
            const userRoles = (users || []).filter(u => u.user_id === ref.id);
            if (userRoles.length === 0) {
              // User chưa có quyền nào
              return {
                user_id: ref.id,
                user_email: ref.email,
                role_id: null,
                roles: null
              };
            } else {
              // Trả về từng quyền một (giữ nguyên như cũ)
              return userRoles.map(u => ({
                ...u,
                user_email: ref.email
              }));
            }
          }).flat();
        }
        setAllUsers(usersWithEmail);
      })();
    }
  }, [user, activeTab]);

  const addRoleToUser = async (userId: string, roleId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role_id: roleId }])
      .select();
    if (!error && data) {
      if (activeTab === 'admin') {
        // Sau khi thêm quyền, refetch lại danh sách user
        const { data: userRefs } = await supabase
          .from('users_ref')
          .select('id, email');
        const { data: users } = await supabase
          .from('user_roles')
          .select('id, user_id, role_id, roles(name)');
        let usersWithEmail: any[] = [];
        if (userRefs) {
          usersWithEmail = userRefs.map(ref => {
            const userRoles = (users || []).filter(u => u.user_id === ref.id);
            if (userRoles.length === 0) {
              return {
                user_id: ref.id,
                user_email: ref.email,
                role_id: null,
                roles: null
              };
            } else {
              return userRoles.map(u => ({
                ...u,
                user_email: ref.email
              }));
            }
          }).flat();
        }
        setAllUsers(usersWithEmail);
      }
    }
  };

  const deleteRoleFromUser = async (userId: string, roleId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);
    if (!error) {
      if (activeTab === 'admin') {
        // Sau khi xóa quyền, refetch lại danh sách user
        const { data: userRefs } = await supabase
          .from('users_ref')
          .select('id, email');
        const { data: users } = await supabase
          .from('user_roles')
          .select('id, user_id, role_id, roles(name)');
        let usersWithEmail: any[] = [];
        if (userRefs) {
          usersWithEmail = userRefs.map(ref => {
            const userRoles = (users || []).filter(u => u.user_id === ref.id);
            if (userRoles.length === 0) {
              return {
                user_id: ref.id,
                user_email: ref.email,
                role_id: null,
                roles: null
              };
            } else {
              return userRoles.map(u => ({
                ...u,
                user_email: ref.email
              }));
            }
          }).flat();
        }
        setAllUsers(usersWithEmail);
      }
    }
  };

  return {
    roleName, allUsers, rolesList, addRoleToUser, deleteRoleFromUser, setRoleName, setAllUsers
  };
}
