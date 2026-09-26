import React, { useState } from 'react';
import { HardDrive, Cloud, FileCode, FileText, Image as ImageIcon, Search, X, Check, Upload, Folder } from 'lucide-react';
import { sound } from '../services/audio';

const MOCK_DRIVE_FILES = [
  {
    id: 'd1',
    name: 'LeetCode_TwoSum_Solutions.py',
    type: 'file',
    size: '2.4 KB',
    mimeType: 'text/x-python',
    textContent: `# Two Sum Python Solution
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`
  },
  {
    id: 'd2',
    name: 'Binary_Search_Tree_Implementation.cpp',
    type: 'file',
    size: '4.1 KB',
    mimeType: 'text/x-c++',
    textContent: `// C++ BST Insert and Inorder
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->data) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}
`
  },
  {
    id: 'd3',
    name: 'Graph_Algorithms_Dijkstra.js',
    type: 'file',
    size: '3.8 KB',
    mimeType: 'application/javascript',
    textContent: `// Dijkstra Algorithm in JavaScript using Min-Priority Queue
function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  for (let node in graph) distances[node] = Infinity;
  distances[start] = 0;
  // Shortest path implementation...
  return distances;
}
`
  },
  {
    id: 'd4',
    name: 'Dynamic_Programming_Knapsack.md',
    type: 'file',
    size: '1.9 KB',
    mimeType: 'text/markdown',
    textContent: `# 0/1 Knapsack Problem Notes
State: dp[i][w] = maximum value using first i items with max weight capacity w.
Recurrence:
dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])
`
  }
];

export default function DriveModal({ isOpen, onClose, onSelectFiles, onTriggerLocalUpload }) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  if (!isOpen) return null;

  const filtered = MOCK_DRIVE_FILES.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    sound.playPop();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAttachSelected = () => {
    sound.playAttach();
    const filesToAttach = MOCK_DRIVE_FILES.filter(f => selectedIds.includes(f.id));
    onSelectFiles(filesToAttach);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#0d1424',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 35px rgba(59, 130, 246, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(66, 133, 244, 0.4)'
            }}>
              <Cloud size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Google Drive & Cloud Files</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>
                Select files from your Cloud Drive or upload from your computer drives
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px'
          }}>
            <Search size={14} color="var(--text-dim)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files in Google Drive..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          <button
            onClick={() => {
              onClose();
              if (onTriggerLocalUpload) onTriggerLocalUpload();
            }}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            <Upload size={13} />
            <span>Browse Local Drive</span>
          </button>
        </div>

        {/* File List */}
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {filtered.map(f => {
            const isSelected = selectedIds.includes(f.id);

            return (
              <div
                key={f.id}
                onClick={() => toggleSelect(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileCode size={18} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: isSelected ? '#fff' : 'var(--text-main)' }}>
                      {f.name}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {f.size} • Google Drive
                    </span>
                  </div>
                </div>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: isSelected ? 'none' : '1px solid var(--border-medium)',
                  background: isSelected ? 'var(--accent-primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSelected && <Check size={14} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            {selectedIds.length} {selectedIds.length === 1 ? 'file' : 'files'} selected
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
              Cancel
            </button>
            <button
              onClick={handleAttachSelected}
              disabled={selectedIds.length === 0}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 18px', opacity: selectedIds.length === 0 ? 0.5 : 1 }}
            >
              <span>Attach Selected</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
