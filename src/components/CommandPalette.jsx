import React, { useState, useEffect, useRef } from 'react';
import { Search, Flame, Terminal, BarChart3, Layers, BookOpen, Volume2, Trash2, ArrowRight } from 'lucide-react';
import { sound } from '../services/audio';

export default function CommandPalette({
  isOpen,
  onClose,
  onSwitchTab,
  onSwitchPersona,
  onToggleSound,
  onClearChat,
  onLoadProblem
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const actions = [
    { id: 'tab-visualizer', title: 'Open Algorithm Visualizer', category: 'Navigation', icon: <BarChart3 size={15} />, run: () => onSwitchTab('visualizer') },
    { id: 'tab-scratchpad', title: 'Open Code & Big-O Lab', category: 'Navigation', icon: <Terminal size={15} />, run: () => onSwitchTab('scratchpad') },
    { id: 'tab-roadmap', title: 'Open 75 DSA Roadmap', category: 'Navigation', icon: <Layers size={15} />, run: () => onSwitchTab('roadmap') },
    { id: 'tab-complexity', title: 'Open Big-O Complexity Matrix', category: 'Navigation', icon: <BookOpen size={15} />, run: () => onSwitchTab('complexity') },

    { id: 'persona-savage', title: 'Persona: Savage Sensei (Brutal Roasts)', category: 'Persona', icon: <Flame size={15} color="#f43f5e" />, run: () => onSwitchPersona('SAVAGE') },
    { id: 'persona-interviewer', title: 'Persona: FAANG Interviewer (Big-O & Edge Cases)', category: 'Persona', icon: <Flame size={15} color="#a855f7" />, run: () => onSwitchPersona('INTERVIEWER') },
    { id: 'persona-mentor', title: 'Persona: Gentle Architect (Intuitive Analogies)', category: 'Persona', icon: <Flame size={15} color="#10b981" />, run: () => onSwitchPersona('MENTOR') },
    { id: 'persona-speedrun', title: 'Persona: Algo Speedrunner (TL;DR Solutions)', category: 'Persona', icon: <Flame size={15} color="#f59e0b" />, run: () => onSwitchPersona('SPEEDRUN') },

    { id: 'act-sound', title: 'Toggle Sound Effects FX', category: 'Preferences', icon: <Volume2 size={15} />, run: onToggleSound },
    { id: 'act-clear', title: 'Clear Chat Messages', category: 'Actions', icon: <Trash2 size={15} />, run: onClearChat }
  ];

  const filtered = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          sound.playPop();
          filtered[selectedIndex].run();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#0e1626',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px var(--accent-primary-glow)',
          overflow: 'hidden'
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={18} color="var(--accent-primary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search actions..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '15px',
              fontFamily: 'var(--font-body)'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
              No matching actions found
            </div>
          ) : (
            filtered.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    sound.playPop();
                    action.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {action.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: isSelected ? '#fff' : 'var(--text-main)' }}>
                        {action.title}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        {action.category}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight size={14} color="var(--accent-primary)" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-dim)',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span>Press <strong>↵</strong> to select</span>
        </div>
      </div>
    </div>
  );
}
