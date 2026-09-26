import React from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Settings, Command, Cpu, Terminal } from 'lucide-react';
import { PERSONAS } from '../services/gemini';
import { sound } from '../services/audio';

export default function Header({
  activePersona,
  setActivePersona,
  soundEnabled,
  setSoundEnabled,
  onOpenSettings,
  onOpenCommandPalette,
  activeTab,
  setActiveTab
}) {
  const persona = PERSONAS[activePersona] || PERSONAS.SAVAGE;

  const handleSoundToggle = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  return (
    <header className="glass-panel" style={{
      margin: '12px 20px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
      borderRadius: 'var(--radius-xl)'
    }}>
      {/* Brand & Persona Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
        }}>
          <Flame size={24} color="#fff" className={activePersona === 'SAVAGE' ? 'flame-effect' : ''} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              AlgoSensei <span style={{ color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 600 }}>AI DSA STUDIO</span>
            </h1>
            <span className={`badge ${persona.badgeClass}`}>
              {persona.icon} {persona.name}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            {persona.tagline}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '4px'
      }}>
        {[
          { id: 'visualizer', label: 'Algorithm Visualizer', icon: '✨' },
          { id: 'scratchpad', label: 'Code & Big-O Lab', icon: '💻' },
          { id: 'roadmap', label: '75 DSA Roadmap', icon: '🗺️' },
          { id: 'complexity', label: 'Big-O Matrix', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => {
              sound.playPop();
              setActiveTab(tab.id);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 0 12px var(--accent-primary-glow)' : 'none'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Persona Selector Dropdown */}
        <select
          value={activePersona}
          onChange={(e) => {
            sound.playPop();
            setActivePersona(e.target.value);
          }}
          className="glass-input"
          style={{
            padding: '7px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            background: 'var(--bg-surface-elevated)'
          }}
          title="Select AI Mentor Persona"
        >
          {Object.entries(PERSONAS).map(([key, p]) => (
            <option key={key} value={key} style={{ background: '#111827', color: '#fff' }}>
              {p.icon} {p.name}
            </option>
          ))}
        </select>

        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            sound.playPop();
            onOpenCommandPalette();
          }}
          className="btn btn-ghost"
          style={{ padding: '7px 12px', fontSize: '12px' }}
          title="Command Palette (Ctrl + K)"
        >
          <Command size={14} />
          <span style={{ opacity: 0.8 }}>⌘K</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleSoundToggle}
          className="btn btn-ghost"
          style={{ padding: '7px 10px', fontSize: '13px' }}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 size={16} color="var(--accent-emerald)" /> : <VolumeX size={16} color="var(--text-dim)" />}
        </button>

        {/* Settings Modal Button */}
        <button
          onClick={() => {
            sound.playPop();
            onOpenSettings();
          }}
          className="btn btn-ghost"
          style={{ padding: '7px 10px' }}
          title="Configure API Key & Models"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
