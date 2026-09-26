import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Flame, ArrowUpRight, Trophy, Sparkles, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/audio';

const CURATED_PROBLEMS = [
  // Arrays & Hashing
  { id: 'p1', title: 'Two Sum', category: 'Arrays & Hashing', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(N)', prompt: 'Explain the optimal O(N) Hash Map approach for Two Sum.' },
  { id: 'p2', title: 'Contains Duplicate', category: 'Arrays & Hashing', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(N)', prompt: 'How do you check for duplicates in an array in O(N) using a Set?' },
  { id: 'p3', title: 'Valid Anagram', category: 'Arrays & Hashing', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(1)', prompt: 'Explain frequency array vs sorting for Valid Anagram.' },
  { id: 'p4', title: 'Group Anagrams', category: 'Arrays & Hashing', difficulty: 'Medium', timeO: 'O(N * K)', spaceO: 'O(N * K)', prompt: 'How to group anagrams using frequency key hashing?' },
  { id: 'p5', title: 'Top K Frequent Elements', category: 'Arrays & Hashing', difficulty: 'Medium', timeO: 'O(N)', spaceO: 'O(N)', prompt: 'Explain Bucket Sort vs Min-Heap for Top K Frequent Elements.' },

  // Two Pointers & Sliding Window
  { id: 'p6', title: 'Valid Palindrome', category: 'Two Pointers', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(1)', prompt: 'How to check Valid Palindrome in-place with two pointers?' },
  { id: 'p7', title: '3Sum', category: 'Two Pointers', difficulty: 'Medium', timeO: 'O(N²)', spaceO: 'O(1)', prompt: 'Explain how sorting plus two-pointers avoids duplicates in 3Sum.' },
  { id: 'p8', title: 'Container With Most Water', category: 'Two Pointers', difficulty: 'Medium', timeO: 'O(N)', spaceO: 'O(1)', prompt: 'Why does the two pointer greedy approach work for Container With Most Water?' },
  { id: 'p9', title: 'Best Time to Buy & Sell Stock', category: 'Sliding Window', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(1)', prompt: 'Explain single-pass min-price tracking for Stock profit.' },
  { id: 'p10', title: 'Longest Substring Without Repeating Characters', category: 'Sliding Window', difficulty: 'Medium', timeO: 'O(N)', spaceO: 'O(min(N, M))', prompt: 'Explain variable sliding window with hash map for longest substring.' },

  // Stacks
  { id: 'p11', title: 'Valid Parentheses', category: 'Stack', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(N)', prompt: 'Explain LIFO Stack matching for Valid Parentheses.' },
  { id: 'p12', title: 'Min Stack', category: 'Stack', difficulty: 'Medium', timeO: 'O(1)', spaceO: 'O(N)', prompt: 'How to design a Min Stack with O(1) getMin using two stacks or pairs?' },
  { id: 'p13', title: 'Daily Temperatures', category: 'Stack', difficulty: 'Medium', timeO: 'O(N)', spaceO: 'O(N)', prompt: 'Explain the Monotonic Decreasing Stack for Daily Temperatures.' },

  // Binary Search
  { id: 'p14', title: 'Binary Search', category: 'Binary Search', difficulty: 'Easy', timeO: 'O(log N)', spaceO: 'O(1)', prompt: 'Derive why Binary Search is O(log N) and prevent integer overflow with mid = low + (high - low) / 2.' },
  { id: 'p15', title: 'Search in Rotated Sorted Array', category: 'Binary Search', difficulty: 'Medium', timeO: 'O(log N)', spaceO: 'O(1)', prompt: 'How to determine which half is sorted in Rotated Binary Search?' },

  // Trees
  { id: 'p16', title: 'Invert Binary Tree', category: 'Trees', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(H)', prompt: 'Invert Binary Tree recursively and iteratively with a queue.' },
  { id: 'p17', title: 'Maximum Depth of Binary Tree', category: 'Trees', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(H)', prompt: 'Compare DFS recursion vs BFS level-order for tree depth.' },
  { id: 'p18', title: 'Validate Binary Search Tree', category: 'Trees', difficulty: 'Medium', timeO: 'O(N)', spaceO: 'O(H)', prompt: 'Why is local parent checking insufficient for Valid BST? Explain range boundaries (-inf, +inf).' },

  // Graphs
  { id: 'p19', title: 'Number of Islands', category: 'Graphs', difficulty: 'Medium', timeO: 'O(M * N)', spaceO: 'O(M * N)', prompt: 'Explain grid traversal using DFS/BFS for Number of Islands.' },
  { id: 'p20', title: 'Clone Graph', category: 'Graphs', difficulty: 'Medium', timeO: 'O(V + E)', spaceO: 'O(V)', prompt: 'Explain BFS/DFS with a visited HashMap to clone a graph with cycles.' },

  // Dynamic Programming
  { id: 'p21', title: 'Climbing Stairs', category: 'Dynamic Programming', difficulty: 'Easy', timeO: 'O(N)', spaceO: 'O(1)', prompt: 'Show the Fibonacci relation for Climbing Stairs with space optimization.' },
  { id: 'p22', title: 'Coin Change', category: 'Dynamic Programming', difficulty: 'Medium', timeO: 'O(amount * coins)', spaceO: 'O(amount)', prompt: 'Explain bottom-up DP tabulation for minimum coin change.' },
  { id: 'p23', title: 'Longest Increasing Subsequence', category: 'Dynamic Programming', difficulty: 'Medium', timeO: 'O(N log N)', spaceO: 'O(N)', prompt: 'Explain O(N²) DP vs O(N log N) Patience Sorting Binary Search for LIS.' }
];

export default function ProblemRoadmap({ onAskSensei }) {
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('algosensei_solved');
      return saved ? JSON.parse(saved) : ['p1', 'p14'];
    } catch {
      return ['p1', 'p14'];
    }
  });

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const toggleSolved = (id) => {
    sound.playPop();
    let newSolved;
    if (solvedIds.includes(id)) {
      newSolved = solvedIds.filter(item => item !== id);
    } else {
      newSolved = [...solvedIds, id];
      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    setSolvedIds(newSolved);
    localStorage.setItem('algosensei_solved', JSON.stringify(newSolved));
  };

  const categories = ['All', ...new Set(CURATED_PROBLEMS.map(p => p.category))];

  const filteredProblems = CURATED_PROBLEMS.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesCategory && matchesDifficulty;
  });

  const percentComplete = Math.round((solvedIds.length / CURATED_PROBLEMS.length) * 100);

  return (
    <section className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Header & Progress Bar */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              Curated 75 Essential DSA Roadmap
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Master high-yield algorithmic patterns for technical interviews.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} color="var(--accent-amber)" />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              {solvedIds.length} / {CURATED_PROBLEMS.length} Solved ({percentComplete}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${percentComplete}%`,
            background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} /> Filter:
          </span>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '4px 8px', fontSize: '12px', background: '#0f172a' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '4px 8px', fontSize: '12px', background: '#0f172a' }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Problems List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {filteredProblems.map((prob) => {
          const isSolved = solvedIds.includes(prob.id);

          return (
            <div
              key={prob.id}
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isSolved ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface-elevated)',
                border: isSolved ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                transition: 'all 0.2s'
              }}
            >
              {/* Left Checkbox & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => toggleSolved(prob.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                >
                  {isSolved ? (
                    <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  ) : (
                    <Circle size={18} color="var(--text-dim)" />
                  )}
                </button>

                <div>
                  <div style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    textDecoration: isSolved ? 'line-through' : 'none',
                    color: isSolved ? 'var(--text-muted)' : 'var(--text-main)'
                  }}>
                    {prob.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                    <span>{prob.category}</span>
                    <span>•</span>
                    <span>Time: <code style={{ color: 'var(--accent-cyan)' }}>{prob.timeO}</code></span>
                    <span>Space: <code style={{ color: 'var(--accent-amber)' }}>{prob.spaceO}</code></span>
                  </div>
                </div>
              </div>

              {/* Right Badges & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge ${prob.difficulty === 'Easy' ? 'badge-emerald' : prob.difficulty === 'Medium' ? 'badge-amber' : 'badge-rose'}`}>
                  {prob.difficulty}
                </span>

                <button
                  onClick={() => onAskSensei(prob.prompt)}
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: '11px' }}
                  title="Ask Sensei to explain this problem"
                >
                  <Flame size={12} color="var(--accent-primary)" />
                  <span>Ask Sensei</span>
                  <ArrowUpRight size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
