import React, { useState } from 'react';
import { Bot, User, Copy, Check, Flame, RotateCcw, AlertTriangle, FileCode } from 'lucide-react';

export default function ChatMessage({ message, onRegenerate, isLast }) {
  const isUser = message.sender === 'user';
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() || 'code' : 'code';
        const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3).trim() : part.slice(3, -3).trim();
        const codeId = `${message.id}-${index}`;

        return (
          <div key={index} className="code-block-wrapper">
            <div className="code-header">
              <span className="code-lang">{lang}</span>
              <button onClick={() => handleCopyCode(code, codeId)} className="copy-btn">
                {copiedCodeId === codeId
                  ? <><Check size={13} color="var(--accent-emerald)" /><span style={{ color: 'var(--accent-emerald)' }}>Copied!</span></>
                  : <><Copy size={13} /><span>Copy code</span></>}
              </button>
            </div>
            <pre className="code-content"><code>{code}</code></pre>
          </div>
        );
      }

      // Inline bold / code
      const chunks = part.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      return (
        <span key={index}>
          {chunks.map((chunk, ci) => {
            if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2)
              return <code key={ci} className="inline-code">{chunk.slice(1, -1)}</code>;
            if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4)
              return <strong key={ci} style={{ color: '#fff', fontWeight: 600 }}>{chunk.slice(2, -2)}</strong>;
            return chunk;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'}`}>
      {/* Bot: show "M" logo avatar */}
      {!isUser && (
        <div className="message-avatar bot">M</div>
      )}

      <div className={`message-body ${isUser ? 'user' : 'bot'}`}>
        {isUser ? (
          <div className="user-bubble">
            {/* Attached media */}
            {message.attachments?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: message.text ? '10px' : 0 }}>
                {message.attachments.map((att, i) =>
                  att.type === 'image' ? (
                    <div
                      key={i}
                      onClick={() => setEnlargedImage(att.previewUrl)}
                      style={{
                        width: 112, height: 84, borderRadius: '10px',
                        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'zoom-in', background: '#000'
                      }}
                    >
                      <img src={att.previewUrl} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '5px 10px', background: 'rgba(0,0,0,0.35)',
                      borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px'
                    }}>
                      <FileCode size={14} color="#60a5fa" />
                      <span>{att.name}</span>
                      {att.size && <span style={{ opacity: 0.55 }}>({att.size})</span>}
                    </div>
                  )
                )}
              </div>
            )}
            {message.text && <div>{message.text}</div>}
          </div>
        ) : (
          <div className="bot-content">
            {/* Sender label */}
            <div className="bot-sender-label">
              <span style={{
                background: 'linear-gradient(90deg,#4285f4,#8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700
              }}>Maddy AI</span>
            </div>

            {/* Savage burn badge */}
            {message.isBurn && (
              <div className="savage-banner">
                <Flame size={13} color="#ea4335" />
                <span>Off-Topic Rejection — Strict DSA Rule</span>
              </div>
            )}

            {message.isError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', marginBottom: '8px' }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Connection Notice</span>
              </div>
            )}

            <div style={{ whiteSpace: 'pre-wrap' }}>{renderFormattedText(message.text)}</div>

            {/* Actions */}
            <div className="message-actions">
              <button onClick={handleCopyText} className="action-btn">
                {copiedText
                  ? <><Check size={13} color="var(--accent-emerald)" /><span style={{ color: 'var(--accent-emerald)' }}>Copied</span></>
                  : <><Copy size={13} /><span>Copy</span></>}
              </button>

              {onRegenerate && isLast && (
                <button onClick={onRegenerate} className="action-btn">
                  <RotateCcw size={13} /><span>Regenerate</span>
                </button>
              )}

              {message.modelUsed && (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  {message.modelUsed}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="message-avatar user">
          <User size={16} />
        </div>
      )}

      {/* Enlarged image overlay */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', cursor: 'zoom-out'
          }}
        >
          <img
            src={enlargedImage}
            alt="Enlarged"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '14px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }}
          />
        </div>
      )}
    </div>
  );
}
