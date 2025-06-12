import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export function useCategories(user: any, category: string, setCategory: (v: string) => void) {
  // Thêm group vào type
  const [categories, setCategories] = useState<{id: number, name: string, group: string, user_id: string}[]>([]);
  const [catName, setCatName] = useState('');
  const [catGroup, setCatGroup] = useState('');
  const [catEditId, setCatEditId] = useState<number|null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [catEditGroup, setCatEditGroup] = useState('');
  const [categoryNotice, setCategoryNotice] = useState('');
  const catInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) {
        setCategories(data);
        if (!data.find((c: any) => c.name === category)) {
          setCategory(data[0]?.name || '');
        }
      }
    })();
  }, [user]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !user) {
      setCategoryNotice('Vui lòng nhập tên danh mục!');
      if (catInputRef.current) catInputRef.current.focus();
      return;
    }
    setCategoryNotice('');
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: catName.trim(), group: catGroup.trim(), user_id: user.id }])
      .select();
    if (!error && data && data[0]) {
      setCategories([...categories, data[0]]);
      setCatName('');
      setCatGroup('');
      setCategoryNotice('Thêm danh mục thành công!');
      if (catInputRef.current) catInputRef.current.focus();
    } else {
      setCategoryNotice('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!user) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
      setCategoryNotice('Đã xóa danh mục!');
      if (categories.find(c => c.id === id)?.name === category) {
        setCategory(categories.filter(c => c.id !== id)[0]?.name || '');
      }
    }
  };

  const startEditCategory = (id: number, name: string, group: string) => {
    setCatEditId(id);
    setCatEditName(name);
    setCatEditGroup(group);
  };
  const saveEditCategory = async () => {
    if (!catEditName.trim() || !user || catEditId === null) return;
    const { data, error } = await supabase
      .from('categories')
      .update({ name: catEditName.trim(), group: catEditGroup.trim() })
      .eq('id', catEditId)
      .eq('user_id', user.id)
      .select();
    if (!error && data && data[0]) {
      setCategories(categories.map(c => c.id === catEditId ? data[0] : c));
      setCatEditId(null);
      setCatEditName('');
      setCatEditGroup('');
      setCategoryNotice('Cập nhật danh mục thành công!');
    } else {
      setCategoryNotice('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return {
    categories,
    catName,
    setCatName,
    catGroup,
    setCatGroup,
    catEditId,
    setCatEditId,
    catEditName,
    setCatEditName,
    catEditGroup,
    setCatEditGroup,
    categoryNotice,
    addCategory,
    deleteCategory,
    startEditCategory,
    saveEditCategory,
  };
}
