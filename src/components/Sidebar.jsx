import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, ChevronLeft } from 'lucide-react';

export default function Sidebar({
  isOpen, onToggle,
  chats, activeChatId,
  onSelectChat, onNewChat, onDeleteChat, onOpenSettings
}) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* M logo badge */}
          <div className="maddy-logo-badge">M</div>
          <span className="maddy-wordmark">Maddy AI</span>
        </div>

        <button onClick={onToggle} className="btn-icon" title="Collapse sidebar">
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* ── New Chat ── */}
      <div style={{ padding: '12px 14px' }}>
        <button onClick={onNewChat} className="new-chat-btn">
          <Plus size={16} />
          <span>New chat</span>
        </button>
      </div>

      {/* ── History List ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-dim)',
          padding: '8px 8px 6px 8px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Recent
        </div>

        {chats.map(chat => {
          const isActive = chat.id === activeChatId;
          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: '10px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(66,133,244,0.18) 0%, rgba(139,92,246,0.12) 100%)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(66,133,244,0.3)'
                  : '1px solid transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13.5px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <MessageSquare
                  size={14}
                  style={{ flexShrink: 0, opacity: isActive ? 1 : 0.55, color: isActive ? '#60a5fa' : 'inherit' }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '158px' }}>
                  {chat.title || 'DSA Conversation'}
                </span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="btn-icon"
                style={{ width: '22px', height: '22px', opacity: 0.55, flexShrink: 0 }}
                title="Delete chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={onOpenSettings}
          className="btn-icon"
          style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '0 10px', height: '38px' }}
        >
          <Settings size={16} />
          <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Model &amp; Settings</span>
        </button>
      </div>
    </aside>
  );
}
