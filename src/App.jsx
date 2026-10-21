import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatTopBar from './components/ChatTopBar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import WelcomeHero from './components/WelcomeHero';
import SettingsModal from './components/SettingsModal';
import AnimatedBackground from './components/AnimatedBackground';
import CameraModal from './components/CameraModal';
import DriveModal from './components/DriveModal';
import { sendChatMessage, getSelectedModel } from './services/gemini';

const STORAGE_KEY = 'dsa_chatbot_sessions';

export default function App() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved chats', e);
    }
    return [
      {
        id: 'default-session',
        title: 'New DSA Discussion',
        createdAt: Date.now(),
        messages: []
      }
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[0]?.id) return parsed[0].id;
      }
    } catch {}
    return 'default-session';
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(getSelectedModel());

  const messagesEndRef = useRef(null);
  const localDriveUploadRef = useRef(null);

  // Sync chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (e) {
      console.warn('Failed to save chats to localStorage', e);
    }
  }, [chats]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading]);

  const handleAddAttachment = (att) => {
    setAttachments(prev => [...prev, att]);
  };

  const handleAddAttachments = (newAtts) => {
    setAttachments(prev => [...prev, ...newAtts]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat = {
      id: newId,
      title: 'New DSA Discussion',
      createdAt: Date.now(),
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setInput('');
    setAttachments([]);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setInput('');
    setAttachments([]);
  };

  const handleDeleteChat = (id) => {
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (remaining.length === 0) {
        const fresh = {
          id: `chat-${Date.now()}`,
          title: 'New DSA Discussion',
          createdAt: Date.now(),
          messages: []
        };
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (activeChatId === id) {
        setActiveChatId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleClearCurrentChat = () => {
    setChats(prev =>
      prev.map(c => (c.id === activeChatId ? { ...c, messages: [] } : c))
    );
  };

  const handleSendMessage = async (textToSend = input) => {
    const trimmed = textToSend.trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;

    // Snapshot current attachments and clear for next message
    const currentAttachments = [...attachments];
    setAttachments([]);
    setInput('');

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      attachments: currentAttachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update title if first user message
    const currentMessages = activeChat ? activeChat.messages : [];
    const isFirstMessage = currentMessages.length === 0;
    const titleSummary = trimmed || (currentAttachments.length > 0 ? `Analysis: ${currentAttachments[0].name}` : 'New DSA Discussion');
    const newTitle = isFirstMessage ? (titleSummary.length > 32 ? `${titleSummary.slice(0, 32)}...` : titleSummary) : activeChat.title;

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? {
              ...c,
              title: newTitle,
              messages: [...c.messages, userMessage]
            }
          : c
      )
    );

    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        prompt: trimmed,
        history: currentMessages,
        attachments: currentAttachments,
        model: currentModel
      });

      const botMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: result.text,
        modelUsed: result.modelUsed,
        isBurn: result.isBurn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, botMessage] }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: `⚠️ **Instructor Notice:** Unable to reach AI core (${err.message}). Check your network connection or API settings.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeChat || activeChat.messages.length < 2 || isLoading) return;

    const messages = [...activeChat.messages];
    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastPrompt = messages[lastUserIndex].text;
    const lastAttachments = messages[lastUserIndex].attachments || [];
    const historyBefore = messages.slice(0, lastUserIndex);

    // Remove subsequent bot messages
    const trimmedMessages = messages.slice(0, lastUserIndex + 1);

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: trimmedMessages }
          : c
      )
    );

    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        prompt: lastPrompt,
        history: historyBefore,
        attachments: lastAttachments,
        model: currentModel
      });

      const newBotMsg = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: result.text,
        modelUsed: result.modelUsed,
        isBurn: result.isBurn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev =>
        prev.map(c =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, newBotMsg] }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container" style={{ position: 'relative' }}>
      {/* Live DSA-inspired canvas background */}
      <AnimatedBackground />

      {/* Sidebar with session history */}

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat View */}
      <main className="chat-main">
        {/* Top Navbar */}
        <ChatTopBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onClearChat={handleClearCurrentChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
        />

        {/* Messages Stream Container */}
        <div className="messages-container">
          {(!activeChat?.messages || activeChat.messages.length === 0) ? (
            <WelcomeHero onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          ) : (
            <div className="messages-inner">
              {activeChat.messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  isLast={index === activeChat.messages.length - 1}
                  onRegenerate={handleRegenerate}
                />
              ))}

              {isLoading && (
                <div className="message-row bot animate-fade-in">
                  <div className="message-avatar bot">
                    <span className="thinking-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                  <div className="message-body bot">
                    <div style={{ color: 'var(--text-muted)', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Thinking algorithmic explanation...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Dock */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => handleSendMessage()}
          isLoading={isLoading}
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          onOpenCam={() => setIsCameraOpen(true)}
          onOpenDrive={() => setIsDriveOpen(true)}
        />
      </main>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => handleAddAttachment(img)}
      />

      {/* Cloud & Drive Files Modal */}
      <DriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        onSelectFiles={(files) => handleAddAttachments(files)}
        onTriggerLocalUpload={() => localDriveUploadRef.current?.click()}
      />

      {/* Hidden local input for Drive Modal's 'Upload from Device' */}
      <input
        ref={localDriveUploadRef}
        type="file"
        multiple
        accept="image/*,.py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.txt,.md,.json,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(file => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                const base64Data = dataUrl.split(',')[1];
                handleAddAttachment({
                  id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  name: file.name,
                  type: 'image',
                  previewUrl: dataUrl,
                  base64Data,
                  mimeType: file.type || 'image/png',
                  size: `${Math.round(file.size / 1024)} KB`
                });
              };
              reader.readAsDataURL(file);
            } else {
              const reader = new FileReader();
              reader.onload = (ev) => {
                handleAddAttachment({
                  id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  name: file.name,
                  type: 'file',
                  textContent: ev.target.result,
                  mimeType: file.type || 'text/plain',
                  size: `${(file.size / 1024).toFixed(1)} KB`
                });
              };
              reader.readAsText(file);
            }
          });
          e.target.value = '';
        }}
      />

      {/* API Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
