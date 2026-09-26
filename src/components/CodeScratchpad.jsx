import React, { useState } from 'react';
import { Play, Flame, RotateCcw, Check, Sparkles, Terminal, Copy, Cpu, BookOpen } from 'lucide-react';
import { sound } from '../services/audio';
import { analyzeCodeWithAI } from '../services/gemini';

const PROBLEM_PRESETS = [
  {
    id: 'two-sum',
    title: 'Two Sum (Optimal O(n))',
    difficulty: 'Easy',
    js: `// Two Sum: Find indices of two numbers that add up to target
function twoSum(nums, target) {
  const map = new Map(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test cases
console.log("Two Sum [2,7,11,15], target 9 =>", twoSum([2, 7, 11, 15], 9));
console.log("Two Sum [3,2,4], target 6 =>", twoSum([3, 2, 4], 6));
`
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses (Stack)',
    difficulty: 'Easy',
    js: `// Valid Parentheses: Determine if string of brackets is valid
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}

console.log("isValid('()[]{}') =>", isValid('()[]{}'));
console.log("isValid('(]') =>", isValid('(]'));
console.log("isValid('{[]}') =>", isValid('{[]}'));
`
  },
  {
    id: 'binary-search',
    title: 'Binary Search (O(log n))',
    difficulty: 'Easy',
    js: `// Binary Search in a sorted array
function binarySearch(nums, target) {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 15, 20];
console.log("Search for 7 in arr => Index:", binarySearch(arr, 7));
console.log("Search for 12 in arr => Index:", binarySearch(arr, 12));
`
  },
  {
    id: 'max-subarray',
    title: "Kadane's Algorithm (Max Subarray)",
    difficulty: 'Medium',
    js: `// Maximum Subarray (Kadane's Algorithm - O(n))
function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}

const test = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log("Max Subarray sum:", maxSubArray(test));
`
  }
];

export default function CodeScratchpad({ externalCode, externalLang }) {
  const [selectedPreset, setSelectedPreset] = useState('two-sum');
  const [code, setCode] = useState(PROBLEM_PRESETS[0].js);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);

  // If code is injected from chat
  React.useEffect(() => {
    if (externalCode) {
      setCode(externalCode);
    }
  }, [externalCode]);

  const handleSelectPreset = (id) => {
    setSelectedPreset(id);
    const found = PROBLEM_PRESETS.find(p => p.id === id);
    if (found) {
      setCode(found.js);
      setConsoleOutput('');
      setAiAnalysis(null);
      sound.playPop();
    }
  };

  const handleRunCode = () => {
    sound.playCodeRun();
    const logs = [];
    const originalConsoleLog = console.log;

    // Intercept console.log
    console.log = (...args) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };

    const startTime = performance.now();
    try {
      // Evaluate in function scope
      const runner = new Function(code);
      runner();
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      setConsoleOutput(logs.length ? logs.join('\n') : 'Execution finished with 0 output logs.');
    } catch (err) {
      const endTime = performance.now();
      setExecutionTime((endTime - startTime).toFixed(2));
      setConsoleOutput(`❌ Runtime Error: ${err.message}`);
    } finally {
      console.log = originalConsoleLog;
    }
  };

  const handleAnalyzeWithAI = async () => {
    sound.playPop();
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const currPreset = PROBLEM_PRESETS.find(p => p.id === selectedPreset);
      const res = await analyzeCodeWithAI({
        code,
        language: 'javascript',
        problemTitle: currPreset ? currPreset.title : 'Custom Code'
      });
      setAiAnalysis(res.text);
      sound.playSuccess();
    } catch (err) {
      setAiAnalysis(`⚠️ Analysis failed: ${err.message}`);
      sound.playRoast();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    sound.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden'
    }}>
      {/* Scratchpad Header Toolbar */}
      <div style={{
        padding: '10px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {/* Presets Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Problem:</span>
          <select
            value={selectedPreset}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="glass-input"
            style={{ padding: '6px 12px', fontSize: '13px', background: '#0f172a' }}
          >
            {PROBLEM_PRESETS.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleRunCode}
            className="btn btn-emerald"
            style={{ padding: '6px 14px', fontSize: '13px' }}
            title="Execute JavaScript in Browser"
          >
            <Play size={14} />
            <span>Run Code</span>
          </button>

          <button
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
            title="Inspect Big-O Complexity & Edge Cases"
          >
            <Flame size={14} />
            <span>{isAnalyzing ? 'Analyzing Big-O...' : 'Analyze with Sensei'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            title="Copy Code"
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Editor & Console Split View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: aiAnalysis ? '1fr 340px' : '1fr 320px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Code Editor Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border-subtle)',
          minHeight: 0
        }}>
          <div style={{
            padding: '6px 14px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>JavaScript Scratchpad</span>
            <span>UTF-8</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              background: '#090d16',
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              lineHeight: 1.6,
              padding: '16px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              whiteSpace: 'pre'
            }}
          />
        </div>

        {/* Right Output Drawer (Console or AI Analysis) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(11, 16, 28, 0.7)',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Output Header */}
          <div style={{
            padding: '8px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
              <Terminal size={14} color="var(--accent-cyan)" />
              <span>{aiAnalysis ? 'AI Big-O & Complexity Report' : 'Console Output'}</span>
            </div>
            {executionTime && !aiAnalysis && (
              <span style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>
                ⚡ {executionTime}ms
              </span>
            )}
            {aiAnalysis && (
              <button
                onClick={() => setAiAnalysis(null)}
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                Back to Output
              </button>
            )}
          </div>

          {/* Output Content */}
          <div style={{
            flex: 1,
            padding: '14px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            lineHeight: 1.6
          }}>
            {aiAnalysis ? (
              <div className="animate-fade-in" style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {aiAnalysis}
              </div>
            ) : consoleOutput ? (
              <div style={{ color: consoleOutput.startsWith('❌') ? 'var(--accent-rose)' : '#6ee7b7', whiteSpace: 'pre-wrap' }}>
                {consoleOutput}
              </div>
            ) : (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '40px', fontSize: '12px' }}>
                Press <strong>Run Code</strong> to execute or <strong>Analyze with Sensei</strong> for Big-O breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
