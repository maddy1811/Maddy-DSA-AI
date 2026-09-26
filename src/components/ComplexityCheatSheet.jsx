import React, { useState } from 'react';
import { Calculator, Zap, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { sound } from '../services/audio';

const DATA_STRUCTURES = [
  { name: 'Array (Static)', access: 'O(1)', search: 'O(N)', insert: 'O(N)', delete: 'O(N)', space: 'O(N)' },
  { name: 'Dynamic Array (Vector)', access: 'O(1)', search: 'O(N)', insert: 'O(1)*', delete: 'O(N)', space: 'O(N)' },
  { name: 'Singly Linked List', access: 'O(N)', search: 'O(N)', insert: 'O(1)', delete: 'O(1)', space: 'O(N)' },
  { name: 'Doubly Linked List', access: 'O(N)', search: 'O(N)', insert: 'O(1)', delete: 'O(1)', space: 'O(N)' },
  { name: 'Hash Table (Map / Set)', access: 'N/A', search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(N)' },
  { name: 'Binary Search Tree (Balanced)', access: 'O(log N)', search: 'O(log N)', insert: 'O(log N)', delete: 'O(log N)', space: 'O(N)' },
  { name: 'Binary Search Tree (Skewed)', access: 'O(N)', search: 'O(N)', insert: 'O(N)', delete: 'O(N)', space: 'O(N)' },
  { name: 'Binary Heap (Priority Queue)', access: 'O(1) (peek)', search: 'O(N)', insert: 'O(log N)', delete: 'O(log N)', space: 'O(N)' }
];

const SORTING_ALGORITHMS = [
  { name: 'Quick Sort', best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N²)', space: 'O(log N)', stable: 'No' },
  { name: 'Merge Sort', best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N log N)', space: 'O(N)', stable: 'Yes' },
  { name: 'Heap Sort', best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N log N)', space: 'O(1)', stable: 'No' },
  { name: 'Insertion Sort', best: 'O(N)', avg: 'O(N²)', worst: 'O(N²)', space: 'O(1)', stable: 'Yes' },
  { name: 'Bubble Sort', best: 'O(N)', avg: 'O(N²)', worst: 'O(N²)', space: 'O(1)', stable: 'Yes' },
  { name: 'Counting Sort', best: 'O(N + K)', avg: 'O(N + K)', worst: 'O(N + K)', space: 'O(K)', stable: 'Yes' }
];

export default function ComplexityCheatSheet() {
  const [calcN, setCalcN] = useState(10000);

  const calculateOps = (n) => {
    return {
      o1: 1,
      oLogN: Math.round(Math.log2(n || 1)),
      oN: n,
      oNLogN: Math.round(n * Math.log2(n || 1)),
      oNSquared: n <= 50000 ? (n * n).toLocaleString() : 'Overflow (> 2.5 Billion)',
      status: n > 100000 ? '⚠️ O(N²) will trigger Time Limit Exceeded (TLE) in standard online judges (10⁸ ops/sec limit)!' : '✅ Feasible under 10⁸ ops/sec'
    };
  };

  const ops = calculateOps(calcN);

  return (
    <section className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            Big-O Complexity Matrix & Operations Calculator
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Analyze runtime constraints, memory boundaries, and standard data structure operations.
          </p>
        </div>

        {/* N-Calculator Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface-elevated)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Calculator size={15} color="var(--accent-primary)" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Input Size (N):</span>
          <select
            value={calcN}
            onChange={(e) => {
              sound.playPop();
              setCalcN(Number(e.target.value));
            }}
            className="glass-input"
            style={{ padding: '4px 8px', fontSize: '12px', background: '#0f172a' }}
          >
            <option value="100">N = 100 (Small)</option>
            <option value="1000">N = 1,000</option>
            <option value="10000">N = 10,000 (Medium)</option>
            <option value="100000">N = 100,000 (LeetCode Typical)</option>
            <option value="1000000">N = 1,000,000 (Large)</option>
          </select>
        </div>
      </div>

      {/* Main Scroll Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Estimated Operations Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}>
          {[
            { name: 'O(1)', count: ops.o1.toLocaleString(), rating: 'Excellent', color: '#10b981' },
            { name: 'O(log N)', count: ops.oLogN.toLocaleString(), rating: 'Good', color: '#06b6d4' },
            { name: 'O(N)', count: ops.oN.toLocaleString(), rating: 'Fair', color: '#6366f1' },
            { name: 'O(N log N)', count: ops.oNLogN.toLocaleString(), rating: 'Acceptable', color: '#f59e0b' },
            { name: 'O(N²)', count: ops.oNSquared, rating: 'Slow', color: '#f43f5e' }
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: `1px solid ${item.color}33`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '13px', color: item.color }}>{item.name}</span>
                <span style={{ fontSize: '10px', color: item.color, opacity: 0.9 }}>{item.rating}</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {item.count} ops
              </div>
            </div>
          ))}
        </div>

        {/* LeetCode Rule of Thumb Notice */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Zap size={16} color="var(--accent-amber)" />
          <div>
            <strong>FAANG Interview Rule of Thumb:</strong> Modern CPUs handle roughly <strong>10⁸ operations per second</strong>. If N ≤ 10⁵, an O(N²) solution (~10¹⁰ ops) will time out (TLE). You must target O(N log N) or O(N)!
          </div>
        </div>

        {/* Table 1: Common Data Structures */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
            Data Structure Operations Complexity
          </h3>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Data Structure</th>
                  <th style={{ padding: '10px 14px' }}>Access</th>
                  <th style={{ padding: '10px 14px' }}>Search</th>
                  <th style={{ padding: '10px 14px' }}>Insertion</th>
                  <th style={{ padding: '10px 14px' }}>Deletion</th>
                  <th style={{ padding: '10px 14px' }}>Space (Worst)</th>
                </tr>
              </thead>
              <tbody>
                {DATA_STRUCTURES.map((ds, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>{ds.name}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#a5f3fc' }}>{ds.access}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#fde68a' }}>{ds.search}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#6ee7b7' }}>{ds.insert}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#fda4af' }}>{ds.delete}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{ds.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Sorting Algorithms */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-main)' }}>
            Sorting Algorithms Complexity
          </h3>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Algorithm</th>
                  <th style={{ padding: '10px 14px' }}>Best Time</th>
                  <th style={{ padding: '10px 14px' }}>Average Time</th>
                  <th style={{ padding: '10px 14px' }}>Worst Time</th>
                  <th style={{ padding: '10px 14px' }}>Space</th>
                  <th style={{ padding: '10px 14px' }}>Stable</th>
                </tr>
              </thead>
              <tbody>
                {SORTING_ALGORITHMS.map((algo, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>{algo.name}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#6ee7b7' }}>{algo.best}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: '#fde68a' }}>{algo.avg}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: algo.worst.includes('²') ? '#fda4af' : '#a5f3fc' }}>{algo.worst}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{algo.space}</td>
                    <td style={{ padding: '10px 14px', color: algo.stable === 'Yes' ? 'var(--accent-emerald)' : 'var(--text-dim)' }}>{algo.stable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
