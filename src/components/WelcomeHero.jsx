import React from 'react';
import { Code2, Network, GitFork, Flame, ArrowUpRight, Cpu, Zap, Brain } from 'lucide-react';

const SUGGESTIONS = [
  {
    title: 'Two Sum in O(N)',
    desc: 'Optimal Hash Map approach with code and Big-O analysis.',
    icon: <Code2 size={16} color="#4285f4" />,
    color: 'rgba(66,133,244,0.15)',
    prompt: 'Explain the optimal O(N) solution for Two Sum using a Hash Map. Provide clean JavaScript code and Big-O breakdown.'
  },
  {
    title: 'Binary Tree Inversion',
    desc: 'Recursive and BFS iterative methods explained.',
    icon: <GitFork size={16} color="#34a853" />,
    color: 'rgba(52,168,83,0.13)',
    prompt: 'How do you invert a Binary Tree? Explain both the recursive DFS and iterative BFS queue approaches with code.'
  },
  {
    title: 'Dijkstra vs BFS',
    desc: 'When to use weighted vs unweighted shortest path.',
    icon: <Network size={16} color="#8b5cf6" />,
    color: 'rgba(139,92,246,0.13)',
    prompt: 'Explain the difference between unweighted BFS and Dijkstra\'s algorithm for finding shortest paths in a graph.'
  },
  {
    title: '🔥 Test Off-Topic Rejection',
    desc: 'See how Maddy AI handles non-DSA questions.',
    icon: <Flame size={16} color="#ea4335" />,
    color: 'rgba(234,67,53,0.12)',
    prompt: 'How are you doing? Who is the president of the USA?'
  }
];

export default function WelcomeHero({ onSelectPrompt }) {
  return (
    <div className="hero-container">
      {/* Animated M logo */}
      <div className="hero-avatar">M</div>

      {/* Multi-gradient heading like Gemini */}
      <h1 className="hero-greeting">Hello, I'm Maddy AI</h1>
      <p className="hero-subtitle">
        Your dedicated <strong style={{ color: '#93c5fd' }}>Data Structures &amp; Algorithms</strong> expert.
        Ask me anything algorithmic — from Array tricks to Graph theory.
        <br />
        <span style={{
          display: 'inline-block',
          marginTop: '8px',
          color: '#f87171',
          fontSize: '13px',
          fontWeight: 500,
          padding: '4px 12px',
          background: 'rgba(234,67,53,0.1)',
          borderRadius: '99px',
          border: '1px solid rgba(234,67,53,0.25)'
        }}>
          ⚠️ Off-topic questions? Expect a very rude response.
        </span>
      </p>

      <div className="suggestion-grid">
        {SUGGESTIONS.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="suggestion-card"
            style={{ position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '60px', height: '60px',
                background: item.color,
                borderRadius: '0 var(--radius-md) 0 60px',
                opacity: 0.6
              }}
            />
            <div className="suggestion-card-title">
              {item.icon}
              <span>{item.title}</span>
              <ArrowUpRight size={13} style={{ marginLeft: 'auto', opacity: 0.45, flexShrink: 0 }} />
            </div>
            <div className="suggestion-card-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
