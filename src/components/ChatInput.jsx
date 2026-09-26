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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

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

  const processImageFile = (file) => {
    sound.playAttach();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64Data = dataUrl.split(',')[1];
      onAddAttachment({
        id: `img-${Date.now()}`,
        name: file.name || 'Pasted_Screenshot.png',
        type: 'image',
        previewUrl: dataUrl,
        base64Data,
        mimeType: file.type || 'image/png',
        size: `${Math.round(file.size / 1024)} KB`
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handleFileSelected = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      sound.playAttach();
      const reader = new FileReader();
      reader.onload = (event) => {
        onAddAttachment({
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: 'file',
          textContent: event.target.result,
          mimeType: file.type || 'text/plain',
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
      };
      reader.readAsText(file);
    });
    e.target.value = '';
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

      <div className="input-container" style={{ position: 'relative' }}>
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
                <div key={att.id} className="attachment-chip">
                  {att.type === 'image' ? (
                    <img src={att.previewUrl} alt={att.name} className="attachment-thumb" />
                  ) : (
                    <FileCode size={14} color="var(--accent-primary)" />
                  )}
                  <span className="attachment-name">{att.name}</span>
                  <button
                    onClick={() => {
                      sound.playPop();
                      onRemoveAttachment(att.id);
                    }}
                    className="attachment-remove-btn"
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
