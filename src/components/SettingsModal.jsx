import React, { useState } from 'react';
import { X, Key, Check, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { getApiKey, setApiKey, getSelectedModel, setSelectedModel, sendChatMessage } from '../services/gemini';

const AVAILABLE_MODELS = [
  { id: 'gemini-3.5-flash',   name: 'Gemini 3.5 Flash (Recommended)' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest' },
  { id: 'gemini-3.7-flash',   name: 'Gemini 3.7 Flash' },
  { id: 'gemini-3.8-flash',   name: 'Gemini 3.8 Flash' }
];

export default function SettingsModal({ isOpen, onClose }) {
  const [keyInput,    setKeyInput]    = useState(getApiKey());
  const [modelInput,  setModelInput]  = useState(getSelectedModel());
  const [showKey,     setShowKey]     = useState(false);
  const [isTesting,   setIsTesting]   = useState(false);
  const [testResult,  setTestResult]  = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(keyInput);
    setSelectedModel(modelInput);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); onClose(); }, 800);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      setApiKey(keyInput);
      setSelectedModel(modelInput);
      const res = await sendChatMessage({
        prompt: 'Reply with just the word: OK',
        history: [],
        model: modelInput
      });
      const ms = Math.round(performance.now() - start);
      setTestResult({ success: true, message: `Connected! Got response in ${ms}ms via ${res.modelUsed}.` });
    } catch (err) {
      setTestResult({ success: false, message: `Failed: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(13,17,26,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    padding: '10px 14px',
    fontSize: '13.5px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.15s'
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{ width: '100%', maxWidth: '500px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="maddy-logo-badge">M</div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Maddy AI Settings</h3>
              <p style={{ fontSize: '11.5px', color: 'var(--text-dim)', margin: 0 }}>API Key &amp; Model Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* API Key */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Google Gemini API Key
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="API key..."
                style={{ ...inputStyle, flex: 1, fontFamily: 'var(--font-mono)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(66,133,244,0.6)'}
                onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="btn-icon"
                style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '42px' }}
                title={showKey ? 'Hide' : 'Show'}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Stored in your browser only. Loaded from DSA.js by default.
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Primary Model
            </label>
            <select
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id} style={{ background: '#131720', color: '#e8eaf0' }}>
                  {m.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
              Auto-fallback to the next model if the primary is overloaded.
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: testResult.success ? 'rgba(52,168,83,0.12)' : 'rgba(234,67,53,0.12)',
              border: `1px solid ${testResult.success ? 'rgba(52,168,83,0.4)' : 'rgba(234,67,53,0.4)'}`,
              color: testResult.success ? '#6ee7b7' : '#fca5a5',
              fontSize: '12.5px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {testResult.success ? <Check size={15} /> : <AlertCircle size={15} />}
              {testResult.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px',
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button
            onClick={handleTest}
            disabled={isTesting}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              padding: '7px 14px',
              fontSize: '12.5px',
              cursor: isTesting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)'
            }}
          >
            <RefreshCw size={13} style={isTesting ? { animation: 'spin 1s linear infinite' } : {}} />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: 'var(--text-muted)',
                padding: '7px 14px', fontSize: '12.5px', cursor: 'pointer',
                fontFamily: 'var(--font-body)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                background: 'linear-gradient(135deg, #4285f4 0%, #8b5cf6 100%)',
                border: 'none', borderRadius: '10px', color: '#fff',
                padding: '7px 20px', fontSize: '12.5px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                boxShadow: '0 0 14px rgba(66,133,244,0.35)',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              {saveSuccess ? <><Check size={14} /> Saved!</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
