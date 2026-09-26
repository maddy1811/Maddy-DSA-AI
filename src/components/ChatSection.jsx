import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Flame, Bot, User, Copy, Check, ArrowRightCircle, Sparkles, AlertCircle } from 'lucide-react';
import { PERSONAS, sendChatMessage } from '../services/gemini';
import { sound } from '../services/audio';

const QUICK_PROMPTS = [
  { label: '🔥 Test Savage Roast', prompt: 'How are you doing today? Who is your favorite actor?' },
  { label: '💡 Binary Search Intuition', prompt: 'Explain the intuition behind Binary Search and why it is O(log n).' },
  { label: '⚡ Two Sum O(N)', prompt: 'What is the optimal O(N) solution for Two Sum using a Hash Map? Provide JavaScript code.' },
  { label: '🌳 Invert Binary Tree', prompt: 'How do you invert a Binary Tree recursively and iteratively?' },
  { label: '🎒 Knapsack 0/1 DP', prompt: 'Explain 0/1 Knapsack Dynamic Programming: state definition and recurrence relation.' }
];

export default function ChatSection({
  activePersona,
  onSendToScratchpad,
  onSwitchTab
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Welcome to the Dojo! I am your Data Structures & Algorithms Instructor.\n\nAsk me any DSA problem—from Binary Search and Tree Traversals to Dynamic Programming and Graphs. But remember: **Ask anything off-topic and I will roast you without mercy!** 🔥`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBurn: false
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const persona = PERSONAS[activePersona] || PERSONAS.SAVAGE;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    sound.playPop();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        prompt: trimmed,
        history: messages,
        personaKey: activePersona
      });

      if (result.isBurn) {
        sound.playRoast();
      } else {
        sound.playSuccess();
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: result.text,
          modelUsed: result.modelUsed,
          isBurn: result.isBurn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      sound.playRoast();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `⚠️ **Instructor Notice:** Unable to reach AI core (${err.message}). Check your network connection or API settings.`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    sound.playPop();
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    sound.playPop();
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `Dojo cleared. State your DSA query or prepare for an algorithmic reckoning!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to parse message text and render formatted code blocks
  const renderMessageContent = (msg, msgIdx) => {
    const parts = msg.text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const language = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() || 'javascript' : 'text';
        const codeContent = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3).trim() : part.slice(3, -3).trim();
        const copyKey = `${msgIdx}-${pIdx}`;

        return (
          <div
            key={pIdx}
            style={{
              margin: '10px 0',
              borderRadius: 'var(--radius-md)',
              background: '#0d131f',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}>
              <span style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                {language}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleCopyCode(codeContent, copyKey)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}
                  title="Copy code to clipboard"
                >
                  {copiedIndex === copyKey ? (
                    <>
                      <Check size={12} color="var(--accent-emerald)" />
                      <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                {onSendToScratchpad && (
                  <button
                    onClick={() => {
                      sound.playCodeRun();
                      onSendToScratchpad(codeContent, language);
                      if (onSwitchTab) onSwitchTab('scratchpad');
                    }}
                    className="btn btn-primary"
                    style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}
                    title="Load into interactive Code & Big-O Lab"
                  >
                    <ArrowRightCircle size={12} />
                    <span>Run in Lab</span>
                  </button>
                )}
              </div>
            </div>
            <pre style={{
              margin: 0,
              padding: '12px',
              overflowX: 'auto',
              fontSize: '13px',
              lineHeight: 1.6,
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)'
            }}>
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Format bold text and simple paragraphs
      return (
        <span key={pIdx} style={{ whiteSpace: 'pre-wrap' }}>
          {part}
        </span>
      );
    });
  };

  return (
    <section className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            boxShadow: '0 0 10px var(--accent-emerald-glow)'
          }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Instructor Stream</span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '4px' }}>
            ({persona.name})
          </span>
        </div>

        <button
          onClick={handleClearChat}
          className="btn btn-ghost"
          style={{ padding: '4px 10px', fontSize: '12px' }}
          title="Reset conversation"
        >
          <Trash2 size={13} />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: 0
      }}>
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px'
            }}
          >
            {/* Sender Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-dim)',
              padding: '0 4px'
            }}>
              {msg.sender === 'user' ? (
                <>
                  <span>You</span>
                  <User size={12} />
                </>
              ) : (
                <>
                  <Bot size={12} color="var(--accent-primary)" />
                  <span>{persona.name}</span>
                  {msg.isBurn && (
                    <span className="badge badge-rose" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      🔥 SAVAGE BURN
                    </span>
                  )}
                  {msg.modelUsed && (
                    <span style={{ fontSize: '9px', opacity: 0.6 }}>[{msg.modelUsed}]</span>
                  )}
                </>
              )}
              <span>{msg.timestamp}</span>
            </div>

            {/* Message Bubble */}
            <div
              style={{
                maxWidth: '92%',
                padding: '12px 16px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                  : msg.isBurn
                    ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                    : 'var(--bg-surface-elevated)',
                border: msg.sender === 'user'
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                  : msg.isBurn
                    ? '1px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                lineHeight: 1.6,
                boxShadow: msg.isBurn ? '0 0 20px rgba(244, 63, 94, 0.2)' : 'var(--shadow-sm)'
              }}
            >
              {renderMessageContent(msg, idx)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)'
            }}>
              <Flame size={16} color="var(--accent-primary)" className="flame-effect" />
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Thinking algorithmic strategy...</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulseGlow 1s infinite alternate' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulseGlow 1s infinite 0.2s alternate' }} />
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-emerald)', animation: 'pulseGlow 1s infinite 0.4s alternate' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {QUICK_PROMPTS.map((qp, qIdx) => (
          <button
            key={qIdx}
            onClick={() => handleSend(qp.prompt)}
            className="btn btn-ghost"
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: 'var(--radius-full)',
              flexShrink: 0
            }}
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box Area */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 26, 0.9)'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
          position: 'relative'
        }}>
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${persona.name} anything about DSA (e.g. "Explain QuickSort partition", "Reverse Linked list")...`}
            className="glass-input"
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              resize: 'none',
              maxHeight: '120px',
              lineHeight: 1.4
            }}
          />

          <button
            id="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary"
            style={{
              height: '42px',
              padding: '0 16px',
              borderRadius: 'var(--radius-md)',
              opacity: !input.trim() || isLoading ? 0.5 : 1
            }}
            title="Send query (Enter)"
          >
            <Send size={15} />
            <span>Ask</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          fontSize: '11px',
          color: 'var(--text-dim)',
          padding: '0 4px'
        }}>
          <span>Press <strong>Enter</strong> to ask, <strong>Shift + Enter</strong> for newline</span>
          {activePersona === 'SAVAGE' && (
            <span style={{ color: 'var(--accent-rose)' }}>🔥 Warning: Off-topic questions will be roasted!</span>
          )}
        </div>
      </div>
    </section>
  );
}
