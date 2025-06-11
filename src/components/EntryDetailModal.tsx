import React from 'react';

interface EntryDetailModalProps {
  entry: any;
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

const EntryDetailModal: React.FC<EntryDetailModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} title="Đóng">×</button>
        <h3 style={{marginBottom:18, fontWeight:800, color:'#2ecc40', fontSize:22}}>Chi tiết khoản chi</h3>
        <table style={{width:'100%', fontSize:17, color:'#222'}}>
          <tbody>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Danh mục:</td><td style={{padding:'6px 8px'}}>{entry.category}</td></tr>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Mô tả:</td><td style={{padding:'6px 8px'}}>{entry.description}</td></tr>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Số tiền:</td><td style={{padding:'6px 8px'}}>{entry.amount?.toLocaleString()}₫</td></tr>
            <tr><td style={{fontWeight:600, padding:'6px 8px'}}>Ngày:</td><td style={{padding:'6px 8px'}}>{entry.date?.replace('T', ' ').slice(0, 16)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntryDetailModal;
