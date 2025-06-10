import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getNowDatetimeLocal } from '../utils/entryUtils';
import type { Entry } from '../utils/entryUtils';

export function useEntries(user: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => getNowDatetimeLocal());
  const [entryNotice, setEntryNotice] = useState('');
  const descInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!error && data) {
        setEntries(data as Entry[]);
      }
      setLoading(false);
    })();
  }, [user]);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount.trim() || isNaN(Number(amount)) || !user) {
      setEntryNotice('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      if (descInputRef.current) descInputRef.current.focus();
      return;
    }
    setEntryNotice('');
    let entryDate = date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date) ? date : getNowDatetimeLocal();
    const entry = {
      user_id: user.id,
      category,
      description: description.trim(),
      amount: Number(amount),
      date: entryDate
    };
    const { data, error } = await supabase
      .from('entries')
      .insert([entry])
      .select();
    if (!error && data && data[0]) {
      setEntries([data[0] as Entry, ...entries]);
      setDescription('');
      setAmount('');
      setDate(getNowDatetimeLocal());
      setEntryNotice('Thêm khoản chi thành công!');
      if (descInputRef.current) descInputRef.current.focus();
    } else {
      setEntryNotice('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  const deleteEntry = async (id: number) => {
    if (!user) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) return;
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      setEntries(entries.filter(entry => entry.id !== id));
      setEntryNotice('Đã xóa khoản chi!');
    }
  };

  const updateEntry = async (id: number, newDesc: string, newAmount: number, newDate: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('entries')
      .update({ description: newDesc, amount: newAmount, date: newDate })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (!error && data && data[0]) {
      setEntries(entries.map(e => e.id === id ? { ...e, description: newDesc, amount: newAmount, date: newDate } : e));
    }
  };

  (window as any).updateEntry = updateEntry;

  return {
    entries, setEntries, loading, category, setCategory, description, setDescription, amount, setAmount, date, setDate, entryNotice, setEntryNotice, addEntry, deleteEntry, updateEntry, descInputRef
  };
}
