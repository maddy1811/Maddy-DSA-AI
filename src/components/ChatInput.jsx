import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Loader2, Plus, X, Image as ImageIcon, FileCode, Check } from 'lucide-react';
import AttachMenu from './AttachMenu';
import { sound } from '../services/audio';

export default function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  onOpenCam,
  onOpenDrive
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    sound.playAttach();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64Data = dataUrl.split(',')[1];
      if (typeof onAddAttachment === 'function') {
        onAddAttachment({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name || 'Pasted_Screenshot.png',
          type: 'image',
          previewUrl: dataUrl,
          base64Data,
          mimeType: file.type || 'image/png',
          size: `${Math.round(file.size / 1024)} KB`
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const processTextFile = (file) => {
    if (!file) return;
    sound.playAttach();
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof onAddAttachment === 'function') {
        onAddAttachment({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          type: 'file',
          textContent: event.target.result,
          mimeType: file.type || 'text/plain',
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
      }
    };
    reader.readAsText(file);
  };

  // Support pasting screenshots directly from clipboard (Ctrl + V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleImageSelected = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => processImageFile(file));
    e.target.value = '';
  };

  const handleFileSelected = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => processTextFile(file));
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        processTextFile(file);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (value.trim() || attachments.length > 0)) {
        onSend();
      }
    }
  };

  return (
    <div className="input-dock">
      {/* Hidden native file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelected}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.txt,.md,.json,.csv"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      <div
        className={`input-container ${isDragging ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          borderColor: isDragging ? 'var(--accent-primary)' : undefined,
          boxShadow: isDragging ? '0 0 20px rgba(59, 130, 246, 0.4)' : undefined,
          transition: 'all 0.2s ease'
        }}
      >
        {/* Attach Dropdown Menu */}
        <AttachMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenCam={onOpenCam}
          onTriggerImageUpload={() => imageInputRef.current?.click()}
          onTriggerFileUpload={() => fileInputRef.current?.click()}
          onOpenDrive={onOpenDrive}
        />

        {/* The + Button */}
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            setIsMenuOpen(prev => !prev);
          }}
          className="attach-btn"
          style={{
            transform: isMenuOpen ? 'rotate(45deg)' : 'none',
            background: isMenuOpen ? 'var(--bg-surface-hover)' : 'rgba(255, 255, 255, 0.06)'
          }}
          title="Add photo, upload code file, or select from Drive"
        >
          <Plus size={18} />
        </button>

        {/* Center column: Attachment Tray + Textarea */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Attachment Tray */}
          {attachments.length > 0 && (
            <div className="attachment-tray">
              {attachments.map(att => (
                <div key={att.id} className="attachment-chip" title={`${att.name} (${att.size || 'Ready'})`}>
                  {att.type === 'image' ? (
                    <div style={{ position: 'relative', width: '26px', height: '26px', flexShrink: 0 }}>
                      <img
                        src={att.previewUrl}
                        alt={att.name}
                        className="attachment-thumb"
                        style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  ) : (
                    <FileCode size={14} color="var(--accent-primary)" />
                  )}
                  <span className="attachment-name">{att.name}</span>
                  {att.size && (
                    <span style={{ fontSize: '10px', opacity: 0.65, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '4px' }}>
                      {att.size}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      onRemoveAttachment(att.id);
                    }}
                    className="attachment-remove-btn"
                    title="Remove attachment"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              attachments.length > 0
                ? "Ask DSA question about this image/file (or hit Enter)..."
                : "Ask any DSA problem or attach diagrams/code with +..."
            }
            className="input-textarea"
            autoFocus
          />
        </div>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={(!value.trim() && attachments.length === 0) || isLoading}
          className="send-btn"
          title="Send message (Enter)"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>

      <div className="input-caption">
        DSA Instructor only answers Data Structure & Algorithm queries. Off-topic questions are strictly rejected.
      </div>
    </div>
  );
}
