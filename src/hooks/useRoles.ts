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
        if (roleNames.includes('SuperAdmin')) {
          const { data: users } = await supabase
            .from('user_roles')
            .select('id, user_id, role_id, roles(name)');
          if (users && users.length > 0) {
            const userIds = Array.from(new Set(users.map((u: any) => u.user_id)));
            const { data: userRefs } = await supabase
              .from('users_ref')
              .select('id, email')
              .in('id', userIds);
            const usersWithEmail = users.map((u: any) => ({
              ...u,
              user_email: userRefs?.find((ref: any) => ref.id === u.user_id)?.email || u.user_id
            }));
            setAllUsers(usersWithEmail);
          } else {
            setAllUsers([]);
          }
        }
      } else {
        setRoleName('');
      }
    })();
  }, [user, activeTab]);

  const addRoleToUser = async (userId: string, roleId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role_id: roleId }])
      .select();
    if (!error && data) {
      if (activeTab === 'admin') {
        setAllUsers(allUsers.map(u => u.user_id === userId ? { ...u, role_id: roleId } : u));
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
        setAllUsers(allUsers.map(u => u.user_id === userId ? { ...u, role_id: null } : u));
      }
    }
  };

  return {
    roleName, allUsers, rolesList, addRoleToUser, deleteRoleFromUser, setRoleName, setAllUsers
  };
}
