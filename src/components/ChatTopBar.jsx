import React from 'react';
import { Menu, Plus, Settings, Trash2 } from 'lucide-react';
import { setSelectedModel } from '../services/gemini';

const AVAILABLE_MODELS = [
  { id: 'gemini-3.5-flash',  label: 'Gemini 3.5 Flash' },
  { id: 'gemini-flash-latest', label: 'Gemini Flash Latest' },
  { id: 'gemini-3.7-flash',  label: 'Gemini 3.7 Flash' },
  { id: 'gemini-3.8-flash',  label: 'Gemini 3.8 Flash' }
];

export default function ChatTopBar({
  isSidebarOpen, onToggleSidebar,
  onNewChat, onClearChat, onOpenSettings,
  currentModel, onModelChange
}) {
  return (
    <header className="chat-topbar">
      {/* Left: hamburger + brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!isSidebarOpen && (
          <button onClick={onToggleSidebar} className="btn-icon" title="Open sidebar">
            <Menu size={18} />
          </button>
        )}

        {/* M logo + gradient wordmark */}
        <div className="topbar-brand">
          <div className="topbar-logo">M</div>
          <span className="topbar-name">Maddy AI</span>
        </div>
      </div>

      {/* Center: Model pill */}
      <div className="model-pill">
        <div className="model-dot" />
        <select
          value={currentModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            onModelChange(e.target.value);
          }}
          title="Switch model"
        >
          {AVAILABLE_MODELS.map(m => (
            <option key={m.id} value={m.id} style={{ background: '#131720', color: '#e8eaf0' }}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={onNewChat}   className="btn-icon" title="New chat"><Plus size={18} /></button>
        <button onClick={onClearChat} className="btn-icon" title="Clear messages"><Trash2 size={16} /></button>
        <button onClick={onOpenSettings} className="btn-icon" title="Settings"><Settings size={16} /></button>
      </div>
    </header>
  );
}
