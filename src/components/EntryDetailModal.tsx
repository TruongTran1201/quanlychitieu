import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

interface EntryDetailModalProps {
  entry: any;
  images?: { url: string; id?: string }[];
  onClose: () => void;
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.25)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'fadeIn 0.2s',
};
const contentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '32px 28px',
  minWidth: 320,
  maxWidth: '90vw',
  boxShadow: '0 4px 32px #0002',
  color: '#222',
  position: 'relative',
  outline: 'none',
};
const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  background: 'none',
  border: 'none',
  fontSize: 22,
  color: '#e74c3c',
  cursor: 'pointer',
};
const previewImgStyle: React.CSSProperties = {
  maxWidth: '90vw',
  maxHeight: '80vh',
  borderRadius: 10,
  boxShadow: '0 2px 16px #0005',
  background: '#fff',
  zIndex: 1100,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
};

const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, images = [], onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState(images);
  const [deletedImages, setDeletedImages] = useState<{ url: string; id?: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalImages(images);
    setDeletedImages([]);
  }, [images, entry]);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    contentRef.current?.focus();
  }, []);

  // Xử lý xóa ảnh tạm thời
  const handleRemoveImage = (img: { url: string; id?: string }) => {
    setLocalImages(localImages.filter(i => i.url !== img.url));
    setDeletedImages([...deletedImages, img]);
  };

  // Hàm lưu xóa ảnh
  const handleSaveDelete = async () => {
    setSaving(true);
    for (const img of deletedImages) {
      // Xóa vật lý file trên bucket
      try {
        // Lấy path từ public URL
        const url = img.url;
        const pathMatch = url.match(/\/entry-images\/(.+)$/);
        if (pathMatch) {
          const filePath = pathMatch[1];
          await supabase.storage.from('entry-images').remove([filePath]);
        }
      } catch {}
      // Xóa metadata khỏi bảng entry_images
      if (img.id) {
        await supabase.from('entry_images').delete().eq('id', img.id);
      } else {
        await supabase.from('entry_images').delete().eq('url', img.url);
      }
    }
    setSaving(false);
    setDeletedImages([]);
    onClose();
  };

  if (!entry) return null;
  return (
    <div style={modalStyle} onClick={onClose} aria-label="Overlay" role="dialog" aria-modal="true">
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      <div
        style={contentStyle}
        ref={contentRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        aria-label="Chi tiết khoản chi"
      >
        <button style={closeBtnStyle} onClick={onClose} title="Đóng" aria-label="Đóng">×</button>
        <h3 style={{marginBottom:18, fontWeight:800, color:'#2ecc40', fontSize:22}}>Chi tiết khoản chi</h3>
        <table style={{width:'100%', fontSize:17, color:'#222', marginBottom: localImages.length > 0 ? 18 : 0}}>
          <tbody>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Danh mục:</td><td style={{padding:'6px 8px'}}>{entry.category}</td></tr>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Mô tả:</td><td style={{padding:'6px 8px'}}>{entry.description}</td></tr>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Số tiền:</td><td style={{padding:'6px 8px'}}>{entry.amount?.toLocaleString()}₫</td></tr>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Ngày:</td><td style={{padding:'6px 8px'}}>{entry.date?.replace('T', ' ').slice(0, 16)}</td></tr>
          </tbody>
        </table>
        {localImages.length > 0 && (
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:8}}>
            {localImages.map(img => (
              <div key={img.url} style={{position:'relative',display:'inline-block'}}>
                <img
                  src={img.url}
                  alt="Ảnh khoản chi"
                  style={{width:80,height:80,objectFit:'cover',borderRadius:8,border:'1px solid #eee',cursor:'pointer'}}
                  onClick={() => setPreviewUrl(img.url)}
                  tabIndex={0}
                  aria-label="Xem ảnh lớn"
                />
                <button
                  style={{position:'absolute',top:2,right:2,background:'#fff',border:'none',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px #0002',cursor:'pointer',padding:0}}
                  onClick={e => {e.stopPropagation(); handleRemoveImage(img);}}
                  title="Xóa ảnh"
                  aria-label="Xóa ảnh"
                >
                  <span style={{color:'#e74c3c',fontWeight:900,fontSize:18,lineHeight:1}}>×</span>
                </button>
              </div>
            ))}
          </div>
        )}
        {previewUrl && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.7)',zIndex:1100}} onClick={()=>setPreviewUrl(null)}>
            <img src={previewUrl} alt="Xem ảnh lớn" style={previewImgStyle} />
          </div>
        )}
        {deletedImages.length > 0 && (
          <button
            style={{marginTop:16,padding:'10px 18px',borderRadius:8,background:'#e74c3c',color:'#fff',border:'none',fontWeight:700,fontSize:16,minWidth:90}}
            onClick={handleSaveDelete}
            disabled={saving}
          >{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
        )}
      </div>
    </div>
  );
};

export default EntryDetailModal;
