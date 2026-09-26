import React, { useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, FileCode, Cloud, HardDrive } from 'lucide-react';
import { sound } from '../services/audio';

export default function AttachMenu({
  isOpen,
  onClose,
  onOpenCam,
  onTriggerImageUpload,
  onTriggerFileUpload,
  onOpenDrive
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="animate-fade-in"
      style={{
        position: 'absolute',
        bottom: '62px',
        left: '12px',
        background: '#161b26',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.2)',
        padding: '6px',
        width: '230px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}
    >
      {/* 1. Take Photo via Camera */}
      <button
        onClick={() => {
          sound.playPop();
          onOpenCam();
          onClose();
        }}
        className="attach-menu-item"
      >
        <div className="attach-menu-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          <Camera size={15} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Take Photo</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Snap diagram or code</div>
        </div>
      </button>

      {/* 2. Upload Picture / Screenshot */}
      <button
        onClick={() => {
          sound.playPop();
          onTriggerImageUpload();
          onClose();
        }}
        className="attach-menu-item"
      >
        <div className="attach-menu-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          <ImageIcon size={15} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Upload Image</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>PNG, JPG, or Screenshot</div>
        </div>
      </button>

      {/* 3. Upload Code / Document */}
      <button
        onClick={() => {
          sound.playPop();
          onTriggerFileUpload();
          onClose();
        }}
        className="attach-menu-item"
      >
        <div className="attach-menu-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
          <FileCode size={15} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Upload Code File</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>.py, .js, .cpp, .java, .txt</div>
        </div>
      </button>

      {/* 4. Google Drive & Cloud */}
      <button
        onClick={() => {
          sound.playPop();
          onOpenDrive();
          onClose();
        }}
        className="attach-menu-item"
      >
        <div className="attach-menu-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
          <Cloud size={15} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Google Drive</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Select from Cloud Drive</div>
        </div>
      </button>
    </div>
  );
}
